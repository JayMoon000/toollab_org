import os
import re

ko_file = r"D:\Gemini_Files\ToolLab.org\ko\tools\image-compressor.html"
en_file = r"D:\Gemini_Files\ToolLab.org\tools\image-compressor.html"

# Race condition 방지 로직이 적용된 한국어 스크립트 블록
ko_replacement = """  <script>
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const qualityRange = document.getElementById("qualityRange");
    const qualityVal = document.getElementById("qualityVal");
    const formatSelect = document.getElementById("formatSelect");
    const resSelect = document.getElementById("resSelect");

    const batchSummary = document.getElementById("batchSummary");
    const batchCount = document.getElementById("batchCount");
    const batchSavings = document.getElementById("batchSavings");
    const downloadAllBtn = document.getElementById("downloadAllBtn");
    const resultsList = document.getElementById("resultsList");

    let rawFiles = [];       // 원본 파일 보관용
    let processedItems = []; // 현재 압축된 결과물
    let debounceTimer = null;
    let currentProcessId = 0; // 비동기 경쟁 방지용 고유 토큰

    function triggerRecompression() {
      if (!rawFiles.length) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        recompressAll();
      }, 120);
    }

    function updateQualityControlState() {
      const isPng = formatSelect.value === "image/png";
      const guideText = document.getElementById("qualityGuideText");

      if (isPng) {
        qualityRange.disabled = true;
        qualityRange.classList.add("opacity-30", "cursor-not-allowed");
        qualityVal.textContent = "무손실 (조절 불가)";
        qualityVal.className = "text-amber-400 font-mono text-[11px] font-bold";
        if (guideText) {
          guideText.textContent = "💡 PNG는 무손실 포맷입니다. 우측 해상도를 낮춰 용량을 줄이세요.";
          guideText.className = "text-[10px] text-amber-400/90 block font-medium";
        }
      } else {
        qualityRange.disabled = false;
        qualityRange.classList.remove("opacity-30", "cursor-not-allowed");
        qualityVal.textContent = `${qualityRange.value}%`;
        qualityVal.className = "text-emerald-400 font-mono font-bold";
        if (guideText) {
          guideText.textContent = "권장 80%: 육안 차이 없이 용량 50~70% 절감";
          guideText.className = "text-[10px] text-slate-500 block";
        }
      }
    }

    qualityRange.addEventListener("input", (e) => {
      qualityVal.textContent = `${e.target.value}%`;
      triggerRecompression();
    });

    formatSelect.addEventListener("change", () => {
      updateQualityControlState();
      triggerRecompression();
    });

    resSelect.addEventListener("change", triggerRecompression);

    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("border-emerald-500");
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("border-emerald-500");
    });
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("border-emerald-500");
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length) addFiles(e.target.files);
    });

    function addFiles(files) {
      const validImages = Array.from(files).filter(f => f.type.startsWith("image/"));
      if (!validImages.length) return;
      rawFiles = validImages;
      recompressAll();
    }

    // 전체 일괄 압축 실행 로직 (토큰 가드 탑재)
    async function recompressAll() {
      if (!rawFiles.length) return;

      const processId = ++currentProcessId;
      const quality = parseFloat(qualityRange.value) / 100;
      const format = formatSelect.value;
      const resVal = resSelect.value;
      const maxDim = resVal === "original" ? 10000 : parseInt(resVal, 10);

      const tempResults = [];

      for (let i = 0; i < rawFiles.length; i++) {
        // 루프 도중 새 요청이 들어왔으면 즉시 중단
        if (processId !== currentProcessId) return;

        const file = rawFiles[i];
        try {
          const result = await ImageCompressor.compressFile(file, {
            quality,
            outputFormat: format,
            maxWidth: maxDim,
            maxHeight: maxDim
          });

          if (processId !== currentProcessId) return;

          const extension = result.outputFormat === "image/webp" ? ".webp" : result.outputFormat === "image/png" ? ".png" : ".jpg";
          const downloadName = file.name.substring(0, file.name.lastIndexOf(".")) + "_compressed" + extension;
          const blobUrl = URL.createObjectURL(result.blob);

          tempResults.push({
            name: file.name,
            downloadName,
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            savedRatio: result.savedRatio,
            blobUrl,
            format: result.outputFormat
          });
        } catch (err) {
          console.error("압축 처리 오류:", err);
        }
      }

      // 최종 단계에서 여전히 최신 작업인지 확인
      if (processId !== currentProcessId) {
        tempResults.forEach(item => URL.revokeObjectURL(item.blobUrl));
        return;
      }

      // 이전 리소스 해제 후 단 한 번만 온전히 렌더링
      processedItems.forEach(item => {
        if (item.blobUrl) URL.revokeObjectURL(item.blobUrl);
      });
      processedItems = tempResults;
      resultsList.innerHTML = "";

      processedItems.forEach(item => renderItemCard(item));
      updateBatchSummary();
    }

    function renderItemCard(item) {
      const card = document.createElement("div");
      card.className = "p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs";
      card.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden">
          <img src="${item.blobUrl}" class="w-12 h-12 object-cover rounded-xl border border-slate-800 flex-shrink-0" />
          <div class="overflow-hidden">
            <span class="font-bold text-slate-200 block truncate">${item.name}</span>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] font-mono">
              <span class="text-slate-500 line-through">${ImageCompressor.formatBytes(item.originalSize)}</span>
              <span class="text-emerald-400 font-bold">${ImageCompressor.formatBytes(item.compressedSize)}</span>
              <span class="text-emerald-500 font-bold">(-${item.savedRatio}%)</span>
            </div>
          </div>
        </div>
        <a href="${item.blobUrl}" download="${item.downloadName}" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-400 font-bold flex-shrink-0 transition border border-slate-700 cursor-pointer">
          다운로드
        </a>
      `;
      resultsList.appendChild(card);
    }

    function updateBatchSummary() {
      if (!processedItems.length) {
        batchSummary.classList.add("hidden");
        batchSummary.classList.remove("flex");
        return;
      }

      batchSummary.classList.remove("hidden");
      batchSummary.classList.add("flex");

      const totalOrig = processedItems.reduce((acc, cur) => acc + cur.originalSize, 0);
      const totalComp = processedItems.reduce((acc, cur) => acc + cur.compressedSize, 0);
      const totalSaved = Math.max(0, totalOrig - totalComp);
      const ratio = totalOrig > 0 ? ((totalSaved / totalOrig) * 100).toFixed(1) : 0;

      batchCount.textContent = `${processedItems.length}개 파일 압축 완료`;
      batchSavings.textContent = `총 절감 용량: ${ImageCompressor.formatBytes(totalSaved)} (-${ratio}%)`;
    }

    downloadAllBtn.addEventListener("click", () => {
      processedItems.forEach((item, index) => {
        setTimeout(() => {
          const a = document.createElement("a");
          a.href = item.blobUrl;
          a.download = item.downloadName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, index * 150);
      });
    });

    updateQualityControlState();
  </script>"""

