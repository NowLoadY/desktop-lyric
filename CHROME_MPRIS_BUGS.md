# Chrome MPRIS 已知问题

## 问题描述

在使用 Chrome/Chromium 播放 YouTube 视频时，桌面歌词扩展存在同步问题，表现为：
- 视频刚开始播放，歌词已经显示到中间或末尾
- 歌词位置与视频播放位置不匹配
- 手动点击进度条后切换视频，新视频歌词不同步

## 根本原因

### Chrome MPRIS 的 `mpris:length` bug

Chrome 的 MPRIS 实现存在严重缺陷，metadata 更新不是原子化的：

**正常流程（期望）：**
```
切换视频 → MPRIS 发送新视频的完整正确 metadata
```

**实际流程（Chrome bug）：**
```
1. 切换视频
2. MPRIS 发送 metadata（length = 上一个视频的长度）  ← 错误的旧值
3. 2-5 秒后，MPRIS 发送 metadata（length = 正确的长度）
4. 但随后又反复发送 metadata（length = 旧值）      ← 又变回错误
```

**日志示例：**
```
[MPRIS] update - "Porter Robinson - Mona Lisa" | Length: 122500ms  ← 旧视频的长度
[MPRIS] update - "Porter Robinson - Mona Lisa" | Length: 225421ms  ← 正确！
[MPRIS] update - "Porter Robinson - Mona Lisa" | Length: 225421ms
[MPRIS] update - "Porter Robinson - Mona Lisa" | Length: 122500ms  ← 又错了
[MPRIS] update - "Porter Robinson - Mona Lisa" | Length: 122500ms
```

**后果：**
- 如果歌词在错误的 length 期间加载完成，`setLyrics()` 会基于错误的 length 计算歌词时间分布
- 例如：实际 225 秒的视频，但用 122 秒计算分布
- 当前播放位置 60 秒：60/122 ≈ 49%，显示歌词的 49% 位置
- 应该是：60/225 ≈ 27%，显示歌词的 27% 位置
- 导致歌词跳到了后面

## 测试环境

- **系统**: GNOME Shell
- **播放器**: Chrome/Chromium (YouTube)
- **MPRIS 版本**: Chrome 内置实现
- **LLM**: Ollama (gemma3:1b)

## 对比：其他播放器

- **Spotify, Rhythmbox**: MPRIS 实现更可靠，length 通常立即正确

## 尝试的修复方案

### 方案 1: 在 setLyric 中读取最新 metadata ❌
```javascript
const player = this.$src.mpris.$src.player.hub;
const latestLength = player.Metadata['mpris:length'].deepUnpack() / 1000;
```
**失败原因**: 当 setLyric 执行时，metadata 本身还是旧值，Chrome 还没发送正确值

### 方案 2: Length 增大时重新同步 ❌
```javascript
if (newLength > oldLength) {
    // 重新同步位置
}
```
**失败原因**: Chrome 会在正确值之后又发送错误的旧值，导致正确值被覆盖

### 方案 3: 使用时间窗口判断 ❌
```javascript
if (timeSinceUpdate < 10000 && newLength > oldLength) {
    // 接受
} else if (timeSinceUpdate < 10000 && newLength < oldLength) {
    // 拒绝
}
```
**失败原因**: 过于复杂，且无法处理所有边界情况

### 方案 4: Length 锁定机制 ❌
```javascript
if (lyricLines > 1) {
    this.$lockedLength = this.song.length; // 锁定
}
if (newLength < this.$lockedLength - threshold) {
    newLength = this.$lockedLength; // 拒绝减小
}
```
**失败原因**: 
- 可能误拦截正常的 length 减小（短版本、精确调整）
- 逻辑复杂，难以维护
- 治标不治本

## 结论

这是 **Chrome MPRIS 实现的 bug**，在扩展层面无法完美修复，因为：

1. Chrome 发送的 metadata 本身就是错误的
2. 无法预测何时会收到正确值
3. 无法区分"错误的旧值"和"合理的新值"

**建议：**
- 在文档中说明这是 Chrome 的已知问题
- 提供手动"Reload"功能重新加载歌词
- 向 Chromium 项目报告此 bug
- 考虑使用其他浏览器（Firefox）或原生播放器

## 参考

- PR#29: https://github.com/tuberry/desktop-lyric/pull/29
- Chromium Bug Tracker: (待报告)
