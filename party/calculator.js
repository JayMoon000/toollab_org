// calculator.js
// [입력 검증 및 핵심 계산 로직] UI·출력 모듈과 완전히 분리된 순수 연산 엔진

(function (global) {
  function parseParticipants(rawText) {
    if (!rawText || !rawText.trim()) return [];
    const tokens = rawText
      .split(/[,\n\r\s]+/)
      .map((name) => name.trim())
      .filter(Boolean);
    return [...new Set(tokens)];
  }

  function parseCardMessages(rawText) {
    if (!rawText || !rawText.trim()) return [];

    const normalized = rawText.replace(/\[Web발신\]/g, "\n");
    const lines = normalized
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const results = [];
    const amountRegex = /([\d,]+)\s*원/;

    lines.forEach((line) => {
      const match = line.match(amountRegex);
      if (!match) return;

      const amount = parseInt(match[1].replace(/,/g, ""), 10);
      if (isNaN(amount) || amount <= 0) return;

      let merchant = line
        .replace(amountRegex, "")
        .replace(/(신한|국민|KB|현대|삼성|롯데|우리|하나|농협|NH|BC|카카오뱅크|토스뱅크|기업|IBK)카드?/gi, "")
        .replace(/(체크|신용|법인)?\s*승인/g, "")
        .replace(/(일시불|\d+개월)/g, "")
        .replace(/\d{1,2}\/\d{1,2}/g, "")
        .replace(/\d{1,2}:\d{2}(:\d{2})?/g, "")
        .replace(/[가-힣]\*[가-힣]/g, "")
        .replace(/(누적|잔액).*$/g, "")
        .replace(/[\[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!merchant || merchant.length < 2) {
        merchant = `지출 내역 #${results.length + 1}`;
      }

      results.push({ name: merchant, amount });
    });

    return results;
  }

  function applyUnitRounding(value, unitRule) {
    switch (unitRule) {
      case "trunc_10":
        return Math.floor(value / 10) * 10;
      case "round_10":
        return Math.round(value / 10) * 10;
      case "trunc_100":
        return Math.floor(value / 100) * 100;
      case "round_100":
        return Math.round(value / 100) * 100;
      case "exact":
      default:
        return Math.round(value);
    }
  }

  function calculateSettlement({
    mode,
    participants,
    prepaidMap = {},
    expenses = [],
    roundUnit = "trunc_100",
    surplusMode = "refund",
  }) {
    const rawUsage = {};
    participants.forEach((p) => {
      rawUsage[p] = 0;
    });

    let totalSpent = 0;

    const expenseDetails = expenses.map((exp) => {
      const validAttendees = exp.attendees.filter((name) => participants.includes(name));
      const count = validAttendees.length;
      const perPerson = count > 0 ? exp.amount / count : 0;

      if (count > 0) {
        totalSpent += exp.amount;
        validAttendees.forEach((name) => {
          rawUsage[name] += perPerson;
        });
      }

      return {
        ...exp,
        validCount: count,
        perPerson: Math.round(perPerson),
      };
    });

    let totalPrepaid = 0;
    let totalAdjustedUsage = 0;
    let totalCollect = 0;
    let totalRefund = 0;

    const rows = participants.map((name) => {
      const prepaid = mode === "prepaid" ? Number(prepaidMap[name] || 0) : 0;
      const used = applyUnitRounding(rawUsage[name], roundUnit);

      totalPrepaid += prepaid;
      totalAdjustedUsage += used;

      if (mode === "post") {
        totalCollect += used;
        return {
          name,
          prepaid: 0,
          used,
          status: used > 0 ? "collect" : "done",
          statusLabel: used > 0 ? "입금 필요" : "해당 없음",
          finalAmount: used,
        };
      } else {
        const diff = prepaid - used;
        if (diff < 0) {
          const extra = Math.abs(diff);
          totalCollect += extra;
          return {
            name,
            prepaid,
            used,
            status: "collect",
            statusLabel: "추가 입금",
            finalAmount: extra,
          };
        } else if (diff > 0) {
          if (surplusMode === "carryover") {
            return {
              name,
              prepaid,
              used,
              status: "carry",
              statusLabel: "공금 이월",
              finalAmount: diff,
            };
          } else {
            totalRefund += diff;
            return {
              name,
              prepaid,
              used,
              status: "refund",
              statusLabel: "환급 대상",
              finalAmount: diff,
            };
          }
        } else {
          return {
            name,
            prepaid,
            used,
            status: "done",
            statusLabel: "정산 완료",
            finalAmount: 0,
          };
        }
      }
    });

    const netCashInHand =
      mode === "post"
        ? totalCollect - totalSpent
        : totalPrepaid + totalCollect - totalRefund - totalSpent;

    return {
      mode,
      totalSpent,
      totalPrepaid,
      totalAdjustedUsage,
      totalCollect,
      totalRefund,
      netCashInHand,
      expenseDetails,
      rows,
    };
  }

  global.PartyCalc = {
    parseParticipants,
    parseCardMessages,
    applyUnitRounding,
    calculateSettlement,
  };
})(window);
