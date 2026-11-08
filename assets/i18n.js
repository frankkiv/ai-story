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
    zh: { btn: "設定", lang: "語言", theme: "外觀", auto: "跟隨系統", light: "淺色", dark: "深色" },
    en: { btn: "Settings", lang: "Language", theme: "Appearance", auto: "System", light: "Light", dark: "Dark" }
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
})();
