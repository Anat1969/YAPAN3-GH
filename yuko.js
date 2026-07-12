/**
 * יוקו — עוזרת צ'אט צפה לאפליקציית הטיול.
 * כפתור צף בפינה השמאלית התחתונה → חלון צ'אט קטן (RTL, עברית).
 * שולח POST ל-/api/yuko עם { question, dayContext }.
 * הקשר היום נשלף מ-window.yukoDayContext() (מוגדר בכל דף לפי היום הנבחר).
 * רכיב עצמאי: מזריק את ה-CSS וה-DOM שלו, לא תלוי בשאר העמוד.
 */
(function () {
  if (window.__yukoLoaded) return;
  window.__yukoLoaded = true;

  // ── עיצוב (לפי המפרט: לבן, משתמש=אפור בהיר, יוקו=ירוק בהיר, כפתור=ירוק כהה) ──
  var css = `
  .yuko-fab{position:fixed;bottom:20px;left:20px;z-index:9000;display:inline-flex;align-items:center;gap:8px;
    padding:12px 18px;border:none;border-radius:999px;background:#166534;color:#fff;
    font:800 14px/1 inherit;cursor:pointer;box-shadow:0 6px 20px rgba(22,101,52,.35);transition:.15s}
  .yuko-fab:hover{background:#14532d;transform:translateY(-1px);box-shadow:0 8px 26px rgba(22,101,52,.45)}
  .yuko-fab:focus-visible{outline:3px solid #86efac;outline-offset:2px}
  .yuko-fab svg{width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

  .yuko-panel{position:fixed;bottom:20px;left:20px;z-index:9001;width:360px;max-width:calc(100vw - 32px);
    height:540px;max-height:calc(100vh - 40px);background:#fff;border-radius:16px;direction:rtl;
    display:none;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.28);
    border:1px solid #e3e1dc;font-family:inherit}
  .yuko-panel.open{display:flex;animation:yukoIn .18s ease-out}
  @keyframes yukoIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

  .yuko-head{background:#166534;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:10px;flex:none}
  .yuko-head .yuko-av{width:32px;height:32px;border-radius:50%;background:#22c55e;display:flex;align-items:center;
    justify-content:center;font-weight:900;font-size:15px;flex:none}
  .yuko-head .yuko-t{display:flex;flex-direction:column;line-height:1.2}
  .yuko-head .yuko-t b{font-size:14px;font-weight:800}
  .yuko-head .yuko-t span{font-size:11px;opacity:.85}
  .yuko-head .yuko-x{margin-inline-start:auto;background:transparent;border:none;color:#fff;font-size:22px;
    line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px}
  .yuko-head .yuko-x:hover{background:rgba(255,255,255,.18)}

  .yuko-body{flex:1;overflow-y:auto;padding:14px;background:#fafafa;display:flex;flex-direction:column;gap:10px}
  .yuko-msg{max-width:82%;padding:9px 12px;border-radius:14px;font-size:13.5px;line-height:1.55;white-space:pre-wrap;
    word-break:break-word}
  .yuko-msg.user{align-self:flex-start;background:#ececec;color:#1c1c1a;border-bottom-right-radius:4px}
  .yuko-msg.bot{align-self:flex-end;background:#dcfce7;color:#14532d;border-bottom-left-radius:4px}
  .yuko-msg.err{align-self:center;background:#fee2e2;color:#991b1b;font-size:12.5px;text-align:center}
  .yuko-msg.bot b,.yuko-msg.bot strong{font-weight:800}
  .yuko-msg.bot u{text-decoration:underline;text-underline-offset:2px}
  .yuko-msg.bot .yk-h{font-weight:800;display:block;margin:2px 0}
  .yuko-msg.bot ol,.yuko-msg.bot ul{margin:4px 6px 4px 0;padding-inline-start:20px}
  .yuko-msg.bot li{margin:2px 0}
  .yuko-msg.bot code{background:#c7f0d3;border-radius:4px;padding:0 4px;font-size:12.5px;direction:ltr;display:inline-block}

  .yuko-actions{align-self:flex-end;display:flex;flex-wrap:wrap;gap:6px;max-width:82%}
  .yuko-act{display:inline-flex;align-items:center;gap:5px;padding:7px 11px;border:1px solid #22c55e;
    border-radius:999px;background:#fff;color:#166534;font:700 12px/1 inherit;cursor:pointer;transition:.13s}
  .yuko-act:hover{background:#166534;color:#fff;border-color:#166534}
  .yuko-act svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

  .yuko-chips{display:flex;flex-wrap:wrap;gap:6px;padding:2px 0 2px}
  .yuko-chip{padding:7px 11px;border:1px solid #bbf7d0;border-radius:999px;background:#f0fdf4;color:#166534;
    font:600 12px/1.3 inherit;cursor:pointer;transition:.13s;text-align:right}
  .yuko-chip:hover{background:#dcfce7;border-color:#22c55e}
  .yuko-typing{align-self:flex-end;background:#dcfce7;color:#166534;font-size:13px;padding:9px 12px;border-radius:14px;
    border-bottom-left-radius:4px;display:inline-flex;align-items:center;gap:7px}
  .yuko-typing i{width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;animation:yukoBlink 1s infinite}
  .yuko-typing i:nth-child(2){animation-delay:.2s}.yuko-typing i:nth-child(3){animation-delay:.4s}
  @keyframes yukoBlink{0%,60%,100%{opacity:.3}30%{opacity:1}}

  .yuko-foot{flex:none;padding:10px;border-top:1px solid #eee;background:#fff;display:flex;gap:8px;align-items:flex-end}
  .yuko-foot textarea{flex:1;resize:none;border:1px solid #d6d3ce;border-radius:12px;padding:9px 12px;
    font:inherit;font-size:13.5px;max-height:96px;min-height:40px;line-height:1.4;direction:rtl}
  .yuko-foot textarea:focus{outline:2px solid #86efac;outline-offset:0;border-color:#22c55e}
  .yuko-send{flex:none;width:40px;height:40px;border:none;border-radius:50%;background:#166534;color:#fff;cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:.15s}
  .yuko-send:hover:not(:disabled){background:#14532d}
  .yuko-send:disabled{opacity:.45;cursor:default}
  .yuko-send svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  @media(max-width:420px){.yuko-panel{left:8px;bottom:8px;height:calc(100vh - 16px)}.yuko-fab{left:12px;bottom:12px}}
  `;
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ── DOM ──
  var fab = document.createElement("button");
  fab.className = "yuko-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "שאלו את יוקו — עוזרת הטיול");
  fab.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
    "שאלו את יוקו";

  var panel = document.createElement("div");
  panel.className = "yuko-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "צ'אט עם יוקו");
  panel.innerHTML =
    '<div class="yuko-head">' +
      '<div class="yuko-av">יו</div>' +
      '<div class="yuko-t"><b>יוקו</b><span>מדריכת הטיול שלכם ביפן</span></div>' +
      '<button class="yuko-x" type="button" aria-label="סגירה">&times;</button>' +
    "</div>" +
    '<div class="yuko-body" id="yukoBody"></div>' +
    '<div class="yuko-foot">' +
      '<textarea id="yukoInput" rows="1" placeholder="שאלו את יוקו כל דבר על הטיול…" aria-label="הקלדת שאלה"></textarea>' +
      '<button class="yuko-send" id="yukoSend" type="button" aria-label="שליחה">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>' +
      "</button>" +
    "</div>";

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var body = panel.querySelector("#yukoBody");
  var input = panel.querySelector("#yukoInput");
  var sendBtn = panel.querySelector("#yukoSend");
  var closeBtn = panel.querySelector(".yuko-x");
  var busy = false;
  var greeted = false;

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // רינדור Markdown קל: **מודגש**, __קו תחתון__, `קוד`, רשימות ממוספרות/לא-ממוספרות, שורות
  function mdInline(s) {
    s = esc(s);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    s = s.replace(/__([^_]+)__/g, "<u>$1</u>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    // *נטוי* בודד (לא חלק מ-**) → הדגשה
    s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<b>$2</b>");
    return s;
  }
  function mdToHtml(text) {
    var lines = String(text).replace(/\r/g, "").split("\n");
    var html = "", listType = null, listBuf = [];
    function flush() {
      if (listType) { html += "<" + listType + ">" + listBuf.join("") + "</" + listType + ">"; listBuf = []; listType = null; }
    }
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      var mOl = ln.match(/^\s*\d+[.)]\s+(.*)$/);
      var mUl = ln.match(/^\s*[-•*]\s+(.*)$/);
      if (mOl) { if (listType !== "ol") { flush(); listType = "ol"; } listBuf.push("<li>" + mdInline(mOl[1]) + "</li>"); continue; }
      if (mUl) { if (listType !== "ul") { flush(); listType = "ul"; } listBuf.push("<li>" + mdInline(mUl[1]) + "</li>"); continue; }
      flush();
      if (!ln.trim()) { html += "<div style='height:6px'></div>"; continue; }
      // שורה שכולה מודגשת → כותרת סעיף
      var mH = ln.match(/^\s*\*\*(.+)\*\*\s*:?\s*$/);
      if (mH) { html += "<span class='yk-h'>" + mdInline("**" + mH[1] + "**").replace(/^<b>|<\/b>$/g, "") + "</span>"; continue; }
      html += "<div>" + mdInline(ln) + "</div>";
    }
    flush();
    return html;
  }

  // חילוץ בלוק [[ACTIONS]]...[[/ACTIONS]] מהתשובה → {text, actions[]}
  function parseActions(raw) {
    var out = { text: raw, actions: [] };
    var m = raw.match(/\[\[ACTIONS\]\]([\s\S]*?)\[\[\/ACTIONS\]\]/i);
    if (!m) return out;
    out.text = raw.slice(0, m.index).trim();
    try {
      var obj = JSON.parse(m[1].trim());
      if (obj && Array.isArray(obj.actions)) out.actions = obj.actions.slice(0, 4);
    } catch (e) { /* בלוק פגום — מתעלמים */ }
    return out;
  }

  function addMsg(text, cls) {
    var d = document.createElement("div");
    d.className = "yuko-msg " + cls;
    if (cls === "bot") d.innerHTML = mdToHtml(text);
    else d.textContent = text;
    body.appendChild(d);
    scrollDown();
    return d;
  }

  var ICON_MAP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  var ICON_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';

  function addActions(actions) {
    if (!actions || !actions.length) return;
    var wrap = document.createElement("div");
    wrap.className = "yuko-actions";
    actions.forEach(function (a) {
      if (!a || !a.type) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "yuko-act";
      var isMap = a.type === "map";
      btn.innerHTML = (isMap ? ICON_MAP : ICON_ARROW) + "<span>" + esc(a.label || (isMap ? "הצג במפה" : "מעבר")) + "</span>";
      btn.addEventListener("click", function () { runAction(a); });
      wrap.appendChild(btn);
    });
    if (wrap.children.length) { body.appendChild(wrap); scrollDown(); }
  }

  // שאלות טיפוסיות חכמות — חלקן דינמיות לפי העיר של היום הנבחר
  function suggestedQuestions() {
    var city = "";
    try { var c = window.yukoDayContext && window.yukoDayContext(); if (c) city = c.city || ""; } catch (e) {}
    var q = [];
    if (city) {
      q.push("מה הכי שווה לראות היום ב" + city + "?");
      q.push("איפה לאכול צמחוני טוב ב" + city + "?");
    }
    q.push("תראי לי את עבודות טדאו אנדו על המפה");
    q.push("איך מגיעים בין הערים בצורה הכי חכמה?");
    q.push("מה כדאי לקנות (סטיישנרי / אופנה) ואיפה?");
    q.push("יש שינוי בתוכנית — תני חלופה טובה");
    // ייחודיות + עד 4
    var seen = {}, out = [];
    for (var i = 0; i < q.length && out.length < 4; i++) { if (!seen[q[i]]) { seen[q[i]] = 1; out.push(q[i]); } }
    return out;
  }
  function addChips() {
    var wrap = document.createElement("div");
    wrap.className = "yuko-chips";
    suggestedQuestions().forEach(function (text) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "yuko-chip";
      chip.textContent = text;
      chip.addEventListener("click", function () {
        wrap.remove();
        input.value = text;
        send();
      });
      wrap.appendChild(chip);
    });
    body.appendChild(wrap);
    scrollDown();
  }

  // הפעלת פעולה: מפה / מעבר מסך. בעמוד הראשי — הוקים מקומיים; ב-day.html — ניווט ל-index
  function runAction(a) {
    if (a.type === "map") {
      if (typeof window.yukoShowPlace === "function") {
        var ok = window.yukoShowPlace(a.query);
        if (ok === false) location.href = "index.html?tab=map&focus=" + encodeURIComponent(a.query || "");
      } else {
        location.href = "index.html?tab=map&focus=" + encodeURIComponent(a.query || "");
      }
    } else if (a.type === "tab" && a.tab) {
      if (typeof window.yukoGoTab === "function") window.yukoGoTab(a.tab);
      else location.href = "index.html?tab=" + encodeURIComponent(a.tab);
    }
  }

  function showTyping() {
    var d = document.createElement("div");
    d.className = "yuko-typing";
    d.id = "yukoTyping";
    d.innerHTML = "יוקו חושבת<i></i><i></i><i></i>";
    body.appendChild(d);
    scrollDown();
    return d;
  }

  function openPanel() {
    panel.classList.add("open");
    fab.style.display = "none";
    if (!greeted) {
      greeted = true;
      addMsg("היי, אני יוקו 🍵\nשאלו אותי כל דבר על הטיול — מקומות, אוכל צמחוני, רכבות, אדריכלות או חלופות לתוכנית.\nהנה כמה רעיונות להתחיל:", "bot");
      addChips();
    }
    setTimeout(function () { input.focus(); }, 60);
  }
  function closePanel() {
    panel.classList.remove("open");
    fab.style.display = "";
  }

  fab.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);

  // התאמת גובה תיבת הטקסט לתוכן
  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 96) + "px";
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
  sendBtn.addEventListener("click", send);

  async function send() {
    if (busy) return;
    var q = input.value.trim();
    if (!q) return;
    if (q.length > 500) { addMsg("השאלה ארוכה מדי (עד 500 תווים).", "err"); return; }

    addMsg(q, "user");
    input.value = "";
    input.style.height = "auto";
    busy = true;
    sendBtn.disabled = true;
    var typing = showTyping();

    var dayContext = null;
    try {
      if (typeof window.yukoDayContext === "function") dayContext = window.yukoDayContext();
    } catch (e) { dayContext = null; }

    try {
      var res = await fetch("/api/yuko", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, dayContext: dayContext }),
      });
      typing.remove();
      if (!res.ok) {
        var ej = await res.json().catch(function () { return {}; });
        addMsg(ej.error || "שגיאה בשרת, נסו שוב.", "err");
      } else {
        var data = await res.json();
        var raw = (data && data.answer) ? data.answer : "לא הגיעה תשובה, נסו שוב.";
        var parsed = parseActions(raw);
        addMsg(parsed.text || raw, "bot");
        addActions(parsed.actions);
      }
    } catch (err) {
      typing.remove();
      addMsg("אין חיבור לשרת. בדקו את החיבור ונסו שוב.", "err");
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }
})();
