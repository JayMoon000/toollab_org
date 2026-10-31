/**
 * ToolLab.org - Client-Side AI Background Remover Engine (Wasm / WebGPU)
 * Path: D:\Gemini_Files\ToolLab.org\js\utils\backgroundRemover.js
 */
const BackgroundRemover = {
  // ESM 모듈 로더 캐시
  _removeBgFn: null,

  async init() {
    if (!this._removeBgFn) {
      // Dynamic import from ESM CDN
      const module = await import("https://esm.sh/@imgly/background-removal@1.4.5?bundle");
      this._removeBgFn = module.default || module.removeBackground;
    }
    return this._removeBgFn;
  },

  // 1. Core Background Removal Execution
  async process(imageSource, progressCallback = null) {
    if (!imageSource) {
      throw new Error("올바른 이미지 파일이 아닙니다.");
    }

    const removeFn = await this.init();

    // 로컬 file:/// 환경 및 웹 서버 환경 모두에서 Wasm/ONNX 모델을 정상 로드하도록 CDN publicPath 명시
    const options = {
      publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.4.5/dist/",
      progress: (key, current, total) => {
        if (progressCallback && total > 0) {
          const ratio = Math.min(1, current / total);
          progressCallback({ stage: key, percent: Math.round(ratio * 100) });
        }
      }
    };

    const transparentBlob = await removeFn(imageSource, options);
    return {
      blob: transparentBlob,
      blobUrl: URL.createObjectURL(transparentBlob),
      size: transparentBlob.size
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = BackgroundRemover;
}

if (typeof window !== "undefined") {
  window.BackgroundRemover = BackgroundRemover;
}
