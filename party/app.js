// app.js
// [UI 상태 관리 및 이벤트 바인딩]

const {
  parseParticipants,
  parseCardMessages,
  calculateSettlement,
} = window.PartyCalc;

const {
  buildKakaoNoticeText,
  downloadReceiptImage,
} = window.PartyExporter;

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const state = {
  mode: "post", // 'post' | 'prepaid'
  participants: [],
  prepaidMap: {},
  expenses: [], // { id, name, amount, attendees: [] }
  roundUnit: "trunc_100",
  surplusMode: "refund",
};

const eventTitleInput = document.getElementById("eventTitle");
const modeBtns = document.querySelectorAll(".mode-btn");
const participantInput = document.getElementById("participantInput");
const addParticipantsBtn = document.getElementById("addParticipantsBtn");
const prepaidPanel = document.getElementById("prepaidPanel");
const bulkPrepaidAmount = document.getElementById("bulkPrepaidAmount");
const applyBulkPrepaidBtn = document.getElementById("applyBulkPrepaidBtn");
const prepaidList = document.getElementById("prepaidList");

const smsInput = document.getElementById("smsInput");
const parseSmsBtn = document.getElementById("parseSmsBtn");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseList = document.getElementById("expenseList");

const roundUnitSelect = document.getElementById("roundUnit");
const surplusOptionBox = document.getElementById("surplusOptionBox");
const surplusModeSelect = document.getElementById("surplusMode");
const summaryCards = document.getElementById("summaryCards");
const resultBody = document.getElementById("resultBody");

const bankNameInput = document.getElementById("bankName");
const accountNumberInput = document.getElementById("accountNumber");
const accountHolderInput = document.getElementById("accountHolder");
const easyPayNoteInput = document.getElementById("easyPayNote");
const copyNoticeBtn = document.getElementById("copyNoticeBtn");
const downloadReceiptBtn = document.getElementById("downloadReceiptBtn");
const exportToast = document.getElementById("exportToast");

function formatKRW(num) {
  return `${num.toLocaleString("ko-KR")}원`;
}

let toastTimer = null;
function showToast(msg) {
  exportToast.textContent = msg;
  exportToast.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    exportToast.classList.add("hidden");
  }, 3000);
}

function getCurrentSummary() {
  return calculateSettlement({
    mode: state.mode,
    participants: state.participants,
    prepaidMap: state.prepaidMap,
    expenses: state.expenses,
    roundUnit: state.roundUnit,
    surplusMode: state.surplusMode,
  });
}

function getBankInfo() {
  return {
    bankName: bankNameInput.value,
    accountNumber: accountNumberInput.value,
    accountHolder: accountHolderInput.value,
    easyPayNote: easyPayNoteInput.value,
  };
}

// 정산 모드 전환
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.mode = btn.dataset.mode;

    const isPrepaid = state.mode === "prepaid";
    prepaidPanel.classList.toggle("hidden", !isPrepaid);
    surplusOptionBox.classList.toggle("hidden", !isPrepaid);
    document.querySelectorAll(".col-prepaid").forEach((el) => {
      el.classList.toggle("hidden", !isPrepaid);
    });

    renderAll();
  });
});

// 참석자 일괄 등록
addParticipantsBtn.addEventListener("click", () => {
  const parsed = parseParticipants(participantInput.value);
  if (parsed.length === 0) {
    alert("참석자 이름을 한 명 이상 입력해 주세요.");
    return;
  }

  state.participants = parsed;
  const defaultPrepaid = Number(bulkPrepaidAmount.value) || 0;

  parsed.forEach((name) => {
    if (state.prepaidMap[name] === undefined) {
      state.prepaidMap[name] = defaultPrepaid;
    }
  });

  state.expenses.forEach((exp) => {
    exp.attendees = [...parsed];
  });

  renderAll();
});

// 일괄 선납 회비 적용
applyBulkPrepaidBtn.addEventListener("click", () => {
  const val = Math.max(0, Number(bulkPrepaidAmount.value) || 0);
  state.participants.forEach((name) => {
    state.prepaidMap[name] = val;
  });
  renderPrepaidInputs();
  renderResults();
});

