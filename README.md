<!--
SPDX-FileCopyrightText: tuberry
SPDX-FileCopyrightText: NowloadY
SPDX-License-Identifier: CC-BY-SA-4.0
-->
# [desktop-lyric](https://github.com/tuberry/desktop-lyric)

GNOME Shell extension to show the singing lyric on the desktop.

**LLM-Enhance Version**

## Installation

### Manual

The latest and supported version should only work on the [current stable version](https://release.gnome.org/calendar/#branches) of GNOME Shell.

```bash
git clone https://github.com/tuberry/desktop-lyric.git && cd desktop-lyric
meson setup build && meson install -C build
# meson setup build -Dtarget=system && meson install -C build # system-wide, default --prefix=/usr/local
```
or
```bash
bash cli/install.sh
```
For older versions, it's recommended to install via:

```bash
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell \
          --method org.gnome.Shell.Extensions.InstallRemoteExtension 'desktop-lyric@tuberry'
```

It's quite the same as installing from:

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
