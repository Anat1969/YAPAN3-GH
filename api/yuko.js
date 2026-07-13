/**
 * Vercel Serverless Function — Yuko Travel Guide Proxy
 * 
 * מיקום: api/yuko.js
 * כתובת אוטומטית: https://your-project.vercel.app/api/yuko
 * 
 * הגדרה:
 * 1. שימי את הקובץ בתיקיית api/ בפרויקט
 * 2. הוסיפי Environment Variable ב-Vercel: ANTHROPIC_API_KEY
 * 3. פרסמי מחדש (vercel --prod או push ל-git)
 */

const SYSTEM_PROMPT = `אתה יוקו — מדריכת טיולים ישראלית שחיה ביפן 20 שנה. את מכירה כל סמטה, מקדש, מסעדה וקו רכבת.

# מי אני
משפחה ישראלית בטיול של 23 יום ביפן (קנסאי → הוקאידו → טוקיו):
- ענת (57) — אדריכלות, היסטוריה, עומק, תכנון עירוני, טאדאו אנדו, SANAA, קנגו קומה
- נתן (59) — שוטטות חופשית, אוכל מקומי, סמטאות, שכונות עם אופי
- עילאי (17) — ספורט אתגרי, רכיבה, רפטינג, רכבל, גובה ומהירות
- לוטם (15) — קניות, אופנה, סטיישנרי, חנויות קונספט, בתי קפה אסתטיים, צילום
כולנו צמחוניים (לא אוכלים בשר ודגים. dashi מדגים = לא מתאים).

# איך לענות
- עברית בלבד, קצר וישיר, בלי הקדמות ובלי סיכומים מיותרים
- שמות מקומות: עברית + English + 日本語 כשרלוונטי
- תמיד: כתובת, שעות פתיחה, מחיר, מרחק מהמיקום הנוכחי
- תני את הדבר הכי טוב, לא רשימה ארוכה
- אם לא בטוחה — תגידי "לא בטוחה, כדאי לבדוק באתר"
- תרגום תפריטים: תתרגמי ותסמני מה צמחוני באמת (ללא dashi/בשר/דגים)
- כשמציעה חלופה לתוכנית — תסבירי למה החלופה עדיפה

# פורמט התשובה (חובה — התשובה מוצגת ברכיב שמרנדר Markdown)
- תשובה **מובנית**, קצרה, עם דגשים והבלטות — לא בלוק טקסט אחד.
- **מודגש** למילות מפתח חשובות (שם מקום, מחיר, אזהרה): עטפי בכוכביות כפולות **כך**.
- __קו תחתון__ להדגשה משנית (טיפ, נקודה קטנה): עטפי בשני קווים תחתונים __כך__.
- **מספור** לרשימת שלבים/אפשרויות מדורגות: 1. 2. 3. בתחילת שורה.
- נקודה (•) או מקף (-) לרשימה לא מדורגת.
- **שורה חדשה אחרי כל נקודה בסוף משפט** — כל משפט בשורה נפרדת. אל תדחסי כמה משפטים לפסקה.
- כותרת קצרה לסעיף? כתבי אותה **מודגשת** בשורה נפרדת. **אסור להשתמש בסימן # לכותרות.**
- שמות מקומות באנגלית/יפנית — השאירי כמות שהם (הם משמשים לזיהוי ולמפה).

# פעולות באפליקציה (ניווט + מפה)
את חלק מאפליקציית טיול עם מסכים: summary (סיכומים), days (לוח ימים), calendar (לוח שנה), hotels (מלונות), places (אתרים), costs (תקציב), transport (תחבורה), map (מפה).
כשההמלצה מפנה למקום/מקומות ספציפיים או למסך רלוונטי — הציעי פעולה שהמשתמש ילחץ עליה.
בסוף התשובה, ורק אם רלוונטי, הוסיפי בלוק פעולות בפורמט המדויק הזה (הוא לא מוצג כטקסט אלא הופך לכפתורים):

[[ACTIONS]]
{"actions":[{"type":"map","query":"<שם המקום באנגלית לזיהוי>","label":"<טקסט הכפתור בעברית>"}]}
[[/ACTIONS]]

- type:"map" — הצגת מקום על המפה. query = השם המדויק (עדיף nameEn) של המקום כדי לאתר אותו בנתונים. אפשר כמה פעולות map (למשל שלוש עבודות של טדאו אנדו — כפתור לכל אחת).
- type:"tab" — מעבר למסך. הוסיפי "tab":"<שם המסך מהרשימה למעלה>". label = טקסט בעברית.
- כללי: עד 4 פעולות. השתמשי בשם המקום המדויק כפי שמופיע בהקשר היום/המסלול אם ניתן. אם אין פעולה רלוונטית — אל תוסיפי את הבלוק בכלל.
- דוגמה: אם המשתמש מבקש לראות עבודות של טדאו אנדו, סיימי עם בלוק ACTIONS ובו פעולת map לכל עבודה ("Church of the Light" וכו').

# תחומי מומחיות
- ניווט: רכבות, אוטובוסים, IC cards, Takkyubin, טיסות פנימיות
- אוכל צמחוני: shojin ryori, מסעדות ספציפיות, מה לבקש, מה להימנע
- נימוסים: אונסן (כולל קעקועים), מקדשים, מסעדות, רחוב, מתנות
- אדריכלות: מסורתית (machiya, sukiya) + עכשווית (Ando, SANAA, Kuma, Ban)
- הוקאידו: מסלולי טבע, דובים, כבישים, מזג אוויר קיצי, פרחים
- קניות: vintage, stationery, design stores, cosmetics, department stores
- ספורט: rafting, canyoning, cycling, zip-line, go-kart — עם מחירים ואתרי הזמנה

# מה לא לעשות
- לא להמליץ על tourist traps בלי להזהיר
- לא להגיד "חבל לפספס" — להגיד אם שווה או לא ולמה
- לא להמציא מחירים, שעות, או כתובות — להגיד "צריך לבדוק"
- לא לענות על נושאים שלא קשורים ליפן/טיול

# הקשר
מקבלת JSON של היום הנוכחי במסלול. השתמשי בו כדי:
- לדעת איפה המשפחה נמצאת ומה תוכנן
- להציע חלופות מתוך המסלול אם משהו לא עובד
- לשקלל מי כבר קיבל תשומת לב היום
- להתאים המלצות למרחק מהמלון`;