# 1. 한국어 파일 패치
if os.path.exists(ko_file):
    with open(ko_file, "r", encoding="utf-8") as f:
        html = f.read()
    
    html = re.sub(
        r'<script>\s*const dropZone = document\.getElementById\("dropZone"\);[\s\S]*?</script>',
        ko_replacement,
        html
    )
    with open(ko_file, "w", encoding="utf-8") as f:
        f.write(html)
    print("✔ 한국어 image-compressor.html 토큰 가드 적용 완료")

# 2. 영문 파일 패치
en_replacement = ko_replacement.replace("무손실 (조절 불가)", "Lossless (N/A)")
en_replacement = en_replacement.replace("💡 PNG는 무손실 포맷입니다. 우측 해상도를 낮춰 용량을 줄이세요.", "💡 PNG is lossless. Lower Max Dimension to reduce file weight.")
en_replacement = en_replacement.replace("권장 80%: 육안 차이 없이 용량 50~70% 절감", "Recommended 80%: Strips 50–70% size with no visible loss")
en_replacement = en_replacement.replace("qualityGuideText", "qualityGuideTextEn")
en_replacement = en_replacement.replace("border-emerald-500", "border-blue-500")
en_replacement = en_replacement.replace("text-emerald-400", "text-blue-400")
en_replacement = en_replacement.replace("다운로드", "Download")
en_replacement = en_replacement.replace("개 파일 압축 완료", " file(s) compressed")
en_replacement = en_replacement.replace("총 절감 용량: ", "Total saved: ")

if os.path.exists(en_file):
    with open(en_file, "r", encoding="utf-8") as f:
        en_html = f.read()
    
    en_html = re.sub(
        r'<script>\s*const dropZone = document\.getElementById\("dropZone"\);[\s\S]*?</script>',
        en_replacement,
        en_html
    )
    with open(en_file, "w", encoding="utf-8") as f:
        f.write(en_html)
    print("✔ 영문 image-compressor.html 토큰 가드 적용 완료")

print("\n✅ 비동기 경쟁 상태(Race Condition) 방어 패치 완료!")