// 카드 승인 문자 자동 추출
parseSmsBtn.addEventListener("click", () => {
  const extracted = parseCardMessages(smsInput.value);
  if (extracted.length === 0) {
    alert("금액('원' 앞의 숫자)이 포함된 승인 내역을 찾지 못했습니다.");
    return;
  }

  extracted.forEach((item) => {
    state.expenses.push({
      id: createId(),
      name: item.name,
      amount: item.amount,
      attendees: [...state.participants],
    });
  });

  smsInput.value = "";
  renderAll();
});

// 지출 내역 수동 추가
addExpenseBtn.addEventListener("click", () => {
  const name = expenseName.value.trim() || `${state.expenses.length + 1}차 지출`;
  const amount = parseInt(expenseAmount.value, 10);

  if (isNaN(amount) || amount <= 0) {
    alert("올바른 금액을 입력해 주세요.");
    return;
  }

  state.expenses.push({
    id: createId(),
    name,
    amount,
    attendees: [...state.participants],
  });

  expenseName.value = "";
  expenseAmount.value = "";
  renderAll();
});

roundUnitSelect.addEventListener("change", (e) => {
  state.roundUnit = e.target.value;
  renderResults();
});

surplusModeSelect.addEventListener("change", (e) => {
  state.surplusMode = e.target.value;
  renderResults();
});

// 카톡 공지방 텍스트 클립보드 복사 (HTTPS + file:// 로컬 폴백 지원)
copyNoticeBtn.addEventListener("click", async () => {
  if (state.participants.length === 0) {
    alert("먼저 참석자 명단을 등록해 주세요.");
    return;
  }

  const noticeText = buildKakaoNoticeText({
    title: eventTitleInput.value,
    summary: getCurrentSummary(),
    surplusMode: state.surplusMode,
    bankInfo: getBankInfo(),
  });

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(noticeText);
    } else {
      const tempArea = document.createElement("textarea");
      tempArea.value = noticeText;
      tempArea.style.position = "fixed";
      tempArea.style.left = "-9999px";
      document.body.appendChild(tempArea);
      tempArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempArea);
    }
    showToast("카톡 공지방 안내문이 클립보드에 복사되었습니다! 단톡방에 바로 붙여넣으세요.");
  } catch (err) {
    alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
  }
});

// 영수증형 결산 리포트 PNG 다운로드
downloadReceiptBtn.addEventListener("click", () => {
  if (state.participants.length === 0) {
    alert("먼저 참석자 명단을 등록해 주세요.");
    return;
  }

  downloadReceiptImage({
    title: eventTitleInput.value,
    summary: getCurrentSummary(),
    surplusMode: state.surplusMode,
    bankInfo: getBankInfo(),
  });

  showToast("영수증형 결산 리포트(PNG) 이미지가 저장되었습니다!");
});

function renderPrepaidInputs() {
  if (state.participants.length === 0) {
    prepaidList.innerHTML = `<p class="empty-msg">먼저 참석자 명단을 등록해 주세요.</p>`;
    return;
  }

  prepaidList.innerHTML = state.participants
    .map(
      (name) => `
      <div class="prepaid-item">
        <span>${name}</span>
        <input type="number" data-name="${name}" value="${state.prepaidMap[name] ?? 0}" step="1000" min="0" />
      </div>
    `
    )
    .join("");

  prepaidList.querySelectorAll("input").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const targetName = e.target.dataset.name;
      state.prepaidMap[targetName] = Math.max(0, Number(e.target.value) || 0);
      renderResults();
    });
  });
}

