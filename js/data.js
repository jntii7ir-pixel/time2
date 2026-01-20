// js/data.js

// 授業データは「開始時刻」と「コマ数」だけ指定して、時刻は自動生成する。
// 休み時間は常に10分。
// 月曜だけ授業45分、それ以外は50分。
// 昼休みは45分（※月曜は app.js 側で 12:25〜13:10 を優先表示中）

const settings = {
  breakMinutes: 10,
  classMinutes: {
    mon: 45,
    tue: 50,
    wed: 50,
    thu: 50,
    fri: 50
  }
};

// 曜日ごとの「1時間目開始」と「何時間あるか」だけを入力する
// ★ここをあなたの学校に合わせて埋める（不明なら仮でOK、あとで調整）
// 例：火〜金が 08:55 開始で 7時間まであるなら periods: 7
const dayPlan = {
  mon: { firstStart: "08:55", periods: 7 },
  tue: { firstStart: "08:55", periods: 6 },
  wed: { firstStart: "08:55", periods: 6 },
  thu: { firstStart: "08:55", periods: 6 },
  fri: { firstStart: "08:55", periods: 6 }
};

function timeStringToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeString(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function buildTimetableForDay(dayKey) {
  const plan = dayPlan[dayKey];
  if (!plan) return [];

  const classLen = settings.classMinutes[dayKey];
  const breakLen = settings.breakMinutes;

  let t = timeStringToMinutes(plan.firstStart);
  const table = [];

  for (let i = 1; i <= plan.periods; i++) {
    const start = t;
    const end = t + classLen;

    table.push({
      name: `${i}時間目`,
      start: minutesToTimeString(start),
      end: minutesToTimeString(end)
    });

    // 次のコマへ（最後のコマの後ろは休み時間を作らない）
    t = end + (i === plan.periods ? 0 : breakLen);
  }

  return table;
}

// app.js が参照する最終データ（これを使う）
const timetable = {
  mon: buildTimetableForDay("mon"),
  tue: buildTimetableForDay("tue"),
  wed: buildTimetableForDay("wed"),
  thu: buildTimetableForDay("thu"),
  fri: buildTimetableForDay("fri")
};
