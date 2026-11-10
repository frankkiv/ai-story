# AI 長出手了 · 從聊天到代理

線上網站：<https://frankkiv.github.io/ai-story/>

一個靜態網站，用繁體中文講 AI 這幾年的變化：

- `index.html`：首頁，兩條入口（序章或從 PART 1 讀起）
- `family.html`：給家人的五個提醒、詐騙情境演練與常見問題，可以單獨轉傳
- `glossary.html`：名詞小辭典
- `myths.html`：「真的還是假的」小遊戲
- `history.html`：時間線
- `bench.html`：模型評比（分數怎麼看、各模型對照、誰擅長什麼、模型名冊）
- `tech.html`：它怎麼運作（context、prompt cache、agent 迴圈、Auto 模式、同步、多 agent 協作、skills）
- `journey.html`：序章，按下 Enter 之後（捲動敘事導覽，從本地組合、送到遠端、傳回來到手機同步）
- `china.html`：追趕與蒸餾
- `future.html`：下一個瓶頸（電力、資料中心、記憶體、儲存）

英文版在 `en/` 底下（例如 `en/index.html`），右上角齒輪可以切換語言和淺色／深色。

沒有建置步驟，純 HTML／CSS／JS，共用樣式在 `assets/site.css`。直接用 GitHub Pages 從 repo 根目錄發布即可。

網站規格與維護方式見 [docs/SPEC.md](docs/SPEC.md) 和 [docs/MAINTAINING.md](docs/MAINTAINING.md)。

內容寫於 2026 年 11 月，數字來源列在各頁底部。
