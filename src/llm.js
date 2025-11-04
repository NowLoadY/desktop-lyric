// SPDX-FileCopyrightText: NowLoadY
// SPDX-License-Identifier: GPL-3.0-or-later

import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

import * as T from './util.js';
import {Key as K} from './const.js';

/**
 * LLM-powered video title parser
 * Extracts clean song title and artist from messy video titles
 */
export class LLMParser {
    constructor(settings) {
        this.settings = settings;
    }

    /**
     * Parse video title using LLM API
     * @param {Object} song - Song object with title and artist
     * @param {Object} cancel - Cancellable for async operations
     * @param {Object} soupSession - Soup.Session for HTTP requests
     * @returns {Promise<Object>} Processed song object
     */
    async parseVideoTitle(song, cancel, soupSession) {
        try {
            const apiEndpoint = this.settings[K.LLMEP];
            const apiKey = this.settings[K.LLMAK];
            const model = this.settings[K.LLMMD];
            
            const prompt = `You must parse this video title and extract the song name and artist, then return ONLY a valid JSON object with no additional text, explanation, or markdown formatting.

Video Title: ${song.title}
MPRIS Artist (may be uploader): ${song.artist.join(', ') || 'unknown'}

Rules:
- Remove tags like 【game】, (Official Video), (cover), (CV: xxx), channel names, etc.
- Extract the actual song title and artist name
- For covers, the artist is the cover singer, not the original artist
- If artist is unclear, return empty array

Required JSON format (ONLY return this, nothing else):
{"title": "song name", "artist": ["artist name"]}

Examples:
Input: "【ゼンゼロ】モエチャッカファイア / エレン・ジョー（CV：若山詩音）cover"
Output: {"title": "モエチャッカファイア", "artist": ["エレン・ジョー"]}

Input: "キャットラビング/沙花叉クロヱ(cover)"
Output: {"title": "キャットラビング", "artist": ["沙花叉クロヱ"]}

Input: "Look at the Sky - Porter Robinson (Official Video)"
Output: {"title": "Look at the Sky", "artist": ["Porter Robinson"]}

Input: "「Vivy- Fluorite Eye's Song」 ed /八木海莉- Fluorite Eye's Song (日中歌詞)"
Output: {"title": "Fluorite Eye's Song", "artist": ["八木海莉"]}

Input: "DECO*27 - Rabbit Hole feat. Hatsune Miku"
Output: {"title": "Rabbit Hole", "artist": ["DECO*27"]}

Now parse and return JSON only:`;

            const requestBody = {
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 200
            };

            console.log(`[LLM] ========== Start Processing ==========`);
            console.log(`[LLM] Endpoint: ${apiEndpoint}`);
            console.log(`[LLM] Model: ${model}`);
            console.log(`[LLM] Input Title: ${song.title}`);
            console.log(`[LLM] Input Artist: [${song.artist.join(', ')}]`);
            
            // Create HTTP request with JSON body
            const msg = Soup.Message.new('POST', apiEndpoint);
            msg.request_headers.append('Content-Type', 'application/json');
            msg.request_headers.append('Authorization', `Bearer ${apiKey}`);
            
            const bodyBytes = new TextEncoder().encode(JSON.stringify(requestBody));
            msg.set_request_body_from_bytes('application/json', new GLib.Bytes(bodyBytes));
            
            const responseBytes = await soupSession.send_and_read_async(
                msg,
                GLib.PRIORITY_DEFAULT,
                cancel
            );
            
            if (msg.statusCode !== 200) {
                throw Error(`HTTP ${msg.statusCode}: ${msg.get_reason_phrase()}`);
            }
            
            const responseText = T.decode(responseBytes.get_data());
            console.log(`[LLM] Raw response: ${responseText.substring(0, 500)}...`);
            
            const result = JSON.parse(responseText);
            const content = result.choices[0].message.content;
            console.log(`[LLM] Message content: ${content}`);
            
            const parsed = JSON.parse(content);
            console.log(`[LLM] Parsed JSON: ${JSON.stringify(parsed)}`);
            
            // Validate and return processed song
            if (parsed.title && typeof parsed.title === 'string') {
                const processedResult = {
                    ...song,
                    title: parsed.title.trim(),
                    artist: Array.isArray(parsed.artist) ? parsed.artist.filter(a => a && a.trim()) : []
                };
                console.log(`[LLM] ✓ Success - Output Title: "${processedResult.title}", Artist: [${processedResult.artist.join(', ')}]`);
                console.log(`[LLM] ========== End Processing ==========`);
                return processedResult;
            }
            
            // If parsing failed, return original
            console.log(`[LLM] ✗ Invalid response format, using original`);
            console.log(`[LLM] ========== End Processing ==========`);
            return song;
            
        } catch(e) {
            console.log(`[LLM] ✗ Error: ${e}`);
            console.log(`[LLM] Stack: ${e.stack || 'no stack trace'}`);
            console.log(`[LLM] Falling back to original title`);
            console.log(`[LLM] ========== End Processing ==========`);
            return song;
        }
    }
}

/**
 * Check if LLM processing should be triggered
 * @param {Object} song - Song object
 * @returns {boolean} True if should use LLM
 */
export function shouldUseLLM(song) {
    return song.isVideo === true;
}
