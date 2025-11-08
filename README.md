<!--
SPDX-FileCopyrightText: tuberry
SPDX-FileCopyrightText: NowloadY
SPDX-License-Identifier: CC-BY-SA-4.0
-->
# [desktop-lyric](https://github.com/tuberry/desktop-lyric)

GNOME Shell extension to show the singing lyric on the desktop.

**LLM-Enhance Version**

Gnome version:49

## Installation

### Manual

```bash
git clone https://github.com/tuberry/desktop-lyric.git && cd desktop-lyric
bash cli/install.sh
```

```bash
# pull ollama model
ollama pull gemma3:1b
```
Or use any model supported by Ollama. You can also switch to an online model (e.g., GPT, Claude) in preferences (UNtested).

### Translations

To initialize or update the po file from sources:

```bash
bash ./cli/update-po.sh [your_lang_code] # like zh_CN, default to $LANG
```

## Acknowledgements
* [desktop-lyric](https://github.com/tuberry/desktop-lyric): basement
* [lyrics-finder]: online lyrics
* [osdlyrics]: some names

[license]:https://img.shields.io/badge/license-GPLv3+-green.svg
[lyrics-finder]:https://github.com/TheWeirdDev/lyrics-finder-gnome-ext
[osdlyrics]:https://github.com/osdlyrics/osdlyrics
[EGO]:https://extensions.gnome.org/extension/4006/desktop-lyric/
