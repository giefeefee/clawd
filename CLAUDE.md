# Claude Code 與爪爪 — 桌面寵物

爪爪是 Claude Code 的桌面伴侶，會根據 Claude Code 的工作狀態切換動畫。

## 架構

1. **Claude Code hooks** → 執行 `hooks/clawd-state.js`，把事件寫進 `%LOCALAPPDATA%\clawd\state.json`
2. **Electron app** → 每秒讀取 state.json，根據事件類型切換動畫

## 動畫狀態

| 事件 | 動畫 | 素材 |
|------|------|------|
| tool_call（工作中） | 打字 | assets/typing.png（23幀，320x320，循環） |
| stop / clap（完成） | 拍手 | assets/clapping.png（11幀，256x256，播2次淡出） |
| sunglasses（全部完成） | 墨鏡 | assets/sunglasses.png（13幀，128x128，播完循環尾巴12次再淡出） |
| idle / 閒置60秒 | 耳機聽音樂 | assets/headphones.png（6幀，128x128，循環，renderSize 108） |
| coffee（給咖啡） | 拿鐵 | assets/latte.png（45幀，160x160，播1次淡出） |

## 隱私原則

這個專案**不讀取任何使用者檔案**，只透過 Claude Code 的公開 hooks API 接收事件類型（"tool_call" / "stop"），不含對話內容。可以安全分享。

## 啟動

```
wscript launch_hidden.vbs
```

## 系統匣選單

自訂暗色底 BrowserWindow 彈出選單（tray-menu.html），不依賴 Windows 主題。左鍵或右鍵點擊系統匣圖示都會開啟。

## Hook 設定

在 `~/.claude/settings.json` 的 hooks 區塊：
- `PostToolUse`（全工具）→ bash printf 寫 "tool_call" 到 `%LOCALAPPDATA%\clawd\state.json`
- `Stop` → 寫 "stop" 到同一檔案
