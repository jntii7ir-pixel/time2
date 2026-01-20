// js/app.js

function timeStringToMinutes(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(":");
  return Number(hourStr) * 60 + Number(minuteStr);
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

function findCurrentState(dayKey, timeStr) {
  const dayTable = timetable[dayKey];
  if (!dayTable || dayTable.length === 0) {
    return { type: "no-data" };
  }

  const now = timeStringToMinutes(timeStr);

  // 月曜のみ：昼休み 12:25〜13:10
  if (dayKey === "mon") {
    const lunchStart = timeStringToMinutes("12:25");
    const lunchEnd = timeStringToMinutes("13:10");
    if (now >= lunchStart && now < lunchEnd) {
      return { type: "lunch", name: "昼休み", start: "12:25", end: "13:10" };
    }
  }

  for (const period of dayTable) {
    const start = timeStringToMinutes(period.start);
    const end = timeStringToMinutes(period.end);
    if (now >= start && now < end) {
      return { type: "class", ...period };
    }
  }

  return { type: "out" };
}

function renderResult(state, resultDiv) {
  if (state.type === "class") {
    resultDiv.textContent = `今は ${state.name}（${state.start}〜${state.end}）です。`;
  } else if (state.type === "lunch") {
    resultDiv.textContent = `今は 昼休み（${state.start}〜${state.end}）です。`;
  } else if (state.type === "no-data") {
    resultDiv.textContent = "その曜日の時間割データが未設定です。";
  } else {
    resultDiv.textContent = "今は授業時間外です。";
  }
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

  // ボタンで手動再判定も可能
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    judgeNow(weekdaySelect, timeInput, resultDiv);
  });

  // 時刻を変えたら即更新したい場合（任意）
  timeInput.addEventListener("change", function () {
    judgeNow(weekdaySelect, timeInput, resultDiv);
  });

  weekdaySelect.addEventListener("change", function () {
    judgeNow(weekdaySelect, timeInput, resultDiv);
  });
}

window.addEventListener("DOMContentLoaded", setupForm);
