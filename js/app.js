// js/app.js

function setupForm() {
  const form = document.getElementById("check-form");
  const resultDiv = document.getElementById("result");

  // 読み込みテスト
  resultDiv.textContent = "読み込み成功（テストメッセージ）";

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    resultDiv.textContent = "判定ボタンが押されました（テスト）";
  });
}

window.addEventListener("DOMContentLoaded", setupForm);
