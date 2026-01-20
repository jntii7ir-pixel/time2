// js/app.js

function timeStringToMinutes(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(":");
  return Number(hourStr) * 60 + Number(minuteStr);
}

function minutesToTimeString(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return String(h).padStart(2, "0") + ":" + String(min).padStart(2, "0");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getNowTimeString() {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

function getNowDayKey() {
  // 0:日 1:月 2:火 3:水 4:木 5:金 6:土
  const d = new Date().getDay();
  if (d === 1) return "mon";
  if (d === 2) return "tue";
  if (d === 3) return "wed";
  if (d === 4) return "thu";
  if (d === 5) return "fri";
  return null; // 土日
}

function sortByStart(table) {
  return [...table].sort((a, b) => timeStringToMinutes(a.start) - timeStringToMinutes(b.start));
}

function findCurrentState(dayKey, timeStr) {
  const dayTableRaw = timetable[dayKey];
  if (!dayTableRaw || dayTableRaw.length === 0) {
    return { type: "no-data" };
  }

  const dayTable = sortByStart(dayTableRaw);
  const now = timeStringToMinutes(timeStr);

  // 月曜のみ：昼休み 12:25〜13:10（あなたの条件を優先）
  if (dayKey === "mon") {
    const lunchStart = timeStringToMinutes("12:25");
    const lunchEnd = timeStringToMinutes("13:10");
    if (now >= lunchStart && now < lunchEnd) {
      return { type: "lunch", start: "12:25", end: "13:10" };
    }
  }

  // 授業中チェック
  for (const period of dayTable) {
    const start = timeStringToMinutes(period.start);
    const end = timeStringToMinutes(period.end);
    if (now >= start && now < end) {
      return { type: "class", name: period.name, start: period.start, end: period.end };
    }
  }

  // 休み時間チェック（授業と次の授業の間）
  for (let i = 0; i < dayTable.length - 1; i++) {
    const cur = dayTable[i];
    const next = dayTable[i + 1];

    const curEnd = timeStringToMinutes(cur.end);
    const nextStart = timeStringToMinutes(next.start);

    if (now >= curEnd && now < nextStart) {
      return {
        type: "break",
        start: cur.end,
        end: next.start,
        nextName: next.name
      };
    }
  }

  // それ以外（始業前・放課後など）
  return { type: "out" };
}

function minutesLeft(nowStr, endStr) {
  return timeStringToMinutes(endStr) - timeStringToMinutes(nowStr);
}

function renderResult(state, resultDiv, nowStr) {
  if (state.type === "class") {
    const left = minutesLeft(nowStr, state.end);
    resultDiv.textContent =
      `今は ${state.name}（${state.start}〜${state.end}）です。終了まであと ${left} 分。`;
    return;
  }

  if (state.type === "lunch") {
    const left = minutesLeft(nowStr, state.end);
    resultDiv.textContent =
      `今は 昼休み（${state.start}〜${state.end}）です。残り ${left} 分。`;
    return;
  }

  if (state.type === "break") {
    const left = minutesLeft(nowStr, state.end);
    resultDiv.textContent =
      `今は 休み時間（${state.start}〜${state.end}）です。次は ${state.nextName}。あと ${left} 分。`;
    return;
  }

  if (state.type === "no-data") {
    resultDiv.textContent = "その曜日の時間割データが未設定です。";
    return;
  }

  resultDiv.textContent = "今は授業時間外です。";
}

function judgeNow(weekdaySelect, timeInput, resultDiv) {
  const dayKey = weekdaySelect.value;
  const timeValue = timeInput.value;

  if (!timeValue) {
    resultDiv.textContent = "時刻を入力してください。";
    return;
  }

  const state = findCurrentState(dayKey, timeValue);
  renderResult(state, resultDiv);
}

function setupForm() {
  const form = document.getElementById("check-form");
  const weekdaySelect = document.getElementById("weekday");
  const timeInput = document.getElementById("time");
  const resultDiv = document.getElementById("result");

  // 初期表示：現在の曜日・時刻を自動セット
  const nowDayKey = getNowDayKey();
  if (nowDayKey) weekdaySelect.value = nowDayKey;
  timeInput.value = getNowTimeString();

  // ページを開いた瞬間に判定
  judgeNow(weekdaySelect, timeInput, resultDiv);

  // ボタンで手動再判定
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    judgeNow(weekdaySelect, timeInput, resultDiv);
  });

  // 曜日・時刻を変えたら即更新
  timeInput.addEventListener("change", function () {
    judgeNow(weekdaySelect, timeInput, resultDiv);
  });
  weekdaySelect.addEventListener("change", function () {
    judgeNow(weekdaySelect, timeInput, resultDiv);
  });
}

window.addEventListener("DOMContentLoaded", setupForm);
