// js/data.js

const settings = {
  breakMinutes: 10,
  classMinutes: { mon: 45, tue: 50, wed: 50, thu: 50, fri: 50 }
};

const dayPlan = {
  mon: { firstStart: "08:55", periods: 7 },
  tue: { firstStart: "08:55", periods: 7 },
  wed: { firstStart: "08:55", periods: 7 },
  thu: { firstStart: "08:55", periods: 7 },
  fri: { firstStart: "08:55", periods: 7 }
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

/*
  ここが「各曜日の時間割（科目・教室・持ち物）」の本体。
  まだ未確定なら空欄（"" や []）でもOK。あとで埋めれば動きます。
*/
const details = {
  mon: {
    1: { subject: "保健", room: "", items: [] },
    2: { subject: "英1", room: "", items: [] },
    3: { subject: "情数", room: "", items: [] },
    4: { subject: "数学", room: "", items: [] },
    5: { subject: "家庭", room: "", items: [] },
    6: { subject: "家庭", room: "", items: [] },
    7: { subject: "科学", room: "", items: [] }
  },
  tue: {
    1: { subject: "数学", room: "", items: [] },
    2: { subject: "体育", room: "", items: [] },
    3: { subject: "プログラミング技術", room: "", items: [] },
    4: { subject: "プログラミング技術", room: "", items: [] },
    5: { subject: "総探", room: "", items: [] },
    6: { subject: "LH", room: "", items: [] }
  },
  wed: {
    1: { subject: "科学", room: "", items: [] },
    2: { subject: "地理", room: "", items: [] },
    3: { subject: "音美", room: "", items: [] },
    4: { subject: "音美", room: "", items: [] },
    5: { subject: "英コ1", room: "", items: [] },
    6: { subject: "体育", room: "", items: [] }
  },
  thu: {
    1: { subject: "英コ1", room: "", items: [] },
    2: { subject: "電回", room: "", items: [] },
    3: { subject: "言語", room: "", items: [] },
    4: { subject: "工業技術基礎", room: "", items: [] },
    5: { subject: "工業技術基礎", room: "", items: [] },
    6: { subject: "工業技術基礎", room: "", items: [] }
  },
  fri: {
    1: { subject: "言語", room: "", items: [] },
    2: { subject: "電回", room: "", items: [] },
    3: { subject: "地理", room: "", items: [] },
    4: { subject: "数学", room: "", items: [] },
    5: { subject: "情数", room: "", items: [] },
    6: { subject: "情数", room: "", items: [] }
  }
};


function getDetail(dayKey, periodNumber) {
  const day = details[dayKey] || {};
  return day[periodNumber] || null;
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
    const d = getDetail(dayKey, i);

    table.push({
      name: `${i}時間目`,
      period: i,
      start: minutesToTimeString(start),
      end: minutesToTimeString(end),
      subject: d?.subject || "",
      room: d?.room || "",
      items: Array.isArray(d?.items) ? d.items : []
    });

    t = end + (i === plan.periods ? 0 : breakLen);
  }

  return table;
}

const timetable = {
  mon: buildTimetableForDay("mon"),
  tue: buildTimetableForDay("tue"),
  wed: buildTimetableForDay("wed"),
  thu: buildTimetableForDay("thu"),
  fri: buildTimetableForDay("fri")
};
