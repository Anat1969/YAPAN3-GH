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

  function addMsg(text, cls) {
    var d = document.createElement("div");
    d.className = "yuko-msg " + cls;
    d.textContent = text;
    body.appendChild(d);
    scrollDown();
    return d;
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
      addMsg("היי! אני יוקו 🍵 שאלו אותי כל דבר על הטיול — מקומות, אוכל צמחוני, רכבות, חלופות לתוכנית. מה תרצו לדעת?", "bot");
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
        addMsg((data && data.answer) ? data.answer : "לא הגיעה תשובה, נסו שוב.", "bot");
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
