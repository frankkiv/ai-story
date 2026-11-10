/* Language + appearance settings. Loaded in <head> (not deferred) so the
   saved theme applies before paint and a saved language redirects early.
   zh-Hant pages live at the root, English pages under /en/ with the same file names. */
(function () {
  var html = document.documentElement;
  var lang = /^en/i.test(html.lang) ? "en" : "zh";
  var K_LANG = "ai-story-lang", K_THEME = "ai-story-theme";
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  // Default is dark. "auto" (follow the system) is stored explicitly so it differs from "never chosen".
  var theme = get(K_THEME) || "dark";
  if (theme === "light" || theme === "dark") html.setAttribute("data-theme", theme);

  // Plain-words reading mode: section bodies collapse to their heading plus the "白話說" boxes.
  var K_PLAIN = "ai-story-plain";
  if (get(K_PLAIN) === "1") html.setAttribute("data-plain", "1");

  var page = location.pathname.split("/").pop() || "index.html";
  if (!/\.html$/.test(page)) page = "index.html";
  function hrefFor(target) {
    if (target === lang) return page;
    return target === "en" ? "en/" + page : "../" + page;
  }
  var pref = get(K_LANG);
  if ((pref === "en" || pref === "zh") && pref !== lang && !/[?&]lang=stay/.test(location.search)) {
    location.replace(hrefFor(pref) + location.hash);
    return;
  }

  var T = {
    zh: { btn: "設定", lang: "語言", theme: "外觀", auto: "跟隨系統", light: "淺色", dark: "深色",
          mode: "閱讀方式", full: "完整", plain: "白話",
          more: "看這一段的完整說明", less: "收起完整說明",
          rtFull: "完整讀約 {n} 分鐘", rtPlain: "白話模式約 {n} 分鐘",
          toPlain: "切換成白話模式", toFull: "回到完整內容",
          steps: "你在整個故事的哪裡", home: "首頁" },
    en: { btn: "Settings", lang: "Language", theme: "Appearance", auto: "System", light: "Light", dark: "Dark",
          mode: "Reading mode", full: "Full", plain: "Plain words",
          more: "Show the full explanation", less: "Hide the full explanation",
          rtFull: "Full read: about {n} min", rtPlain: "Plain-words mode: about {n} min",
          toPlain: "Switch to plain-words mode", toFull: "Back to the full version",
          steps: "Where you are in the story", home: "Home" }
  }[lang];

  function build() {
    var frame = document.querySelector(".nav .frame");
    if (!frame || frame.querySelector(".settings")) return;
    var d = document.createElement("details");
    d.className = "settings";
    var cur = get(K_THEME) || "dark";
    d.innerHTML =
      '<summary aria-label="' + T.btn + '" title="' + T.btn + '"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg><span class="st-cur">' + (lang === "en" ? "EN" : "中") + "</span></summary>" +
      '<div class="set-pop" role="group" aria-label="' + T.btn + '">' +
        '<p class="set-h">' + T.lang + "</p>" +
        '<div class="set-row">' +
          '<a data-lang="zh" lang="zh-Hant" href="' + hrefFor("zh") + '"' + (lang === "zh" ? ' aria-current="true"' : "") + ">繁體中文</a>" +
          '<a data-lang="en" lang="en" href="' + hrefFor("en") + '"' + (lang === "en" ? ' aria-current="true"' : "") + ">English</a>" +
        "</div>" +
        '<p class="set-h">' + T.theme + "</p>" +
        '<div class="set-row">' +
          ["auto", "light", "dark"].map(function (t) { return '<button type="button" data-theme-set="' + t + '"' + (cur === t ? ' aria-pressed="true"' : ' aria-pressed="false"') + ">" + T[t] + "</button>"; }).join("") +
        "</div>" +
        '<p class="set-h">' + T.mode + "</p>" +
        '<div class="set-row">' +
          '<button type="button" data-plain-set="0">' + T.full + "</button>" +
          '<button type="button" data-plain-set="1">' + T.plain + "</button>" +
        "</div>" +
      "</div>";
    frame.appendChild(d);
    d.querySelectorAll("[data-lang]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        set(K_LANG, a.getAttribute("data-lang"));
        e.preventDefault();
        location.href = a.getAttribute("href") + location.hash;
      });
    });
    d.querySelectorAll("[data-theme-set]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-theme-set");
        if (t === "auto") { html.removeAttribute("data-theme"); set(K_THEME, "auto"); }
        else { html.setAttribute("data-theme", t); set(K_THEME, t); }
        d.querySelectorAll("[data-theme-set]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
    d.querySelectorAll("[data-plain-set]").forEach(function (b) {
      b.addEventListener("click", function () { setPlain(b.getAttribute("data-plain-set") === "1"); });
    });
    syncPlain();
    document.addEventListener("click", function (e) { if (d.open && !d.contains(e.target)) d.open = false; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && d.open) { d.open = false; d.querySelector("summary").focus(); } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();

  // Back-to-top button (every page except the journey walkthrough, which has its own controls).
  // Smooth in-page anchor scrolling too, unless the reader prefers reduced motion.
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (page !== "journey.html" && !reduce) html.style.scrollBehavior = "smooth";
  function toTop() {
    if (page === "journey.html" || document.querySelector(".totop")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "totop";
    b.setAttribute("aria-label", lang === "en" ? "Back to top" : "回到最上面");
    b.title = b.getAttribute("aria-label");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>';
    document.body.appendChild(b);
    var shown = false, ticking = false;
    function update() {
      ticking = false;
      var on = scrollY > innerHeight * 1.2;
      if (on !== shown) { shown = on; b.classList.toggle("on", on); b.tabIndex = on ? 0 : -1; }
    }
    addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
    var anim = 0;
    function stop() { if (anim) { cancelAnimationFrame(anim); anim = 0; } }
    ["wheel", "touchstart", "keydown"].forEach(function (ev) { addEventListener(ev, stop, { passive: true }); });
    b.addEventListener("click", function () {
      stop();
      var from = scrollY;
      var done = function () { var brand = document.querySelector(".nav .brand"); if (brand) brand.focus({ preventScroll: true }); };
      if (reduce || from < 2) { scrollTo({ top: 0, behavior: "instant" }); done(); return; }
      // Ease in-out; longer pages get a little more time, capped so it never drags.
      var dur = Math.min(1100, 420 + from / 14), t0 = performance.now();
      function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
      (function step(now) {
        var t = Math.min(1, (now - t0) / dur);
        scrollTo({ top: Math.round(from * (1 - ease(t))), behavior: "instant" });
        if (t < 1) anim = requestAnimationFrame(step); else { anim = 0; done(); }
      })(t0);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", toTop); else toTop();
  // ---------- Plain-words mode, reading time, story progress ----------
  function isPlain() { return html.getAttribute("data-plain") === "1"; }
  function syncPlain() {
    var on = isPlain();
    document.querySelectorAll("[data-plain-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", (b.getAttribute("data-plain-set") === "1") === on ? "true" : "false");
    });
    document.querySelectorAll("[data-plain-toggle]").forEach(function (b) {
      b.textContent = on ? T.toFull : T.toPlain;
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function setPlain(on) {
    // Keep the reader's place: anchor on the section nearest the top of the viewport.
    var anchor = null, best = Infinity;
    document.querySelectorAll("main section.s").forEach(function (sec) {
      var t = Math.abs(sec.getBoundingClientRect().top);
      if (t < best) { best = t; anchor = sec; }
    });
    var before = anchor && scrollY > 200 ? anchor.getBoundingClientRect().top : null;
    if (on) { html.setAttribute("data-plain", "1"); set(K_PLAIN, "1"); }
    else { html.removeAttribute("data-plain"); set(K_PLAIN, null); }
    syncPlain();
    if (before != null) scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: "instant" });
    dispatchEvent(new Event("resize"));
  }
  function minutes(text) {
    var cjk = (text.match(/[㐀-鿿]/g) || []).length;
    var words = (text.replace(/[㐀-鿿]/g, " ").match(/[A-Za-z0-9][A-Za-z0-9'.-]*/g) || []).length;
    return Math.max(1, Math.round(cjk / 420 + words / 230));
  }
  function setupPlain() {
    var main = document.querySelector("main");
    if (!main || page === "journey.html") return;
    var plainText = "";
    main.querySelectorAll("section.s[id]").forEach(function (sec) {
      var frame = sec.querySelector(".frame"), head = frame && frame.querySelector(".s-head");
      if (!head || head.parentNode !== frame || sec.id === "faq" || sec.hasAttribute("data-plain-skip")) return;
      var rest = [].filter.call(frame.children, function (c) { return c !== head; });
      if (!rest.length) return;
      sec.classList.add("pl");
      var keep = document.createElement("div");
      keep.className = "pl-keep";
      sec.querySelectorAll(".elder").forEach(function (e) { if (!head.contains(e)) keep.appendChild(e.cloneNode(true)); });
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "pl-more";
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = T.more;
      btn.addEventListener("click", function () {
        var open = sec.classList.toggle("pl-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.textContent = open ? T.less : T.more;
        dispatchEvent(new Event("resize"));
      });
      head.parentNode.insertBefore(btn, head.nextSibling);
      head.parentNode.insertBefore(keep, btn);
      plainText += head.textContent + keep.textContent;
    });
    // A link into the middle of a collapsed section opens that section first.
    function reveal() {
      if (!isPlain() || location.hash.length < 2) return;
      var el; try { el = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) {}
      var sec = el && el.closest ? el.closest("section.pl") : null;
      if (!sec || sec === el || sec.classList.contains("pl-open")) return;
      var head = sec.querySelector(".s-head");
      if (head && head.contains(el)) return;
      sec.querySelector(".pl-more").click();
      el.scrollIntoView();
    }
    addEventListener("hashchange", reveal); reveal();

    var hero = document.querySelector("header.hero");
    var heroText = hero ? hero.textContent : "";
    document.querySelectorAll("[data-readtime]").forEach(function (el) {
      var clone = main.cloneNode(true);
      clone.querySelectorAll("script, style, .pl-keep, .pl-more").forEach(function (n) { n.remove(); });
      var full = T.rtFull.replace("{n}", minutes(heroText + clone.textContent));
      el.textContent = plainText ? full + " · " + T.rtPlain.replace("{n}", minutes(heroText + plainText)) : full;
    });
    document.querySelectorAll("[data-plain-toggle]").forEach(function (b) {
      b.addEventListener("click", function () { setPlain(!isPlain()); });
    });
    syncPlain();
  }
  // Story progress above the "next part" card: built from the nav so the order lives in one place.
  function setupSteps() {
    var next = document.querySelector("main .next, .next");
    var links = document.querySelectorAll(".nav ul a.l");
    if (!next || !links.length || document.querySelector(".story-steps")) return;
    var ol = document.createElement("ol");
    ol.className = "story-steps"; ol.setAttribute("aria-label", T.steps);
    var seen = false;
    [].forEach.call(links, function (a) {
      var li = document.createElement("li"), here = a.classList.contains("site-on");
      var x = document.createElement("a");
      x.href = a.getAttribute("href");
      x.textContent = (a.querySelector(".sh") || a).textContent;
      if (here) { x.setAttribute("aria-current", "page"); seen = true; }
      else if (!seen) li.className = "done";
      li.appendChild(x); ol.appendChild(li);
    });
    if (!seen) [].forEach.call(ol.children, function (li) { li.className = "done"; });
    next.parentNode.insertBefore(ol, next);
  }
  function late() { setupPlain(); setupSteps(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", late); else late();
})();
