# LLM Module Documentation

## 📁 Module Structure

The LLM functionality is modularized into separate files for easy maintenance and merging:

```
src/
├── llm.js           # Core LLM parsing logic
├── llm-config.js    # UI configuration for preferences
├── lyric.js         # Imports and uses LLM module
├── prefs.js         # Imports LLM config
├── mpris.js         # Adds isVideo flag
├── extension.js     # Handles isVideo flag propagation
└── const.js         # LLM-related constants (LLMEP, LLMMD, LLMAK)
```

## 🔧 Module Files

### 1. `src/llm.js`
**Core LLM functionality**
- `LLMParser` class: Handles LLM API calls
- `parseVideoTitle()`: Main parsing method
- `shouldUseLLM()`: Helper to check if LLM should be used
- **Dependencies**: `Soup`, `GLib`, `util.js`, `const.js`

### 2. `src/llm-config.js`
**UI configuration**
- `getLLMSettingsGroup()`: Returns settings UI configuration
- `LLM_SETTINGS_KEYS`: Array of setting keys to bind
- **Dependencies**: `ui.js`, `const.js`

### 3. Integration Points

#### In `lyric.js`:
```javascript
import {LLMParser, shouldUseLLM} from './llm.js';

constructor(set) {
    // ...
    this.llmParser = new LLMParser(this);
}

async load(song, reload, cancel) {
    if (shouldUseLLM(song)) {
        processedSong = await this.llmParser.parseVideoTitle(song, cancel, this.$src.client.hub);
    }
}
```

#### In `prefs.js`:
```javascript
import {getLLMSettingsGroup} from './llm-config.js';

$buildUI() {
    return this.$buildPage([
        // ... other groups
        getLLMSettingsGroup()  // LLM settings group
    ]);
}
```

#### In `mpris.js`:
```javascript
this.emit('update', {
    // ... other fields
    isVideo: this.isCurrentPlayerVideo(),  // Mark video source
});
```

## 🔄 Merging with Main Branch

When merging changes from the main branch:

1. **Core files that may conflict**:
   - `lyric.js`: Only LLM import and usage lines
   - `prefs.js`: Only LLM config import and group
   - `mpris.js`: Only `isVideo` flag line
   - `extension.js`: Only `isVideo` propagation lines
   - `const.js`: Only LLM constants (LLMEP, LLMMD, LLMAK)
   - `schemas.gschema.xml.in`: Only LLM settings keys

2. **LLM-specific files (no conflicts)**:
   - `llm.js`: Standalone module
   - `llm-config.js`: Standalone module

## 🎯 Benefits of Modularization

1. **Easy to maintain**: LLM logic is isolated
2. **Easy to merge**: Minimal changes to core files
3. **Easy to disable**: Remove imports and module files
4. **Easy to extend**: Add new features in `llm.js`
5. **Clear separation**: UI config separate from logic

## 🚀 Future Enhancements

Potential improvements that can be added to `llm.js`:

- Support for multiple LLM providers
- Caching of LLM results
- Fallback to regex-based parsing
- Custom prompts per language
- Batch processing for multiple titles
- Model-specific optimizations

## 📝 Testing

After modularization, test:
1. Video title parsing still works
2. Settings UI loads correctly
3. Music players are not affected
4. LLM fallback works on errors
5. Logs are still generated

## 🔍 Debugging

All LLM logs are prefixed with `[LLM]`:
```bash
journalctl --user --since "1 minute ago" | grep "\[LLM\]"
```

Core integration logs use `[Lyric]`:
```bash
journalctl --user --since "1 minute ago" | grep "\[Lyric\]"
```
