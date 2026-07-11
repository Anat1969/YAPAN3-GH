# מסלול טיול יפן — קיץ 2026

## מבנה הפרויקט

```
japan-trip/
├── index.html          # האפליקציה הראשית
├── data/
│   ├── hotels.json     # 11 מלונות — כתובות, מחירים, סטטוס
│   ├── days.json       # 31 ימים — בוקר/צהריים/ערב, אוכל, תחבורה
│   ├── places.json     # אתרים, מסעדות, חנויות
│   ├── costs.json      # תקציב — מעקב הוצאות
│   └── flights.json    # טיסות ותחבורה בין-עירונית
├── package.json        # npm dev server
├── vercel.json         # Vercel deployment config
└── README.md
```

## עבודה מקומית

```bash
cd japan-trip
npm run dev
# פותח http://localhost:3000
```

## פריסה ל-Vercel

```bash
# חד-פעמי
npm i -g vercel

# פריסה
vercel --prod
```

## עבודה עם Claude Code

```bash
# לפתוח את הפרויקט
cd japan-trip
claude

# דוגמאות לפקודות:
# "הוסף את Arashiyama Bamboo Grove ל-places.json ביום 6"
# "עדכן את מחיר המלון בביאי ל-2000 ש״ח"
# "הוסף טיסה פנימית ב-2 באוגוסט"
# "בנה טאב מפה עם Leaflet"
```

## עקרונות

- **מודולרי**: כל JSON נפרד — עריכת מלון לא דורשת טעינת כל הימים
- **RTL עברית**: כל הממשק בעברית, ללא אנגלית מעורבבת
- **חסכוני בטוקנים**: עדכון שדה אחד = עריכת JSON קטן
- **שמירה כפולה**: JSON מקומי + שמירת HTML עצמאי לגיבוי
