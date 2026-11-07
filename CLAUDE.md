# 給接手的 AI agent

這是一個純靜態網站（GitHub Pages），內容是繁體中文的 AI 科普。開始工作前請先讀：

1. [docs/SPEC.md](docs/SPEC.md)：網站目的、讀者、頁面結構、寫作與設計規則、驗收方式。
2. [docs/MAINTAINING.md](docs/MAINTAINING.md)：時間線和模型評比的資料格式與更新流程。

重點提醒：

- 沒有建置步驟。預覽：`python3 -m http.server 8000`。
- 所有 benchmark 內容只放在 `bench.html`。
- 數字要查證、要列來源，並區分廠商自報與第三方重測。
- 改完要在 390px 手機寬和桌機寬、淺色和深色各看一次，不能有橫向捲動。
- push 到 `main` 就會自動部署到 https://frankkiv.github.io/ai-story/
