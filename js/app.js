// js/app.js

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getNowTimeString() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function getRoom(dayKey, periodNumber) {
  return rooms?.[dayKey]?.[periodNumber] || "教室未設定";
}

function getNowDayKey() {
  const d = new Date().getDay();
  if (d === 1) return "mon";
  if (d === 2) return "tue";
  if (d === 3) return "wed";
  if (d === 4) return "thu";
  if (d === 5) return "fri";
  return null; // 土日
}

function timeStringToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function findCurrentState(dayKey, timeStr) {
  const now = timeStringToMinutes(timeStr);

  // 土日
  if (!dayKey) {
    return { type: "holiday" };
  }

  // 昼休み
  const lunchInfo = lunch[dayKey];
  if (lunchInfo) {
    const s = timeStringToMinutes(lunchInfo.start);
    const e = timeStringToMinutes(lunchInfo.end);
    if (now >= s && now < e) {
      return { type: "lunch", ...lunchInfo };
    }
  }

  const dayTable = timetable[dayKey];

  // 授業中
  for (const p of dayTable) {
    const s = timeStringToMinutes(p.start);
    const e = timeStringToMinutes(p.end);
    if (now >= s && now < e) {
      return {
        type: "class",
        period: p.name,
        subject: p.subject,
        start: p.start,
        end: p.end
      };
    }
  }

  // 休み時間
  for (let i = 0; i < dayTable.length - 1; i++) {
    const curEnd = timeStringToMinutes(dayTable[i].end);
    const nextStart = timeStringToMinutes(dayTable[i + 1].start);
    if (now >= curEnd && now < nextStart) {
      return {
        type: "break",
        next: dayTable[i + 1].name,
        nextSubject: dayTable[i + 1].subject
      };
    }
  }

  return { type: "out" };
}

function render(state, resultDiv, dayKey, timeStr) {
  const dayName = { mon:"月", tue:"火", wed:"水", thu:"木", fri:"金" }[dayKey];

  if (state.type === "class") {
    resultDiv.textContent =
      `今日は${dayName}曜日。\n今は ${state.period}（${state.subject}）です。`;
    return;
  }

  if (state.type === "lunch") {
    resultDiv.textContent =
      `今日は${dayName}曜日。\n今は昼休みです。`;
    return;
  }

  if (state.type === "break") {
    resultDiv.textContent =
      `今日は${dayName}曜日。\n今は休み時間です。次は ${state.next}（${state.nextSubject}）。`;
    return;
  }

  if (state.type === "holiday") {
    resultDiv.textContent = "今日は授業がありません。";
    return;
  }

  resultDiv.textContent = "現在は授業時間外です。";
}

function update() {
  const result = document.getElementById("result");
  const dayKey = getNowDayKey();
  const timeStr = getNowTimeString();
  const state = findCurrentState(dayKey, timeStr);
  render(state, result, dayKey, timeStr);
}

window.addEventListener("DOMContentLoaded", () => {
  update();
  // 1分ごとに自動更新
  setInterval(update, 60000);
});
