// SPDX-FileCopyrightText: tuberry
// SPDX-License-Identifier: GPL-3.0-or-later

import * as UI from './ui.js';
import {Key as K} from './const.js';

const {_} = UI;

/**
 * LLM configuration UI for preferences
 * Returns the settings group configuration
 */
export function getLLMSettingsGroup() {
    return [
        [[_('LLM API'), _('AI-powered video title parsing for better lyric matching')]], 
        [
            [[_('API _Endpoint'), _('OpenAI-compatible API endpoint (e.g., Ollama, OpenAI, etc.)')], K.LLMEP],
            [[_('_Model'), _('LLM model name (e.g., qwen2.5:3b, gpt-4, gpt-3.5-turbo)')], K.LLMMD],
            [[_('API _Key'), _('API key for authentication (use "ollama" for local Ollama)')], K.LLMAK],
        ]
    ];
}

/**
 * LLM settings keys to bind
 */
export const LLM_SETTINGS_KEYS = [K.LLMEP, K.LLMMD, K.LLMAK];
