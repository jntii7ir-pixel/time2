// js/app.js

// "HH:MM" → その日の 0:00 からの経過分に変換する関数
function timeStringToMinutes(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  return hour * 60 + minute;
}

// 曜日＋時刻から、「何時間目か」を探す関数
function findCurrentPeriod(dayKey, hour, minute) {
  const dayTable = timetable[dayKey];
  if (!dayTable || dayTable.length === 0) {
    return null; // 時間割が設定されていない場合
  }

  const nowMinutes = hour * 60 + minute;

  for (const period of dayTable) {
    const start = timeStringToMinutes(period.start);
    const end = timeStringToMinutes(period.end);

    // 授業時間中の条件（開始時刻を含み、終了時刻は含まない）
    if (nowMinutes >= start && nowMinutes < end) {
      return period;
    }
  }

  return null; // どのコマにも当てはまらなかった → 授業時間外
}

// 画面のフォームと結果表示を結びつける
function setupForm() {
  const form = document.getElementById("check-form");
  const weekdaySelect = document.getElementById("weekday");
  const timeInput = document.getElementById("time");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // ページがリロードされるのを防ぐ

    const dayKey = weekdaySelect.value;
    const timeValue = timeInput.value; // "HH:MM" 形式で取れる

    if (!timeValue) {
      resultDiv.textContent = "時刻を入力してください。";
      return;
    }

    const [hourStr, minuteStr] = timeValue.split(":");
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    const period = findCurrentPeriod(dayKey, hour, minute);

    if (period) {
      resultDiv.textContent = `今は ${period.name}（${period.start}〜${period.end}）です。`;
    } else {
      resultDiv.textContent = "今は授業時間外です。";
    }
  });
}

// ページ読み込み時にセットアップ
window.addEventListener("DOMContentLoaded", setupForm);