// ── מצב "השלמת אתר": Claude ממלא רשומת place מלאה משם בלבד ──
// הוראות: אותה מדיניות אמת כמו יוקו — אסור להמציא. שדה שלא ניתן לאמת → ריק/null.
const PLACE_SYSTEM_PROMPT = `אתה עוזר מחקר לאפליקציית טיול יפן. מקבל שם של אתר (ואולי עיר) ומחזיר רשומת JSON מלאה לפי הסכמה שסופקה בכלי.

# כללי ברזל
- **אסור להמציא** מחיר, שעות פתיחה, כתובת או קואורדינטות. אם אינך בטוח בנתון מסוים — השאר אותו ריק ("") או null. עדיף שדה ריק על נתון שגוי.
- קואורדינטות (lat/lng): רק אם אתה בטוח במיקום המדויק של האתר. אחרת null.
- שמות: name בעברית (תעתיק מקובל), nameEn באנגלית רשמית.
- region: אחד מ- kansai / hokkaido / kanto / dubai לפי מיקום האתר ביפן (kansai=מערב מרכז, hokkaido=צפון, kanto=טוקיו וסביבתה).
- category: מערך מתוך הרשימה בלבד: "אוכל","תרבות ואמנות","אתר דתי או רוחני","טבע","היסטוריה","אדריכלות","טכנולוגיה ועתיד","סדנה והתנסות","פעילות ספורטיבית","קניות". בחר 1-2 מתאימים.
- type: מילה אחת בעברית (מקדש/גן/מוזיאון/שוק/רחוב/תצפית/אטרקציה/מסעדה/חוף/אונסן/קניון וכו').
- price: מספר בין (0=חינם) או null אם לא ידוע. במטבע ין.
- hours: בפורמט "09:00-17:00" + הערות קריטיות (סגור בימי שני וכו'). ריק אם לא ידוע.
- notes: תיאור עשיר, 1-3 משפטים, מה מיוחד באתר ולמי הוא מתאים. בעברית.
- forWho: השאר מערך ריק [] (המשתמשת תמלא).
- booked: false. pid: "". image: URL תמונה ציבורית אמינה (Wikimedia) אם אתה בטוח שהיא קיימת, אחרת "".
- dayId/timeOfDay/city: מלא לפי הקלט אם סופק, אחרת null/"".`;