function renderExpenses() {
  if (state.expenses.length === 0) {
    expenseList.innerHTML = `<p class="empty-msg">등록된 지출 내역이 없습니다.</p>`;
    return;
  }

  expenseList.innerHTML = state.expenses
    .map((exp) => {
      const chipsHtml =
        state.participants.length === 0
          ? `<span class="hint">※ 참석자 명단을 먼저 등록하면 인원 체크가 가능합니다.</span>`
          : state.participants
              .map((person) => {
                const isChecked = exp.attendees.includes(person);
                return `<button type="button" class="chip ${isChecked ? "checked" : ""}" data-exp-id="${exp.id}" data-person="${person}">${person}</button>`;
              })
              .join("");

      return `
        <div class="expense-card">
          <div class="expense-top">
            <span class="expense-title">${exp.name} <small style="color:var(--text-muted);font-weight:400;">(${exp.attendees.length}명 참석)</small></span>
            <div class="expense-meta">
              <span class="expense-price">${formatKRW(exp.amount)}</span>
              <button type="button" class="btn-del" data-del-id="${exp.id}">삭제</button>
            </div>
          </div>
          <div class="attendee-chips">${chipsHtml}</div>
        </div>
      `;
    })
    .join("");

  expenseList.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const { expId, person } = chip.dataset;
      const targetExp = state.expenses.find((e) => e.id === expId);
      if (!targetExp) return;

      if (targetExp.attendees.includes(person)) {
        targetExp.attendees = targetExp.attendees.filter((p) => p !== person);
      } else {
        targetExp.attendees.push(person);
      }
      renderExpenses();
      renderResults();
    });
  });

  expenseList.querySelectorAll(".btn-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.delId;
      state.expenses = state.expenses.filter((e) => e.id !== id);
      renderExpenses();
      renderResults();
    });
  });
}

function renderResults() {
  const isPrepaid = state.mode === "prepaid";
  const summary = getCurrentSummary();

  if (isPrepaid) {
    summaryCards.innerHTML = `
      <div class="stat-box"><div class="label">총 선납 회비</div><div class="val">${formatKRW(summary.totalPrepaid)}</div></div>
      <div class="stat-box"><div class="label">총 지출 금액</div><div class="val">${formatKRW(summary.totalSpent)}</div></div>
      <div class="stat-box"><div class="label">추가 징수 합계</div><div class="val tag-collect">+${formatKRW(summary.totalCollect)}</div></div>
      <div class="stat-box"><div class="label">${state.surplusMode === "carryover" ? "차기 공금 이월액" : "환급 후 잔액(차액)"}</div><div class="val tag-carry">${formatKRW(summary.netCashInHand)}</div></div>
    `;
  } else {
    summaryCards.innerHTML = `
      <div class="stat-box"><div class="label">총 지출 금액</div><div class="val">${formatKRW(summary.totalSpent)}</div></div>
      <div class="stat-box"><div class="label">총 걷을 금액</div><div class="val" style="color:var(--accent)">${formatKRW(summary.totalCollect)}</div></div>
      <div class="stat-box"><div class="label">절사/반올림 차액</div><div class="val">${summary.netCashInHand >= 0 ? "+" : ""}${formatKRW(summary.netCashInHand)}</div></div>
    `;
  }

  if (summary.rows.length === 0) {
    resultBody.innerHTML = `<tr><td colspan="5" class="empty-cell">참석자 명단을 입력하면 계산 결과가 표시됩니다.</td></tr>`;
    return;
  }

  resultBody.innerHTML = summary.rows
    .map((row) => {
      const tagClass =
        row.status === "collect"
          ? "tag-collect"
          : row.status === "refund"
          ? "tag-refund"
          : row.status === "carry"
          ? "tag-carry"
          : "tag-done";

      return `
        <tr>
          <td>${row.name}</td>
          <td class="col-prepaid ${isPrepaid ? "" : "hidden"}">${formatKRW(row.prepaid)}</td>
          <td>${formatKRW(row.used)}</td>
          <td><span class="${tagClass}">${row.statusLabel}</span></td>
          <td><strong class="${tagClass}">${formatKRW(row.finalAmount)}</strong></td>
        </tr>
      `;
    })
    .join("");
}

function renderAll() {
  renderPrepaidInputs();
  renderExpenses();
  renderResults();
}

renderAll();
