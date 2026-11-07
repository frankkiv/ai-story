# 網站規格（SPEC）

這份文件說明「AI 長出手了」這個網站在做什麼、寫給誰、怎麼組織，以及寫作與設計的規則。任何人或任何 AI agent 接手時，先讀這份，再讀 [MAINTAINING.md](MAINTAINING.md)。

## 1. 目的

用一個網站講清楚 2022 年底到現在 AI 的變化，重點放在「它其實是怎麼運作的」：

- 模型本身不會因為你跟它聊天而改變。它每次都把整份 context（規則、工具、記憶、對話紀錄）重讀一遍。
- 「AI 越用越懂你」，其實是你電腦上的紀錄、記憶檔、skills 越來越多。
- 中國 AI 怎麼追上來，蒸餾和反蒸餾的爭議。
- 下一個瓶頸：電、記憶體、硬碟。

## 2. 讀者

兩層讀者，同一頁要同時照顧到：

1. **工程師**：想看細節、想要正確的技術描述（prompt cache、tool_use、KV cache）。
2. **工程師的爸媽和一般人**：每個重要概念旁邊放一個「白話說」框，用生活比喻講一次。

首頁最下方的「五個提醒」和「爸媽常問」是給一般人的實用收尾，可以直接轉傳。

## 3. 頁面結構

| 檔案 | 分頁名稱（手機短名） | 內容 |
|---|---|---|
| `index.html` | 首頁 | Hero、3D context 堆疊圖、五個分頁的入口卡、五個提醒、爸媽常問 |
| `history.html` | 時間線 | 捲動式時間線：中軸隨捲動填滿、事件依序出現、分類篩選、右下角年份標籤、資料來源 |
| `bench.html` | 模型評比（評比） | 分數為什麼不能全信、能力曲線、第三方對照表、廠商自家表、誰擅長什麼、命名對照、模型名冊、資料來源 |
| `tech.html` | 它怎麼運作（原理） | 誤會、一次請求的組成、互動模擬器、prompt cache、agent 迴圈、AI IDE 的 Auto 模式、手機與電腦同步、記憶與 skills |
| `china.html` | 追趕與蒸餾（中國追趕） | 中國各家、追上來的原因、蒸餾是什麼、指控時間線、攻防對照、爭議、能不能用中國 AI App |
| `future.html` | 下一個瓶頸（瓶頸） | 電力（含換算器）、資料中心、台灣角度、記憶體（含 KV cache 計算器）、儲存、常見問題 |
| `assets/site.css` | | 全站共用樣式與設計 token |

**所有 benchmark 內容只放在 `bench.html`。** 其他頁面要提到分數，用連結指過去，不要另外畫圖或放表格（`china.html` 的蒸餾實驗長條圖例外，那是在講蒸餾，不是比模型）。

分頁順序固定為 PART 1–5：時間線、模型評比、它怎麼運作、追趕與蒸餾、下一個瓶頸。新增或調整分頁時，要同步改：每一頁的導覽列、首頁入口卡、各頁 hero 的 `PART n` 標籤、`history.html` 底部的「下一部分」卡片。

## 4. 寫作規則

- 繁體中文，台灣用語（「程式」、「資料」、「伺服器」、「影片」）。
- 完整句子，口語但專業。不要用破折號串句子，不要用箭頭鏈取代句子。
- 每個大概念配一個「白話說」框（HTML：`<p class="elder"><b>白話說</b><span>…</span></p>`；時間線內用 `<p class="tl-elder">`）。
- 英文術語第一次出現時，給一句中文解釋。
- 數字一定要有來源，列在該頁底部的「資料來源」。
- 區分「廠商自己報的」和「第三方重測的」數字，表格和說明裡都要標清楚。
- 爭議題（蒸餾、中國模型）兩邊都寫，明講「指控是提出方的說法」。
- 查不到確切日期就寫「2026 上半年」「月份未確認」，不要猜。
- 頁尾寫「寫於 YYYY 年 M 月」，大改版時更新。

## 5. 設計規則

- 純靜態：HTML、CSS、少量原生 JS，沒有建置步驟，沒有框架。
- 字型：Geist、Geist Mono、Noto Sans TC（Google Fonts）。不載入其他外部 JS。
- 顏色只用 `assets/site.css` 裡 `:root` 定義的 token。深色模式用 `prefers-color-scheme` 和 `[data-theme]` 兩組覆寫，新顏色要三處都加。
- 「context 的每一層」各有固定顏色，全站一致：
  - `--l-tools` tools／MCP、`--l-sys` system prompt、`--l-skills` skills、`--l-mem` 記憶、`--l-hist` 對話紀錄、`--l-new` 新訊息、`--l-out` 模型輸出。
  - 時間線分類沿用：模型 `--l-hist`、Agent `--l-new`、中國 `--l-mem`、基礎設施 `--l-skills`。
  - 評比的廠商色：Anthropic `--l-skills`、OpenAI `--text`、Google `--l-hist`、中國 `--l-mem`。
- 手機優先：390px 寬不能有橫向捲動；最小字級約 13px（`.82rem`）；可點範圍至少 40px。
- 手機上只有一條吸頂列：主導覽列在手機上會捲走，各頁自己的列（`.toc`、`.tl-bar`）吸頂。
- 動畫要尊重 `prefers-reduced-motion`。
- grid／flex 子元素如果裝表格或程式碼，要加 `min-width: 0`，否則手機會撐破版面。

## 6. 互動元件

| 元件 | 位置 | 說明 |
|---|---|---|
| 3D context 堆疊 | `index.html`、`tech.html` hero | CSS 3D；手機上文字隱藏，改顯示 `.stack-legend` 直式圖例 |
| 捲動時間線 | `history.html` | IntersectionObserver 讓事件出現；捲動進度驅動 `#tlFill` 和年份標籤 |
| 能力曲線 | `bench.html#bench` | SVG 折線圖，手機開啟時自動捲到最右（最新）；點圓點會在名冊標出該列 |
| 對照表 | `bench.html#matrix` | 點欄位名稱排序；手機第一欄固定 |
| 模型名冊 | `bench.html#roster-sec` | 依廠商篩選，依日期新到舊 |
| context 模擬器 | `tech.html#sim` | 三區：你的電腦／這次送出的 context／模型。8 步導覽加自由操作。重點訊息：模型被改的次數永遠是 0 |
| 電力換算器、KV cache 計算器 | `future.html` | 滑桿換算 |

## 7. 驗收

改完任何頁面：

1. 本機預覽：`python3 -m http.server 8000`，打開 http://localhost:8000/ 。
2. 至少看 390×844（手機）和 1280×900（桌機），淺色和深色各一次。
3. 檢查：沒有 JS 錯誤、`document.documentElement.scrollWidth` 等於視窗寬、手機導覽列沒有被切掉。
4. 有 Playwright 的話可以用腳本截圖；沒有就用瀏覽器開發者工具的裝置模擬。

## 8. 發布

GitHub Pages，從 `main` 分支根目錄發布（根目錄有 `.nojekyll`）。push 到 `main` 後大約一分鐘自動更新：https://frankkiv.github.io/ai-story/
