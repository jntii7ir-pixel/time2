// js/app.js

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getNowTimeString() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// "HH:MM" を 分 に変換
function toMin(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// nowStr("11:56") から endStr("12:45") までの残り分
function minutesLeft(nowStr, endStr) {
  if (!nowStr || !endStr) return 0;

  const now = toMin(nowStr);
  const end = toMin(endStr);

  // 同日内の想定。負になる場合は0扱いにする（授業外判定は別でやる前提）
  return Math.max(0, end - now);
}

function getRoom(dayKey, periodNumber) {
  return rooms?.[dayKey]?.[periodNumber] || "教室未設定";
}

function getItems(dayKey, periodNumber) {
  return items?.[dayKey]?.[periodNumber] || [];
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

function getNextSchoolDayKey() {
  // 今日以降で最初に来る「授業がある日(mon-fri)」を返す
  // finished のときは「次の日」扱いにしたいので +1 から探す
  const order = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const d = new Date();
  let idx = d.getDay(); // 0-6
  for (let step = 1; step <= 7; step++) {
    const nextIdx = (idx + step) % 7;
    const key = order[nextIdx];
    if (key === "mon" || key === "tue" || key === "wed" || key === "thu" || key === "fri") {
      return key;
    }
  }
  return "mon";
}

function getFirstPeriodInfo(dayKey) {
  const dayTable = timetable?.[dayKey];
  if (!dayTable || dayTable.length === 0) return null;
  const first = dayTable[0]; // 1時間目
  return {
    period: first.name,          // "1時間目"
    subject: first.subject || "",// 科目
    start: first.start,          // 開始時刻
    end: first.end
  };
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

function render(state, dayKey, timeStr) {
  const nowDiv = document.getElementById("now");
  const mainDiv = document.getElementById("main");
  const roomDiv = document.getElementById("room");
  const itemsDiv = document.getElementById("items");
  const leftDiv = document.getElementById("left");

  const dayName = { mon:"月", tue:"火", wed:"水", thu:"木", fri:"金" }[dayKey];

  nowDiv.textContent = `${dayName}曜日 ${timeStr}`;

  if (state.type === "class") {
    const periodNum = Number(state.period.replace("時間目", ""));
    const room = getRoom(dayKey, periodNum);
    const itemList = getItems(dayKey, periodNum);
    const left = minutesLeft(timeStr, state.end);

    mainDiv.textContent = `今は ${state.period}（${state.subject}）`;
    roomDiv.textContent = `教室：${room}`;
    itemsDiv.textContent = `持ち物：${itemList.length ? itemList.join("、") : "特になし"}`;
    leftDiv.textContent = `終了まであと ${left} 分`;
    return;
  }

  if (state.type === "lunch") {
    mainDiv.textContent = "今は昼休み";
    roomDiv.textContent = "";
    itemsDiv.textContent = "";
    leftDiv.textContent = `残り ${minutesLeft(timeStr, state.end)} 分`;
    return;
  }

  if (state.type === "break") {
    mainDiv.textContent = "今は休み時間";
    roomDiv.textContent = "";
    itemsDiv.textContent = `次は ${state.next}（${state.nextSubject}）`;
    leftDiv.textContent = "";
    return;
  }
  
if (state.type === "finished") {
  const nextDayKey = getNextSchoolDayKey();
  const nextDayName = { mon:"月", tue:"火", wed:"水", thu:"木", fri:"金" }[nextDayKey];

  const first = getFirstPeriodInfo(nextDayKey);

  mainDiv.textContent = "本日の授業はすべて終了しました";

  if (!first) {
    roomDiv.textContent = "";
    itemsDiv.textContent = "";
    leftDiv.textContent = `次の授業情報（${nextDayName}）が未設定です。`;
    return;
  }

  // 教室・持ち物（ファイルがある場合だけ）
  const periodNum = 1;

  const room =
    (typeof getRoom === "function") ? getRoom(nextDayKey, periodNum) : "教室未設定";

  const itemList =
    (typeof getItems === "function") ? getItems(nextDayKey, periodNum) : [];

  const itemsText = itemList.length ? itemList.join("、") : "特になし";

  roomDiv.textContent = `次回：${nextDayName}曜 ${first.period}（${first.start}〜）`;
  itemsDiv.textContent = `科目：${first.subject || "未設定"} / 教室：${room}`;
  leftDiv.textContent = `持ち物：${itemsText}`;
  return;
}

  mainDiv.textContent = "現在は授業時間外です";
  roomDiv.textContent = "";
  itemsDiv.textContent = "";
  leftDiv.textContent = "";
}

function update() {
  const result = document.getElementById("result");
  const dayKey = getNowDayKey();
  const timeStr = getNowTimeString();
  const state = findCurrentState(dayKey, timeStr);
  render(state, dayKey, timeStr);
}

window.addEventListener("DOMContentLoaded", () => {
  // まず1回実行
  update();

  // 次の「分」の境界に合わせて、その後は1分ごとに更新
  (function startMinuteAlignedReload() {
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    setTimeout(() => {
      update();
      setInterval(update, 60000);
    }, msToNextMinute);
  })();
}); 