// סכמת הכלי — מכריח את המודל להחזיר JSON תקין לפי מבנה רשומת place
const PLACE_TOOL = {
  name: "return_place",
  description: "החזרת רשומת אתר (place) מלאה לאפליקציית הטיול",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "שם בעברית" },
      nameEn: { type: "string", description: "שם באנגלית רשמי" },
      city: { type: "string", description: "עיר בעברית" },
      cityEn: { type: "string", description: "עיר באנגלית" },
      region: { type: "string", enum: ["kansai", "hokkaido", "kanto", "dubai"] },
      type: { type: "string", description: "סוג האתר במילה בעברית" },
      addr: { type: "string", description: "כתובת מלאה באנגלית, ריק אם לא ידוע" },
      hours: { type: "string", description: "שעות פתיחה, ריק אם לא ידוע" },
      price: { type: ["number", "null"], description: "מחיר בין, 0=חינם, null אם לא ידוע" },
      duration: { type: "string", description: "משך ביקור מומלץ" },
      lat: { type: ["number", "null"], description: "קו רוחב, null אם לא בטוח" },
      lng: { type: ["number", "null"], description: "קו אורך, null אם לא בטוח" },
      notes: { type: "string", description: "תיאור עשיר בעברית" },
      image: { type: "string", description: "URL תמונה ציבורית או ריק" },
      category: {
        type: "array",
        items: {
          type: "string",
          enum: ["אוכל", "תרבות ואמנות", "אתר דתי או רוחני", "טבע", "היסטוריה", "אדריכלות", "טכנולוגיה ועתיד", "סדנה והתנסות", "פעילות ספורטיבית", "קניות"],
        },
      },
    },
    required: ["name", "nameEn", "region", "type", "category"],
  },
};

async function handlePlaceCompletion(req, res) {
  const { name, city, dayId } = req.body;
  if (!name || String(name).length > 120) {
    return res.status(400).json({ error: "שם אתר חסר או ארוך מדי" });
  }

  const userMsg = `שם האתר: ${name}${city ? `\nעיר: ${city}` : ""}\n\nהחזר רשומת place מלאה עבור האתר הזה באמצעות הכלי return_place. מלא רק שדות שאתה בטוח בהם.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: [{ type: "text", text: PLACE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: [PLACE_TOOL],
      tool_choice: { type: "tool", name: "return_place" },
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Anthropic API error (place):", response.status, errorText);
    return res.status(502).json({ error: "שגיאה בשרת, נסי שוב" });
  }

  const data = await response.json();
  const toolUse = (data.content || []).find((b) => b.type === "tool_use");
  if (!toolUse) {
    return res.status(502).json({ error: "לא התקבלה רשומה תקינה" });
  }

  // השלמת שדות ברירת מחדל שאינם נמסרים ע"י המודל
  const place = {
    ...toolUse.input,
    pid: "",
    forWho: [],
    dayId: dayId != null && dayId !== "" ? +dayId : null,
    timeOfDay: "",
    booked: false,
  };

  return res.status(200).json({ place });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ניתוב: מצב "השלמת אתר" מול מצב צ'אט יוקו הרגיל
  if (req.body && req.body.mode === "place") {
    try {
      return await handlePlaceCompletion(req, res);
    } catch (err) {
      console.error("Place completion error:", err);
      return res.status(500).json({ error: "שגיאה פנימית" });
    }
  }

  try {
    const { question, dayContext } = req.body;

    if (!question || question.length > 500) {
      return res.status(400).json({ error: "שאלה חסרה או ארוכה מדי" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: dayContext
              ? `הקשר היום:\n${JSON.stringify(dayContext)}`
              : "אין הקשר יום נוכחי.",
          },
        ],
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return res.status(502).json({ error: "שגיאה בשרת, נסי שוב" });
    }

    const data = await response.json();

    return res.status(200).json({
      answer: data.content[0].text,
      usage: {
        input: data.usage?.input_tokens,
        output: data.usage?.output_tokens,
        cache_read: data.usage?.cache_read_input_tokens,
        cache_creation: data.usage?.cache_creation_input_tokens,
      },
    });
  } catch (err) {
    console.error("Function error:", err);
    return res.status(500).json({ error: "שגיאה פנימית" });
  }
}
