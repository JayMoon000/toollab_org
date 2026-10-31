# 프론트엔드 UX 안정성 및 방어 엔지니어링 체크리스트
**문서 버전:** 1.0.0  
**최초 작성일:** 2026-10-31  
**적용 대상:** ToolLab 단일 웹 애플리케이션, 내부 업무 툴, 대화형 시뮬레이터 전반  

---

## 1. 개요 및 설계 철학

개발자는 일반적으로 에러가 없는 이상적인 흐름(Happy Path)을 기준으로 로직을 검증하지만, 실제 사용자는 네트워크 지연이나 조급함에 의해 비정상적인 입력 및 조작을 반복한다.

본 문서는 **"사용자는 언제든 화면을 연타하고, 실수를 저지르며, 기다리지 않는다"**는 전제하에 서비스의 신뢰도와 완성도를 상용 프로덕션 수준으로 끌어올리기 위한 필수 방어 패턴을 정의한다.

---

## 2. 핵심 제어 기술: 스로틀(Throttle) vs 디바운스(Debounce)

| 구분 | 스로틀 (Throttle) | 디바운스 (Debounce) |
| :--- | :--- | :--- |
| **핵심 개념** | "아무리 많이 호출되어도 정해진 시간 간격마다 최대 1회만 실행" | "연속된 호출이 완전히 멈춘 뒤 정해진 시간이 지나면 마지막 1회만 실행" |
| **작동 비유** | 수도꼭지를 잠가 일정 주기로 한 방울씩 떨어뜨림 | 엘리베이터 문이 닫히기 직전 사람이 타면 타이머를 리셋함 |
| **주요 사용처** | - 실행/제출 버튼 연타 방지<br>- 화면 스크롤 이벤트 (무한 스크롤)<br>- 마우스 드래그 및 리사이즈 추적 | - 실시간 검색창 자동완성 (API 호출)<br>- 폼 필드 유효성 검사<br>- 브라우저 창 크기 조절 완료 감지 |
| **적용 목적** | 과도한 실행 빈도 캡핑 (Throughput 제어) | 불필요한 중간 연산 생략 및 최종 확정값 처리 |

---

## 3. 사용자 행동 패턴별 4대 방어 체크리스트

### ① 분노의 클릭 (Rage Click) 및 연타 방지
* [ ] **버튼 즉각 비활성화 (`disabled`):**  
  비동기 작업(API 호출, 무거운 계산, 파일 변환 등) 트리거 즉시 버튼 속성을 `disabled`로 변경하고 UI 상태를 전환한다.
* [ ] **스로틀(Throttle) 레이어:**  
  UI 비활성화가 누락되거나 모바일 터치 이벤트가 중복 전달될 경우를 대비해 핸들러 함수 자체에 500ms~1000ms 스로틀을 적용한다.
* [ ] **시각적 로딩 피드백:**  
  스피너, 프로그레스 바, 버튼 텍스트 변경("처리 중...")을 0.1초 내에 표시하여 사용자의 불안감을 해소한다.

### ② 중복 제출 및 멱등성 (Idempotency) 보장
* [ ] **인-플라이트(In-flight) 요청 락(Lock):**  
  동일한 생성/계산 작업이 이미 진행 중일 때는 추가 클릭 발생 시 조용히 무시(Early Return)하거나 경고 토스트를 띄운다.
* [ ] **엔터 키 중복 트리거 차단:**  
  입력창에서 `Enter` 키로 폼을 제출할 때 `compositionend` (한글 IME 조합 완료) 여부를 체크하여 2회 실행되는 한글 입력 버그를 방지한다.

### ③ 비정상 입력값(Edge Case) 정제
* [ ] **실시간 포맷팅 및 정규식 필터:**  
  숫자 입력 필드에 문자, 콤마, 음수, 지수 표기(`e`) 등이 입력되지 않도록 `input` 이벤트 단계에서 정제한다.
* [ ] **범위 제약(Boundary Check):**  
  최솟값(Min), 최댓값(Max)을 벗어나는 극단적인 수치 입력 시 자동으로 상/하한치로 보정하거나 인라인 에러 메시지를 제공한다.
* [ ] **공백 및 트림(Trim) 처리:**  
  복사-붙여넣기 시 혼입되는 앞뒤 공백 및 보이지 않는 제어 문자를 사전 제거한다.

### ④ 이탈 및 새로고침 데이터 보존 (Draft Recovery)
* [ ] **입력 상태 로컬 보존 (`localStorage` / `sessionStorage`):**  
  사용자가 폼을 작성하는 도중 실수로 뒤로가기나 새로고침(F5)을 누르더라도 직전 입력 상태가 유지되도록 디바운스(300ms) 기반 자동 임시 저장 로직을 구축한다.
* [ ] **임시 저장 복구 알림:**  
  페이지 재진입 시 "작성 중이던 데이터가 복구되었습니다" 알림과 함께 [초기화] 옵션을 제공한다.
* [ ] **페이지 이탈 경고 (`beforeunload`):**  
  작성 중인 작업량이 일정 수준 이상일 경우 탭을 닫거나 다른 링크로 이동 시 확인 팝업을 노출한다.

---

## 4. 즉시 복사해 사용하는 경량 유틸리티 코드 (Vanilla JS)

외부 라이브러리(Lodash 등) 없이 단일 HTML/JS 파일에 바로 내장할 수 있는 구현체:

```javascript
// 1. 디바운스 구현체 (마지막 호출만 실행)
function debounce(func, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 2. 스로틀 구현체 (주기당 1회 실행)
function throttle(func, limit = 500) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 3. 로컬스토리지 자동 임시 저장 훅 (디바운스 결합)
function bindAutoSave(elementId, storageKey) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // 복구
  const saved = localStorage.getItem(storageKey);
  if (saved !== null) el.value = saved;

  // 저장 (300ms 디바운스)
  el.addEventListener('input', debounce((e) => {
    localStorage.setItem(storageKey, e.target.value);
  }, 300));
}
```

---

## 5. 결론 및 향후 적용 계획
* 본 문서는 주말 툴 리팩토링 시 개별 컴포넌트 점검 기준으로 사용한다.
* ToolLab 내 주요 툴(계산기, 생성기, 변환기)의 공통 스크립트 헤더에 위 유틸리티 함수를 기본 탑재한다.