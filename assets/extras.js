/* Site-wide extras, loaded with defer on every page:
   1. glossary data, tap-to-explain terms in the text, and the glossary page list
   2. site search (reads the pages themselves the first time you search; no index file to rebuild)
   3. "continue where you left off" link on the home page
   4. print helper
   Keep both languages in step when you edit the glossary. */
(function () {
  "use strict";
  var html = document.documentElement, en = /^en/i.test(html.lang);
  var page = location.pathname.split("/").pop() || "index.html";
  if (!/\.html$/.test(page)) page = "index.html";
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  var T = en ? {
    all: "All terms →", close: "Close", gloss: "Glossary",
    search: "Search the site", ph: "Search, e.g. cache, HBM, distillation", loading: "Reading the pages…", none: "Nothing found. Try a shorter word.", hint: "Type at least two letters.", fail: "Search could not load the pages. Check your connection and try again.",
    cont: "Continue: ", results: "results"
  } : {
    all: "看全部名詞 →", close: "關閉", gloss: "名詞小辭典",
    search: "搜尋全站", ph: "搜尋，例如 cache、HBM、蒸餾", loading: "正在讀取各頁內容…", none: "找不到。換個短一點的詞試試。", hint: "請輸入至少兩個字。", fail: "讀不到頁面內容，請檢查網路後再試一次。",
    cont: "繼續讀：", results: "筆結果"
  };

  /* ---------- 1. Glossary ---------- */
  // m: what to match in running text (longest first wins). Definitions follow the wording used on the pages.
  var G = [
    { id: "context", zh: ["context（上下文）", "模型這一次要讀的全部內容：規則、工具說明、記憶、對話紀錄，加上你剛打的那一句。"], en: ["context", "Everything the model reads for this one request: rules, tool descriptions, memory, the chat history, plus what you just typed."], m: ["context"] },
    { id: "token", zh: ["token", "模型處理文字的最小單位，可能是一個字、半個詞或一段英文。"], en: ["token", "The smallest unit of text a model works with: a character, part of a word, or a short piece of English."], m: ["tokens", "token"] },
    { id: "agent", zh: ["agent（代理）", "會自己動手做事的 AI。模型說要用哪個工具，你這邊的程式去執行，再把結果交回給模型，一圈一圈做到完成。"], en: ["agent", "An AI that does the work itself. The model says which tool it wants, a program on your side runs it, the result goes back to the model, and the loop repeats until the job is done."], m: ["agents", "agent"] },
    { id: "system-prompt", zh: ["system prompt（系統提示）", "每次對話開頭都會帶進去的規則，由 App 或開發者事先寫好。"], en: ["system prompt", "The rules placed at the start of every conversation, written in advance by the app or the developer."], m: ["system prompt", "系統提示"] },
    { id: "prompt-cache", zh: ["prompt cache（提示快取）", "伺服器把讀過的開頭暫存起來。下次送來的開頭一樣，就不用重算，所以比較快、也比較便宜。"], en: ["prompt cache", "The server keeps the already-read beginning of a request for a while. If the next request starts the same way, it skips the recomputation, so it is faster and cheaper."], m: ["prompt cache", "提示快取"] },
    { id: "kv-cache", zh: ["KV cache", "模型讀每個 token 時留下的中間結果，生成回答時會一直回頭查。它很佔記憶體。"], en: ["KV cache", "The intermediate results a model keeps for each token it has read, and keeps looking back at while it writes. It takes a lot of memory."], m: ["KV cache"] },
    { id: "mcp", zh: ["MCP", "讓各種工具用同一種格式接上 AI 的標準，像 AI 的 USB-C。"], en: ["MCP", "A standard that lets any tool plug into AI in the same format, like USB-C for AI."], m: ["MCP"] },
    { id: "skills", zh: ["skills（技能）", "寫成檔案的做事方法。平常只列出清單，用得到的時候才把內容讀進 context。"], en: ["skills", "Ways of doing a task, written down as files. Normally only the list is loaded; the content is read into the context when it is needed."], m: ["skills"] },
    { id: "weights", zh: ["權重（weights）", "模型裡那一大堆數字。訓練完就固定，你跟它聊天不會改變它。"], en: ["weights", "The huge set of numbers inside a model. They are fixed once training ends, and chatting does not change them."], m: ["模型權重", "權重", "weights"] },
    { id: "inference", zh: ["推論（inference）", "用固定的權重算出回答的過程，也就是「使用」模型。"], en: ["inference", "Using the fixed weights to compute an answer; in other words, using the model."], m: ["推論", "inference"] },
    { id: "distillation", zh: ["蒸餾（distillation）", "拿一個大模型的回答當教材，訓練另一個比較小、比較便宜的模型。"], en: ["distillation", "Training a smaller, cheaper model on the answers of a large one."], m: ["蒸餾", "distillation"] },
    { id: "open-weights", zh: ["開放權重", "模型的權重公開讓人下載，可以放在自己的伺服器上跑。"], en: ["open weights", "The model's weights are published for download, so you can run it on your own servers."], m: ["開放權重", "open weights", "open-weight"] },
    { id: "benchmark", zh: ["benchmark（評比考試）", "用同一份題目測不同模型的考試。分數有參考價值，但廠商自己報的通常偏高。"], en: ["benchmark", "An exam that tests different models on the same questions. Scores are useful, but vendor-reported ones tend to run high."], m: ["benchmarks", "benchmark"] },
    { id: "swe-bench", zh: ["SWE-bench", "用真實開源專案的問題考 AI 修程式的考卷。Verified 版有 500 題，Pro 版更難。"], en: ["SWE-bench", "An exam that asks AI to fix real issues from open-source projects. The Verified set has 500 problems; the Pro set is harder."], m: ["SWE-bench"] },
    { id: "hbm", zh: ["HBM（高頻寬記憶體）", "放在 GPU 旁邊的高速記憶體，用來裝模型權重和每段對話的 KV cache。"], en: ["HBM (high-bandwidth memory)", "Fast memory that sits next to the GPU and holds the model weights and each conversation's KV cache."], m: ["HBM"] },
    { id: "gpu", zh: ["GPU", "擅長大量平行計算的晶片，模型就在上面跑。"], en: ["GPU", "A chip that is good at massive parallel computation. Models run on it."], m: ["GPU"] },
    { id: "api", zh: ["API", "程式之間講好的收件窗口。App 透過它把請求送給模型。"], en: ["API", "The agreed front desk between programs. Apps use it to send requests to the model."], m: ["API"] },
    { id: "prompt-injection", zh: ["prompt injection（提示注入）", "壞人在網頁、信件或檔案裡藏一句指令。模型讀到後，可能把它當成你的要求去執行。"], en: ["prompt injection", "Someone hides an instruction in a web page, email or file. When the model reads it, it may treat it as your request and act on it."], m: ["prompt injection"] },
    { id: "compaction", zh: ["壓縮（compaction）", "對話太長時，把舊內容摘要成短的。能繼續聊，但細節可能遺失。"], en: ["compaction", "When a conversation gets too long, older content is summarized. The chat can go on, but details may be lost."], m: ["compaction"] },
    { id: "cutoff", zh: ["知識截止日", "模型訓練資料的最後日期。之後發生的事它不知道，要靠當下查資料。"], en: ["knowledge cutoff", "The last date covered by a model's training data. It does not know what happened after that unless it looks it up."], m: ["知識截止日", "訓練資料截止日", "knowledge cutoff"] },
    { id: "lmarena", zh: ["LMArena", "讓使用者匿名比較兩個模型回答、投票選比較好的那個的排行榜。"], en: ["LMArena", "A leaderboard where users compare two models' answers blind and vote for the better one."], m: ["LMArena"] },
    { id: "client", zh: ["客戶端（client）", "裝在你電腦或手機上、負責跟伺服器講話的程式。"], en: ["client", "The program on your computer or phone that talks to the server."], m: ["客戶端"] }
  ];
  var L = en ? "en" : "zh";
  window.AI_STORY_GLOSSARY = G;

  var pop;
  function closePop() { if (pop) { pop.hidden = true; pop._for = null; } }
  function openPop(btn) {
    var g = G.filter(function (x) { return x.id === btn.getAttribute("data-g"); })[0];
    if (!g) return;
    if (!pop) {
      pop = document.createElement("div");
      pop.className = "gl-pop"; pop.setAttribute("role", "note");
      document.body.appendChild(pop);
    }
    if (pop._for === btn) { closePop(); return; }
    pop.innerHTML = "<b>" + esc(g[L][0]) + "</b><span>" + esc(g[L][1]) + '</span><a href="glossary.html#g-' + g.id + '">' + T.all + "</a>";
    pop.hidden = false; pop._for = btn;
    var r = btn.getBoundingClientRect(), w = Math.min(320, innerWidth - 24);
    pop.style.width = w + "px";
    var left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    pop.style.left = left + scrollX + "px";
    var h = pop.offsetHeight, below = r.bottom + 8 + h < innerHeight || r.top < h + 16;
    pop.style.top = (below ? r.bottom + 8 : r.top - h - 8) + scrollY + "px";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest(".gl") : null;
    if (b) { e.preventDefault(); openPop(b); return; }
    if (pop && !pop.hidden && !pop.contains(e.target)) closePop();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePop(); });
  addEventListener("resize", closePop);

  function markTerms() {
    var main = document.querySelector("main");
    if (!main || page === "journey.html" || page === "glossary.html") return;
    var pats = [];
    G.forEach(function (g) { g.m.forEach(function (m) { pats.push([m, g.id]); }); });
    pats.sort(function (a, b) { return b[0].length - a[0].length; });
    var re = new RegExp(pats.map(function (p) {
      return /^[\x00-\x7f]+$/.test(p[0]) ? "(?<![A-Za-z0-9-])" + reEsc(p[0]) + "(?![A-Za-z0-9-])" : reEsc(p[0]);
    }).join("|"), "i");
    var idOf = {};
    pats.forEach(function (p) { idOf[p[0].toLowerCase()] = p[1]; });
    var SKIP = "a, button, code, pre, svg, h1, h2, h3, h4, summary, label, select, option, th, .gl, .tag, .eyebrow, .tldr-meta, .evm, .sim2, #sim, .steps, .tl-filter, script, style, [data-no-gloss]";
    // one mark per term per section, so a reader who lands mid-page still gets help without a sea of underlines
    var scopes = main.querySelectorAll("section.s, li.ev");
    [].forEach.call(scopes, function (scope) {
      if (scope.matches("#sim, #refs")) return;
      var seen = {};
      var w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, null), nodes = [], n;
      while ((n = w.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        var par = node.parentElement;
        if (!par || par.closest(SKIP) || !par.closest("p, li, td, dd")) return;
        if (scope.matches("section.s") && par.closest("li.ev")) return;
        var text = node.nodeValue, m = re.exec(text);
        if (!m) return;
        var id = idOf[m[0].toLowerCase()];
        if (!id || seen[id]) return;
        seen[id] = 1;
        var after = node.splitText(m.index); after.nodeValue = after.nodeValue.slice(m[0].length);
        var b = document.createElement("button");
        b.type = "button"; b.className = "gl"; b.setAttribute("data-g", id); b.textContent = m[0];
        after.parentNode.insertBefore(b, after);
      });
    });
  }
  function glossaryPage() {
    var box = document.getElementById("glossary");
    if (!box) return;
    var items = G.slice().sort(function (a, b) { return a[L][0].toLowerCase() < b[L][0].toLowerCase() ? -1 : 1; });
    box.innerHTML = items.map(function (g) { return '<div class="g-item" id="g-' + g.id + '"><dt>' + esc(g[L][0]) + "</dt><dd>" + esc(g[L][1]) + "</dd></div>"; }).join("");
    if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) { el.classList.add("on"); el.scrollIntoView({ block: "center" }); } }
  }
  try { markTerms(); } catch (e) {}
  glossaryPage();

  /* ---------- 2. Search ---------- */
  var PAGES = ["index.html", "journey.html", "history.html", "tech.html", "bench.html", "china.html", "future.html", "family.html", "myths.html", "glossary.html"];
  var dlg, input, out, index = null, loading = null;
  function clean(el) {
    var c = el.cloneNode(true);
    [].forEach.call(c.querySelectorAll("script, style, svg, .pl-keep, .pl-more, .story-steps, button.totop"), function (n) { n.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim();
  }
  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = Promise.all(PAGES.map(function (p) {
      return fetch(p + "?lang=stay").then(function (r) { return r.ok ? r.text() : ""; }).catch(function () { return ""; }).then(function (txt) {
        var rows = [];
        if (!txt) return rows;
        var doc = new DOMParser().parseFromString(txt, "text/html");
        var pt = (doc.querySelector("h1") || doc.querySelector("title") || {}).textContent || p;
        pt = pt.replace(/\s+/g, " ").trim();
        function add(el, head, hash) { var t = clean(el); if (t) rows.push({ p: p, pt: pt, h: head || pt, hash: hash || "", t: t, lo: (head + " " + t).toLowerCase() }); }
        var hero = doc.querySelector("header.hero"); if (hero) add(hero, pt, "");
        [].forEach.call(doc.querySelectorAll("main section[id], main .group-mark"), function (sec) {
          if (sec.querySelector("li.ev")) return;
          var h = sec.querySelector("h2, h3, b"); add(sec, h ? h.textContent.replace(/\s+/g, " ").trim() : pt, sec.id);
        });
        [].forEach.call(doc.querySelectorAll("li.ev"), function (li) { var h = li.querySelector("h3, b"); add(li, h ? h.textContent.trim() : pt, "timeline"); });
        [].forEach.call(doc.querySelectorAll("section.step"), function (st) { var h = st.querySelector("h3"); add(st, h ? h.textContent.trim() : pt, st.id || ""); });
        return rows;
      });
    })).then(function (all) {
      index = [].concat.apply([], all);
      if (window.AI_STORY_GLOSSARY) G.forEach(function (g) { index.push({ p: "glossary.html", pt: T.gloss, h: g[L][0], hash: "g-" + g.id, t: g[L][1], lo: (g[L][0] + " " + g[L][1]).toLowerCase() }); });
      if (!index.length) { index = null; loading = null; throw new Error("empty"); }
      return index;
    });
    return loading;
  }
  function run() {
    var q = input.value.trim().toLowerCase();
    if (q.replace(/\s/g, "").length < 2 && !/[㐀-鿿]/.test(q)) { out.innerHTML = '<p class="srch-msg">' + T.hint + "</p>"; return; }
    if (!q) { out.innerHTML = '<p class="srch-msg">' + T.hint + "</p>"; return; }
    if (!index) out.innerHTML = '<p class="srch-msg">' + T.loading + "</p>";
    load().then(function (ix) {
      if (input.value.trim().toLowerCase() !== q) return;
      var words = q.split(/\s+/).filter(Boolean);
      var hits = [];
      ix.forEach(function (r) {
        for (var i = 0; i < words.length; i++) if (r.lo.indexOf(words[i]) < 0) return;
        var score = 0, hl = r.h.toLowerCase();
        words.forEach(function (w) { if (hl.indexOf(w) >= 0) score += 10; score += Math.min(5, r.lo.split(w).length - 1); });
        if (r.p === "glossary.html" && r.hash) score += 4;
        hits.push([score, r]);
      });
      hits.sort(function (a, b) { return b[0] - a[0]; });
      if (!hits.length) { out.innerHTML = '<p class="srch-msg">' + T.none + "</p>"; return; }
      var re = new RegExp("(" + words.map(reEsc).join("|") + ")", "gi");
      out.innerHTML = hits.slice(0, 30).map(function (x) {
        var r = x[1], lo = r.t.toLowerCase(), at = lo.indexOf(words[0]);
        var from = Math.max(0, at - 30), snip = (from ? "…" : "") + r.t.slice(from, from + 110) + (from + 110 < r.t.length ? "…" : "");
        var url = r.p + (r.hash ? "#" + r.hash : "") + (at >= 0 && r.hash !== "timeline" ? "" : "");
        if (at >= 0) url += (r.hash ? "" : "#") + ":~:text=" + encodeURIComponent(r.t.substr(at, words[0].length));
        return '<a class="srch-hit" href="' + esc(url) + '"><span class="k">' + esc(r.pt) + "</span><b>" + esc(r.h) + "</b><span>" + esc(snip).replace(re, "<mark>$1</mark>") + "</span></a>";
      }).join("");
    }, function () { out.innerHTML = '<p class="srch-msg">' + T.fail + "</p>"; });
  }
  function openSearch() {
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.className = "srch";
      dlg.innerHTML = '<form method="dialog" class="srch-top"><input type="search" aria-label="' + T.search + '" placeholder="' + T.ph + '" autocomplete="off"><button value="x" aria-label="' + T.close + '">&#10005;</button></form><div class="srch-out" aria-live="polite"></div>';
      document.body.appendChild(dlg);
      input = dlg.querySelector("input"); out = dlg.querySelector(".srch-out");
      var t;
      input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(run, 160); });
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); run(); } });
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
      out.addEventListener("click", function (e) { if (e.target.closest("a")) dlg.close(); });
    }
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    out.innerHTML = '<p class="srch-msg">' + T.hint + "</p>";
    input.value = ""; input.focus();
    load().catch(function () {});
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-search-open]") : null;
    if (b) { e.preventDefault(); var s = document.querySelector(".settings"); if (s) s.open = false; openSearch(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    var a = document.activeElement;
    if (a && /^(input|textarea|select)$/i.test(a.tagName)) return;
    e.preventDefault(); openSearch();
  });
  function addSearchButton() {
    var popup = document.querySelector(".settings .set-pop");
    if (!popup || popup.querySelector("[data-search-open]")) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "set-search"; b.setAttribute("data-search-open", "");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' + T.search;
    popup.insertBefore(b, popup.firstChild);
  }

  /* ---------- 3. Continue where you left off ---------- */
  var K_LAST = "ai-story-last", ORDER = ["journey.html", "history.html", "tech.html", "bench.html", "china.html", "future.html"];
  function lastRead() {
    if (ORDER.indexOf(page) >= 0) { set(K_LAST, page); return; }
    if (page !== "index.html") return;
    var last = get(K_LAST), row = document.querySelector(".also");
    if (!last || ORDER.indexOf(last) < 0 || !row) return;
    var nav = document.querySelector('.nav ul a.l[href="' + last + '"] .lg');
    var a = document.createElement("a");
    a.href = last; a.className = "cont";
    a.textContent = T.cont + (nav ? nav.textContent : last) + " →";
    row.insertBefore(a, row.firstChild);
  }

  /* ---------- 4. Print: light colours, every answer open ---------- */
  var themeBefore;
  addEventListener("beforeprint", function () {
    themeBefore = html.getAttribute("data-theme");
    html.setAttribute("data-theme", "light");
    [].forEach.call(document.querySelectorAll("main details"), function (d) { if (!d.open) { d.open = true; d.setAttribute("data-print-opened", ""); } });
  });
  addEventListener("afterprint", function () {
    if (themeBefore) html.setAttribute("data-theme", themeBefore); else html.removeAttribute("data-theme");
    [].forEach.call(document.querySelectorAll("details[data-print-opened]"), function (d) { d.open = false; d.removeAttribute("data-print-opened"); });
  });
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-print]")) print(); });

  function footLinks() {
    var f = document.querySelector("footer .frame");
    if (!f || f.querySelector(".foot-links")) return;
    var span = document.createElement("span");
    span.className = "foot-links";
    span.innerHTML = '<a href="glossary.html">' + T.gloss + '</a><button type="button" data-search-open>' + T.search + "</button>";
    f.appendChild(span);
  }
  function ready() { addSearchButton(); lastRead(); footLinks(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
