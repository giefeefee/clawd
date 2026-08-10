# Claude Code 與爪爪 — 桌面寵物

爪爪是 Claude Code 的桌面伴侶，會根據 Claude Code 的工作狀態切換動畫。

## 架構

1. **Claude Code hooks** → 執行 `hooks/clawd-state.js`，把事件寫進 `%LOCALAPPDATA%\clawd\state.json`
2. **Electron app** → 每秒讀取 state.json，根據事件類型切換動畫

## 動畫狀態

| 事件 | 動畫 | 素材 |
|------|------|------|
| tool_call（工作中） | 打字 | assets/typing.png（23幀，320x320） |
| stop（完成一階段） | 拍手 | assets/clapping.png（11幀，256x256） |
| 全部完成 | 墨鏡 | 待畫 |
| 閒置 | 耳機聽音樂 | 待畫 |
| coffee（給咖啡） | 拿鐵 | 待匯出 |

## 隱私原則

這個專案**不讀取任何使用者檔案**，只透過 Claude Code 的公開 hooks API 接收事件類型（"tool_call" / "stop"），不含對話內容。可以安全分享。

## 啟動

```
wscript launch_hidden.vbs
```

## Hook 設定

在 Claude Code 的 settings.json 加入：
```json
{
  "hooks": {
    "PreToolCall": [{ "type": "command", "command": "node \"<專案路徑>/hooks/clawd-state.js\" tool_call" }],
    "Stop": [{ "type": "command", "command": "node \"<專案路徑>/hooks/clawd-state.js\" stop" }]
  }
}
```
