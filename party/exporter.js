// exporter.js
// [결과 출력 및 공유 모듈] 카톡 공지 텍스트 생성 및 HTML5 Canvas 영수증 PNG 렌더링

(function (global) {
  function fmt(num) {
    return `${Number(num || 0).toLocaleString("ko-KR")}원`;
  }

  function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }

  /**
   * 카카오톡 공지방 붙여넣기용 정산 안내문 생성
   */
  function buildKakaoNoticeText({ title, summary, surplusMode, bankInfo }) {
    const safeTitle = title && title.trim() ? title.trim() : "모임 정산 내역";
    const isPrepaid = summary.mode === "prepaid";
    const lines = [];

    lines.push(`[${safeTitle}]`);
    lines.push(`결산일시: ${getTodayString()}`);
    lines.push(`정산방식: ${isPrepaid ? "선회비 예치 정산" : "사후 N빵 차등 정산"}`);
    lines.push("────────────────────");

    // 1. 지출 내역
    lines.push("■ 지출 내역");
    if (summary.expenseDetails.length === 0) {
      lines.push("- 등록된 지출 없음");
    } else {
      summary.expenseDetails.forEach((exp, idx) => {
        lines.push(
          `${idx + 1}. ${exp.name}: ${fmt(exp.amount)} (${exp.validCount}명 / 1인 ${fmt(exp.perPerson)})`
        );
      });
    }
    lines.push(`▶ 총 지출 합계: ${fmt(summary.totalSpent)}`);
    if (isPrepaid) {
      lines.push(`▶ 총 선납 회비: ${fmt(summary.totalPrepaid)}`);
    }
    lines.push("────────────────────");

    // 2. 개인별 정산 결과
    lines.push("■ 개인별 정산 내역");
    summary.rows.forEach((row) => {
      if (isPrepaid) {
        if (row.status === "collect") {
          lines.push(`- ${row.name}: +${fmt(row.finalAmount)} 추가 입금 (선납 ${fmt(row.prepaid)} / 사용 ${fmt(row.used)})`);
        } else if (row.status === "refund") {
          lines.push(`- ${row.name}: -${fmt(row.finalAmount)} 환급 대상 (선납 ${fmt(row.prepaid)} / 사용 ${fmt(row.used)})`);
        } else if (row.status === "carry") {
          lines.push(`- ${row.name}: ${fmt(row.finalAmount)} 차기 공금 이월 (선납 ${fmt(row.prepaid)} / 사용 ${fmt(row.used)})`);
        } else {
          lines.push(`- ${row.name}: 0원 정산 완료 (선납 ${fmt(row.prepaid)} / 사용 ${fmt(row.used)})`);
        }
      } else {
        lines.push(`- ${row.name}: ${fmt(row.finalAmount)}`);
      }
    });

    lines.push("────────────────────");
    if (isPrepaid) {
      lines.push(`▶ 추가 징수 합계: ${fmt(summary.totalCollect)}`);
      if (surplusMode === "carryover") {
        lines.push(`▶ 차기 공금 이월 잔액: ${fmt(summary.netCashInHand)}`);
      } else {
        lines.push(`▶ 총 환급액: ${fmt(summary.totalRefund)} (잔여 차액 ${fmt(summary.netCashInHand)})`);
      }
    } else {
      lines.push(`▶ 총 수납 예정액: ${fmt(summary.totalCollect)} (절사/반올림 차액 ${fmt(summary.netCashInHand)})`);
    }

    // 3. 입금 계좌 안내 (입력된 경우만)
    const { bankName, accountNumber, accountHolder, easyPayNote } = bankInfo || {};
    const hasAccount = (bankName && bankName.trim()) || (accountNumber && accountNumber.trim()) || (accountHolder && accountHolder.trim());
    const hasEasyPay = easyPayNote && easyPayNote.trim();

    if (hasAccount || hasEasyPay) {
      lines.push("────────────────────");
      lines.push("■ 입금 안내");
      if (hasAccount) {
        const accStr = [bankName?.trim(), accountNumber?.trim(), accountHolder?.trim() ? `(${accountHolder.trim()})` : ""]
          .filter(Boolean)
          .join(" ");
        lines.push(`계좌: ${accStr}`);
      }
      if (hasEasyPay) {
        lines.push(`간편송금: ${easyPayNote.trim()}`);
      }
    }

    lines.push("────────────────────");
    lines.push("정산 계산기: https://toollab.org/party");

    return lines.join("
");
  }

  /**
   * HTML5 Canvas로 고해상도 영수증형 결산 리포트 PNG 생성 및 다운로드
   */
  function downloadReceiptImage({ title, summary, surplusMode, bankInfo }) {
    const safeTitle = title && title.trim() ? title.trim() : "모임 회비 결산 리포트";
    const isPrepaid = summary.mode === "prepaid";
    const { bankName, accountNumber, accountHolder, easyPayNote } = bankInfo || {};
    const hasAccount = (bankName && bankName.trim()) || (accountNumber && accountNumber.trim()) || (accountHolder && accountHolder.trim());
    const hasEasyPay = easyPayNote && easyPayNote.trim();

    const width = 760;
    const scale = 2; // 고해상도 레티나 출력
    const padX = 40;

    // 동적 높이 계산
    const expenseCount = Math.max(1, summary.expenseDetails.length);
    const rowCount = Math.max(1, summary.rows.length);
    let height = 280; // 헤더 + 요약 카드
    height += 65 + expenseCount * 36; // 지출 상세 섹션
    height += 85 + rowCount * 40; // 개인별 정산표 섹션
    if (hasAccount || hasEasyPay) {
      height += 115;
    }
    height += 70; // 푸터 여백

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    // 1. 배경 및 외곽 카드
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#131c31";
    roundRect(ctx, 20, 20, width - 40, height - 40, 16, true, false);
    ctx.strokeStyle = "#273554";
    ctx.lineWidth = 1.5;
    roundRect(ctx, 20, 20, width - 40, height - 40, 16, false, true);

    let y = 58;

    // 2. 상단 뱃지 & 모임 제목
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 12px 'Malgun Gothic', sans-serif";
    ctx.fillText("TOOLLAB ACCOUNTING RECEIPT", padX, y);

    y += 30;
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 24px 'Malgun Gothic', sans-serif";
    ctx.fillText(truncateText(ctx, safeTitle, width - padX * 2), padX, y);

    y += 24;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px 'Malgun Gothic', sans-serif";
    const modeLabel = isPrepaid ? "선회비 예치 정산" : "사후 N빵 차등 정산";
    ctx.fillText(`결산 일시: ${getTodayString()}  |  정산 방식: ${modeLabel}`, padX, y);

    y += 22;
    drawDashedLine(ctx, padX, y, width - padX, y);
    y += 24;

    // 3. 회계 요약 박스
    const boxGap = 12;
    const stats = isPrepaid
      ? [
          { label: "총 선납 회비", val: fmt(summary.totalPrepaid), color: "#f1f5f9" },
          { label: "총 지출 금액", val: fmt(summary.totalSpent), color: "#38bdf8" },
          { label: "추가 징수 합계", val: `+${fmt(summary.totalCollect)}`, color: "#fb7185" },
          {
            label: surplusMode === "carryover" ? "차기 공금 이월" : "환급 후 잔액",
            val: fmt(summary.netCashInHand),
            color: "#fbbf24",
          },
        ]
      : [
          { label: "총 지출 금액", val: fmt(summary.totalSpent), color: "#f1f5f9" },
          { label: "총 수납 예정액", val: fmt(summary.totalCollect), color: "#38bdf8" },
          { label: "절사/반올림 차액", val: fmt(summary.netCashInHand), color: "#fbbf24" },
        ];

    const boxW = (width - padX * 2 - boxGap * (stats.length - 1)) / stats.length;
    stats.forEach((st, i) => {
      const bx = padX + i * (boxW + boxGap);
      ctx.fillStyle = "#0b1120";
      roundRect(ctx, bx, y, boxW, 68, 10, true, false);
      ctx.strokeStyle = "#273554";
      ctx.lineWidth = 1;
      roundRect(ctx, bx, y, boxW, 68, 10, false, true);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px 'Malgun Gothic', sans-serif";
      ctx.fillText(st.label, bx + 12, y + 24);

      ctx.fillStyle = st.color;
      ctx.font = "bold 16px 'Malgun Gothic', sans-serif";
      ctx.fillText(st.val, bx + 12, y + 50);
    });

    y += 96;

    // 4. 차수별 지출 상세
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 15px 'Malgun Gothic', sans-serif";
    ctx.fillText("1. 차수별 지출 상세 내역", padX, y);
    y += 24;

    if (summary.expenseDetails.length === 0) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px 'Malgun Gothic', sans-serif";
      ctx.fillText("등록된 지출 내역이 없습니다.", padX, y + 8);
      y += 36;
    } else {
      summary.expenseDetails.forEach((exp, idx) => {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "14px 'Malgun Gothic', sans-serif";
        const leftLabel = `${idx + 1}. ${exp.name} (${exp.validCount}명 참석 · 1인 ${fmt(exp.perPerson)})`;
        ctx.fillText(truncateText(ctx, leftLabel, 470), padX, y + 10);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 14px 'Malgun Gothic', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(fmt(exp.amount), width - padX, y + 10);
        ctx.textAlign = "left";

        y += 34;
      });
    }

    y += 10;
    drawDashedLine(ctx, padX, y, width - padX, y);
    y += 28;

    // 5. 참석자별 개인 정산표
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 15px 'Malgun Gothic', sans-serif";
    ctx.fillText("2. 참석자별 개인 정산 결과", padX, y);
    y += 24;

    // 테이블 헤더
    ctx.fillStyle = "#1b2640";
    ctx.fillRect(padX, y, width - padX * 2, 32);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 12px 'Malgun Gothic', sans-serif";
    ctx.fillText("이름", padX + 12, y + 21);

    if (isPrepaid) {
      ctx.textAlign = "right";
      ctx.fillText("선납액", width - padX - 290, y + 21);
      ctx.fillText("실제 사용액", width - padX - 185, y + 21);
      ctx.fillText("정산 구분", width - padX - 95, y + 21);
      ctx.fillText("최종 정산액", width - padX - 12, y + 21);
      ctx.textAlign = "left";
    } else {
      ctx.textAlign = "right";
      ctx.fillText("실제 사용액", width - padX - 200, y + 21);
      ctx.fillText("구분", width - padX - 105, y + 21);
      ctx.fillText("입금할 금액", width - padX - 12, y + 21);
      ctx.textAlign = "left";
    }

    y += 32;

    summary.rows.forEach((row, idx) => {
      if (idx % 2 === 1) {
        ctx.fillStyle = "rgba(11, 17, 32, 0.45)";
        ctx.fillRect(padX, y, width - padX * 2, 38);
      }

      const statusColor =
        row.status === "collect"
          ? "#fb7185"
          : row.status === "refund"
          ? "#34d399"
          : row.status === "carry"
          ? "#fbbf24"
          : "#94a3b8";

      ctx.fillStyle = "#f1f5f9";
      ctx.font = "bold 14px 'Malgun Gothic', sans-serif";
      ctx.fillText(row.name, padX + 12, y + 24);

      ctx.textAlign = "right";
      if (isPrepaid) {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "13px 'Malgun Gothic', sans-serif";
        ctx.fillText(fmt(row.prepaid), width - padX - 290, y + 24);
        ctx.fillText(fmt(row.used), width - padX - 185, y + 24);

        ctx.fillStyle = statusColor;
        ctx.font = "bold 13px 'Malgun Gothic', sans-serif";
        ctx.fillText(row.statusLabel, width - padX - 95, y + 24);
        ctx.fillText(fmt(row.finalAmount), width - padX - 12, y + 24);
      } else {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "13px 'Malgun Gothic', sans-serif";
        ctx.fillText(fmt(row.used), width - padX - 200, y + 24);

        ctx.fillStyle = statusColor;
        ctx.font = "bold 13px 'Malgun Gothic', sans-serif";
        ctx.fillText(row.statusLabel, width - padX - 105, y + 24);
        ctx.fillText(fmt(row.finalAmount), width - padX - 12, y + 24);
      }
      ctx.textAlign = "left";

      y += 38;
    });

    // 6. 입금 계좌 정보 (입력 시)
    if (hasAccount || hasEasyPay) {
      y += 16;
      ctx.fillStyle = "#0b1120";
      roundRect(ctx, padX, y, width - padX * 2, 82, 10, true, false);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1;
      roundRect(ctx, padX, y, width - padX * 2, 82, 10, false, true);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px 'Malgun Gothic', sans-serif";
      ctx.fillText("입금 계좌 및 송금 안내", padX + 16, y + 26);

      ctx.fillStyle = "#f1f5f9";
      ctx.font = "14px 'Malgun Gothic', sans-serif";
      const accLine = hasAccount
        ? [bankName?.trim(), accountNumber?.trim(), accountHolder?.trim() ? `(예금주: ${accountHolder.trim()})` : ""]
            .filter(Boolean)
            .join(" ")
        : "";
      if (accLine) {
        ctx.fillText(accLine, padX + 16, y + 50);
      }
      if (hasEasyPay) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px 'Malgun Gothic', sans-serif";
        ctx.fillText(truncateText(ctx, easyPayNote.trim(), width - padX * 2 - 32), padX + 16, accLine ? y + 70 : y + 52);
      }
      y += 94;
    }

    // 7. 하단 워터마크
    y += 22;
    ctx.fillStyle = "#64748b";
    ctx.font = "12px 'Malgun Gothic', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Generated by ToolLab (https://toollab.org/party) · 서버 저장 없는 무료 모임 정산기", width / 2, y);
    ctx.textAlign = "left";

    // 다운로드 트리거
    const link = document.createElement("a");
    const fileDate = new Date().toISOString().slice(0, 10);
    link.download = `모임정산리포트_${fileDate}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function drawDashedLine(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let str = text;
    while (str.length > 0 && ctx.measureText(str + "...").width > maxWidth) {
      str = str.slice(0, -1);
    }
    return str + "...";
  }

  global.PartyExporter = {
    buildKakaoNoticeText,
    downloadReceiptImage,
  };
})(window);
