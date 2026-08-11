# Claude Code 與爪爪 — 桌面寵物

爪爪是 Claude Code 的桌面伴侶，會根據 Claude Code 的工作狀態切換動畫。

## 架構

1. **Claude Code hooks**（在 `~/.claude/settings.json`）→ 每次工具呼叫 / session 結束時寫事件到 `%LOCALAPPDATA%\clawd\state.json`
2. **Electron app** → 每秒讀取 state.json + speech.json，切換動畫 + 顯示台詞

## 動畫狀態

| 事件 | 動畫 | 素材 |
|------|------|------|
| tool_call（工作中） | 打字 | assets/typing.png（23幀，320x320，循環） |
| stop / clap（完成） | 拍手 | assets/clapping.png（11幀，256x256，播2次淡出） |
| sunglasses（全部完成） | 墨鏡 | assets/sunglasses.png（13幀，128x128，播1次淡出） |
| idle / 閒置60秒 | 耳機聽音樂 | assets/headphones.png（6幀，128x128，播2輪淡出，renderSize 108） |
| coffee（給咖啡） | 拿鐵 | assets/latte.png（45幀，160x160，播1次淡出） |

## 即時台詞系統

爪爪頭上有飄動變色的名字標籤，上方有說話泡泡。台詞有兩個來源：

### 1. 預設台詞池（自動）
打字狀態下每 35 秒有機率隨機說一句，動畫切換時也會自動說一句。台詞定義在 `index.html` 的 `SPEECH` 物件。

### 2. 即時台詞（Claude Code 手動寫入）
Claude Code 可以在工作時寫入即時台詞，爪爪不需要重啟就能顯示：

```bash
printf '{"text":"正在查程式碼","timestamp":%s000}' "$(date +%s)" > "$LOCALAPPDATA/clawd/speech.json"
```

台詞應該要短（10 字以內最好），反映 Claude Code 當下正在做什麼。每個 timestamp 只顯示一次，新的 timestamp 會覆蓋舊的。

## 隱私原則

這個專案**不讀取任何使用者檔案**，只透過 Claude Code 的公開 hooks API 接收事件類型（"tool_call" / "stop"），不含對話內容。可以安全分享。

## 啟動

```
wscript launch_hidden.vbs
```

## 系統匣選單

自訂暗色底 BrowserWindow 彈出選單（tray-menu.html），不依賴 Windows 主題。左鍵或右鍵點擊系統匣圖示都會開啟。
