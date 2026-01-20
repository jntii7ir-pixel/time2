// js/app.js

function timeStringToMinutes(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(":");
  return Number(hourStr) * 60 + Number(minuteStr);
}

function findCurrentPeriod(dayKey, timeStr) {
  const dayTable = timetable[dayKey];
  if (!dayTable || dayTable.length === 0) return null;

  const now = timeStringToMinutes(timeStr);

  for (const period of dayTable) {
    const start = timeStringToMinutes(period.start);
    const end = timeStringToMinutes(period.end);

    // 開始は含む、終了は含まない（例：09:40ちょうどは次の時間扱い）
    if (now >= start && now < end) return period;
  }

  return null;
}

function setupForm() {
  const form = document.getElementById("check-form");
  const weekdaySelect = document.getElementById("weekday");
  const timeInput = document.getElementById("time");
  const resultDiv = document.getElementById("result");

  resultDiv.textContent = "曜日と時刻を入れて「判定する」を押してください。";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const dayKey = weekdaySelect.value;
    const timeValue = timeInput.value;

    if (!timeValue) {
      resultDiv.textContent = "時刻を入力してください。";
      return;
    }

    const period = findCurrentPeriod(dayKey, timeValue);

    if (period) {
      resultDiv.textContent = `今は ${period.name}（${period.start}〜${period.end}）です。`;
    } else {
      resultDiv.textContent = "今は授業時間外です。";
    }
  });
}

window.addEventListener("DOMContentLoaded", setupForm);
