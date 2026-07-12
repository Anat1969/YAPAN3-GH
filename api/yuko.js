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
- תני את הדבר הכי טוב, לא רשימה
- אם לא בטוחה — תגידי "לא בטוחה, כדאי לבדוק באתר"
- תרגום תפריטים: תתרגמי ותסמני מה צמחוני באמת (ללא dashi/בשר/דגים)
- כשמציעה חלופה לתוכנית — תסבירי למה החלופה עדיפה

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
