// js/app.js

function timeStringToMinutes(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(":");
  return Number(hourStr) * 60 + Number(minuteStr);
}

function findCurrentState(dayKey, timeStr) {
  const dayTable = timetable[dayKey];
  if (!dayTable || dayTable.length === 0) {
    return { type: "no-data" };
  }

  const now = timeStringToMinutes(timeStr);

  // 月曜のみ：昼休み 12:25〜13:10 を表示
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

function setupForm() {
  const form = document.getElementById("check-form");
  const weekdaySelect = document.getElementById("weekday");
  const timeInput = document.getElementById("time");
  const resultDiv = document.getElementById("result");

  resultDiv.textContent = "曜日と時刻を入れて判定してください。";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const dayKey = weekdaySelect.value;
    const timeValue = timeInput.value;

    if (!timeValue) {
      resultDiv.textContent = "時刻を入力してください。";
      return;
    }

    const state = findCurrentState(dayKey, timeValue);

    if (state.type === "class") {
      resultDiv.textContent = `今は ${state.name}（${state.start}〜${state.end}）です。`;
    } else if (state.type === "lunch") {
      resultDiv.textContent = `今は 昼休み（${state.start}〜${state.end}）です。`;
    } else if (state.type === "no-data") {
      resultDiv.textContent = "その曜日の時間割データが未設定です。";
    } else {
      resultDiv.textContent = "今は授業時間外です。";
    }
  });
}

window.addEventListener("DOMContentLoaded", setupForm);
