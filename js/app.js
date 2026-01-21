// js/app.js

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getNowTimeString() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function getNowDayKey() {
  const d = new Date().getDay();
  if (d === 1) return "mon";
  if (d === 2) return "tue";
  if (d === 3) return "wed";
  if (d === 4) return "thu";
  if (d === 5) return "fri";
  return null; // 土日は null にする
}

function timeStringToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function findCurrentState(dayKey, timeStr) {
  const now = timeStringToMinutes(timeStr);

  // 昼休み優先
  const lunchInfo = lunch[dayKey];
  if (lunchInfo) {
    const s = timeStringToMinutes(lunchInfo.start);
    const e = timeStringToMinutes(lunchInfo.end);
    if (now >= s && now < e) {
      return { type: "lunch", ...lunchInfo };
    }
  }

  const dayTable = timetable[dayKey] || [];

  // 授業
  for (const p of dayTable) {
    const s = timeStringToMinutes(p.start);
    const e = timeStringToMinutes(p.end);
    if (now >= s && now < e) {
      return { type: "class", ...p };
    }
  }

  // 休み時間
  for (let i = 0; i < dayTable.length - 1; i++) {
    const curEnd = timeStringToMinutes(dayTable[i].end);
    const nextStart = timeStringToMinutes(dayTable[i + 1].start);
    if (now >= curEnd && now < nextStart) {
      return {
        type: "break",
        start: dayTable[i].end,
        end: dayTable[i + 1].start,
        next: dayTable[i + 1].name
      };
    }
  }

  return { type: "out" };
}

function minutesLeft(now, end) {
  return timeStringToMinutes(end) - timeStringToMinutes(now);
}

function render(state, resultDiv, now) {
  if (state.type === "class") {
    resultDiv.textContent =
      `今は ${state.name}（${state.subject}）です。終了まであと ${minutesLeft(now, state.end)} 分。`;
    return;
  }
  if (state.type === "lunch") {
    resultDiv.textContent =
      `今は 昼休み（${state.start}〜${state.end}）。残り ${minutesLeft(now, state.end)} 分。`;
    return;
  }
  if (state.type === "break") {
    resultDiv.textContent =
      `今は 休み時間（${state.start}〜${state.end}）。次は ${state.next}、あと ${minutesLeft(now, state.end)} 分。`;
    return;
  }
  resultDiv.textContent = "今は授業時間外です。";
}

function setup() {
  const weekday = document.getElementById("weekday");
  const timeInput = document.getElementById("time");
  const result = document.getElementById("result");

  const dayKey = getNowDayKey();
  if (dayKey) {
    weekday.value = dayKey;
  } else {
    // 土日は月曜を仮選択（任意）
    weekday.value = "mon";
  }

  timeInput.value = getNowTimeString();

  function update() {
    const state = findCurrentState(weekday.value, timeInput.value);
    render(state, result, timeInput.value);
  }

  update();
  weekday.addEventListener("change", update);
  timeInput.addEventListener("change", update);
}

window.addEventListener("DOMContentLoaded", setup);
