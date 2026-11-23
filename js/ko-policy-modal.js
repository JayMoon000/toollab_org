/**
 * ToolLab Korean Shared Policy & Contact Modal (ToolLabKoPolicyModal)
 * Path: /js/ko-policy-modal.js
 *
 * Unifies the '서비스 안내 및 정책' modal (서비스소개 / 문의 / 개인정보처리방침 / 이용약관)
 * across /ko and all Korean utility subpages (/etf, /market, /rest-area, /party, /noise, /ko/tools/*, /ko/games/*).
 */
(function () {
  'use strict';

  const MODAL_ID = 'toollab-ko-policy-modal';
  const STYLE_ID = 'toollab-ko-policy-modal-styles';
  const CAFE_URL = 'https://cafe.naver.com/f-e/cafes/31814740/menus/15';
  const ETF_CAFE_URL = 'https://cafe.naver.com/f-e/cafes/31814740/menus/14';
  const VALID_TABS = ['about', 'contact', 'privacy', 'terms'];

  const currentScript = document.currentScript;

  const SERVICE_CONTENTS = {
    ko: {
      about: `
        <h4>ToolLab 한국어 웹 유틸리티 허브 소개</h4>
        <p><strong>ToolLab.org</strong>는 회원가입이나 서버 전송 대기시간 없이 브라우저 메모리에서 즉시 동작하는 <strong>서버비 $0 기반의 초경량 웹 유틸리티 툴킷</strong>입니다.</p>
        <p>전국 5일장 검색기, ETF 실전 배당·절세 계산기, 고속도로 휴게소 뷰어, 총무 모임·회비 정산기, 층간소음 측정기 등 한국 실생활과 재테크·업무에 꼭 필요한 도구들을 설치 없이 즉시 사용할 수 있도록 설계되었습니다.</p>
        <div class="tlkm-box">
          <strong>핵심 개발 원칙</strong>
          <ul>
            <li><strong>Zero-Server-Cost:</strong> 일체의 서버 데이터베이스 없이 사용자 브라우저 상에서만 100% 독립 연산</li>
            <li><strong>Zero-Barrier UX:</strong> 회원가입, 로그인, 개인정보 수집 없이 누구나 접속 즉시 무제한 사용</li>
            <li><strong>Client-Side Privacy:</strong> 입력한 금융 수치, 텍스트, 이미지 데이터를 외부 서버로 전송하지 않는 안전한 구조</li>
          </ul>
        </div>
      `,
      privacy: `
        <h4>개인정보처리방침 (Zero Data Storage 정책)</h4>
        <p><strong>ToolLab.org</strong>는 이용자의 개인정보 보호를 최우선으로 하며, 별도의 회원가입 절차나 백엔드 데이터베이스를 운영하지 않습니다.</p>
        <div class="tlkm-box">
          <strong>1. 개인정보 수집 및 서버 전송 없음</strong>
          <ul>
            <li>사용자가 입력하는 텍스트, 금융 계산 수치, 위치정보(GPS), 이미지 및 오디오 파일 등 모든 데이터는 <strong>오직 사용자의 웹 브라우저 메모리 내부(Client-Side)에서만</strong> 일시적으로 연산됩니다.</li>
            <li>입력된 데이터는 외부 서버로 전송되거나 저장되지 않으며, 브라우저 탭을 닫거나 새로고침하면 메모리에서 즉시 소멸됩니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 쿠키(Cookie) 및 방문 통계·광고 안내</strong>
          <ul>
            <li>서비스 품질 개선을 위해 개인을 식별하지 않는 익명화된 트래픽 통계(Cloudflare Web Analytics 등)가 활용될 수 있습니다.</li>
            <li>무료 서비스 운영 유지를 위해 Google AdSense 등 제3자 광고 서비스가 게재될 수 있으며, 광고 사업자는 맞춤형 광고 제공을 위해 브라우저 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
          </ul>
        </div>
      `,
      terms: `
        <h4>서비스 이용약관</h4>
        <p>본 약관은 <strong>ToolLab.org</strong>가 제공하는 웹 유틸리티 서비스의 이용 조건과 책임 범위를 규정합니다.</p>
        <div class="tlkm-box">
          <strong>1. 서비스의 목적 및 무료 제공</strong>
          <ul>
            <li>본 플랫폼의 모든 도구는 일상 계산, 데이터 조회 및 문서·미디어 가공을 돕기 위한 무료 보조 도구로, 별도의 이용료나 가입 절차 없이 누구나 자유롭게 사용할 수 있습니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 계산·조회 결과의 확인 및 면책 조항</strong>
          <ul>
            <li>각 도구에서 제공하는 계산기 결과, 세금 시뮬레이션, 공공데이터 기반 일정 및 시설 정보는 참고용 자료이며, 실제 법령 개정이나 현장 운영 사정에 따라 차이가 발생할 수 있습니다.</li>
            <li>최종 의사결정 전 사용자가 직접 내역을 확인해야 하며, 서비스 이용 결과로 인해 발생하는 직·간접적 손해에 대해 운영자는 법적 책임을 지지 않습니다.</li>
          </ul>
        </div>
      `
    },
    'rest-area': {
      about: `
        <h4>ToolLab 고속도로 휴게소 네트워크 뷰어 소개</h4>
        <p>ToolLab 고속도로 휴게소 네트워크 뷰어는 복잡한 앱 설치나 회원가입 없이, <strong>한국도로공사 표준데이터 기반의 전국 고속도로 노선별 선형 휴게소 검색 툴</strong>입니다.</p>
        <p>경부선·영동선·중부내륙선·서해안선 등 전국 주요 고속도로 노선을 상·하행 주행 방향에 맞춘 선형 파이프라인으로 한눈에 정렬하고, 화물차라운지(24시), ex-food·수유실, 전기차 급속·수소충전소, 반려견 놀이터 등 핵심 편의시설 필터와 카카오내비·네이버지도 원클릭 길찾기를 제공합니다.</p>
        <div class="tlkm-box">
          <strong>서비스 핵심 원칙</strong>
          <ul>
            <li><strong>Zero-Server-Cost:</strong> 별도 서버 DB나 추적 없이 브라우저 메모리(Client-Side)에서 100% 독립 연산</li>
            <li><strong>Zero-Barrier UX:</strong> 로그인이나 앱 설치 없이 주행 중·출발 전 3초 안에 노선·방향별 휴게소 조회</li>
            <li><strong>Verified Highway Data:</strong> 한국도로공사 표준데이터 기반 이정표(kmPost) 및 양방향 공용 거점 휴게소 반영</li>
          </ul>
        </div>
      `,
      privacy: `
        <h4>개인정보처리방침 (Privacy Policy)</h4>
        <p>ToolLab은 이용자의 위치정보 및 개인정보를 소중하게 보호하며, 불필요한 일체의 개인정보를 수집하거나 저장하지 않습니다.</p>
        <div class="tlkm-box">
          <strong>1. 개인 위치정보(GPS) 미수집 원칙</strong>
          <ul>
            <li>본 서비스의 ‘내 위치 거리순’ 기능에서 참조하는 GPS 좌표는 사용자의 브라우저 내부 JavaScript(Haversine 거리 계산 및 도로 굴곡 보정) 연산에만 즉시 사용되며, 외부 서버로 전송되거나 데이터베이스에 저장되지 않습니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 웹 분석 및 광고 게재 쿠키</strong>
          <ul>
            <li>서비스 안정성 관리와 호스팅 운영을 위해 익명화된 트래픽 통계 도구(Cloudflare Web Analytics) 및 Google AdSense 광고 모듈이 사용될 수 있으며, 사용자는 브라우저 설정을 통해 쿠키 저장을 언제든 거부할 수 있습니다.</li>
          </ul>
        </div>
      `,
      terms: `
        <h4>이용약관 및 유의사항 (Terms of Service)</h4>
        <div class="tlkm-box">
          <strong>1. 데이터 제공의 한계 및 면책 조항</strong>
          <ul>
            <li>본 서비스에서 제공하는 휴게소 위치, 주행 거리 및 편의시설 정보는 한국도로공사 공공데이터에 기반한 참고용 정보입니다. 휴게소 리모델링, 매장 영업시간 변경, 기상 악화, 도로 통제 등에 따라 실제 현장 운영 현황과 차이가 발생할 수 있으며, 서비스 이용으로 인한 직·간접적 손해에 대해 법적 책임을 지지 않습니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 외부 링크(내비게이션·지도 서비스) 연결 및 저작권</strong>
          <ul>
            <li>본 웹사이트에 포함된 카카오내비, 네이버지도 등의 외부 길찾기 링크는 이용자의 편의를 돕기 위한 기능이며, 해당 외부 플랫폼의 경로 안내 결과 및 운영 정책에 대해서는 관여하지 않습니다.</li>
            <li>본 서비스의 웹 UI/UX 디자인, 노선 필터링 및 거리 계산 로직, 자체 콘텐츠에 대한 저작권은 ToolLab에 있습니다.</li>
          </ul>
        </div>
      `
    },
    market: {
      about: `
        <h4>ToolLab 전국 5일장 검색기 소개</h4>
        <p>ToolLab 5일장 검색기는 복잡한 설치나 번거로운 회원가입 없이, <strong>오늘 열리는 전국의 전통 5일장과 주말 장터를 3초 안에 찾아주는 초경량 라이프스타일 유틸리티</strong>입니다.</p>
        <p>소상공인시장진흥공단의 전국 전통시장 표준 데이터를 정밀 가공하여, 장날 끝자리 날짜 계산, 네이버 지도 검색 연동, 주차장 및 공중화장실 유무, 온누리상품권 사용처 정보를 한눈에 제공합니다.</p>
        <div class="tlkm-box">
          <strong>서비스 핵심 원칙</strong>
          <ul>
            <li><strong>Zero-Server-Cost:</strong> 일체의 사용자 추적 DB 없이 순수 브라우저(Client-Side) 100% 필터링 연산</li>
            <li><strong>Zero-Barrier UX:</strong> 앱 설치나 권한 요구 없이 즉시 날짜별·지역별 장터 확인</li>
            <li><strong>Verified Local Data:</strong> 공공데이터포털 검증 좌표와 정제된 로컬 인프라 정보 매핑</li>
          </ul>
        </div>
      `,
      privacy: `
        <h4>개인정보처리방침 (Privacy Policy)</h4>
        <p>ToolLab은 이용자의 위치정보 및 개인정보를 보호하며, 불필요한 일체의 개인정보를 수집하거나 저장하지 않습니다.</p>
        <div class="tlkm-box">
          <strong>1. 개인 위치정보(GPS) 미수집 원칙</strong>
          <ul>
            <li>본 서비스는 사용자의 실시간 GPS 위치를 서버로 전송하거나 데이터베이스에 기록하지 않습니다. 모든 지역 선택과 날짜 필터링 연산은 사용자의 기기 브라우저 메모리상에서만 독립적으로 처리됩니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 웹 분석 및 광고 게재 쿠키</strong>
          <ul>
            <li>서비스 품질 관리와 안정적인 호스팅 제공을 위해 Cloudflare Web Analytics 및 Google AdSense 광고 모듈이 익명화된 트래픽 통계를 수집할 수 있습니다. 브라우저 설정을 통해 쿠키 저장을 언제든 거부할 수 있습니다.</li>
          </ul>
        </div>
      `,
      terms: `
        <h4>이용약관 및 유의사항 (Terms of Service)</h4>
        <div class="tlkm-box">
          <strong>1. 데이터 제공의 한계 및 면책 조항</strong>
          <ul>
            <li>본 서비스에서 안내하는 장날 정보는 공공기관 공시 데이터에 기반한 참고 정보입니다. 각 지자체의 사정, 지역 축제, 기상 재해, 명절 전후 임시 개장 등에 따라 실제 장터 운영일이 일부 달라질 수 있습니다. 방문 전 관할 지자체나 상인회에 유선 확인을 권장하며, 서비스 정보 이용에 따른 간접적 손해에 대해 법적 책임을 지지 않습니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 외부 링크 연결 및 저작권</strong>
          <ul>
            <li>본 웹사이트에 포함된 네이버 지도 등의 외부 링크는 이용자의 편의를 돕기 위한 기능이며, 해당 외부 플랫폼의 운영 정책 및 서비스 품질에 대해서는 관여하지 않습니다.</li>
            <li>본 서비스의 웹 UI/UX 디자인, 필터링 알고리즘 로직 및 자체 콘텐츠에 대한 저작권은 ToolLab에 있습니다.</li>
          </ul>
        </div>
      `
    },
    party: {
      about: `
        <h4>ToolLab 총무 전용 모임·회비 정산기 소개</h4>
        <p><strong>ToolLab.org</strong>는 회원가입이나 서버 전송 대기시간 없이 브라우저 메모리에서 즉시 동작하는 <strong>서버비 $0 기반의 초경량 웹 유틸리티 툴킷</strong>입니다.</p>
        <p>총무 전용 모임·회비 정산기는 동창회, 동호회, 부서 회식에서 자주 발생하는 1·2·3차 인원 변동 차등 정산과 선회비 예치 후 환급·공금 이월 결산을 엑셀 없이 10초 만에 처리하고, 단톡방 공지문과 영수증형 리포트 이미지를 즉시 생성할 수 있도록 설계되었습니다.</p>
        <div class="tlkm-box">
          <strong>핵심 개발 원칙</strong>
          <ul>
            <li><strong>Zero-Server-Cost:</strong> 일체의 서버 데이터베이스 없이 사용자 브라우저 상에서만 100% 독립 연산</li>
            <li><strong>Zero-Barrier UX:</strong> 회원가입, 로그인, 개인정보 수집 없이 누구나 접속 즉시 무제한 사용</li>
            <li><strong>Transparent Accounting:</strong> 차수별 1/N 누적 후 최종 1회 절사·반올림으로 회계 오차 최소화</li>
          </ul>
        </div>
      `,
      privacy: `
        <h4>개인정보처리방침 (Zero Data Storage 정책)</h4>
        <p><strong>ToolLab.org</strong>는 이용자의 개인정보 보호를 최우선으로 하며, 별도의 회원가입 절차나 백엔드 데이터베이스를 운영하지 않습니다.</p>
        <div class="tlkm-box">
          <strong>1. 개인정보 수집 및 서버 전송 없음</strong>
          <ul>
            <li>사용자가 입력하는 참석자 이름, 카드 승인 문자 내역, 결제 금액, 계좌번호 등 모든 데이터는 <strong>오직 사용자의 웹 브라우저 메모리 내부(Client-Side)에서만</strong> 일시적으로 연산됩니다.</li>
            <li>입력된 데이터는 외부 서버로 전송되거나 저장되지 않으며, 브라우저 탭을 닫거나 새로고침하면 메모리에서 즉시 소멸됩니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 쿠키(Cookie) 및 방문 통계·광고 안내</strong>
          <ul>
            <li>서비스 품질 개선을 위해 개인을 식별하지 않는 익명화된 트래픽 통계(Cloudflare Web Analytics 등)가 활용될 수 있습니다.</li>
            <li>무료 서비스 운영 유지를 위해 Google AdSense 등 제3자 광고 서비스가 게재될 수 있으며, 광고 사업자는 맞춤형 광고 제공을 위해 브라우저 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
          </ul>
        </div>
      `,
      terms: `
        <h4>서비스 이용약관</h4>
        <p>본 약관은 <strong>ToolLab.org</strong>가 제공하는 「총무 전용 모임·회비 정산기」 및 관련 웹 유틸리티 서비스의 이용 조건과 책임 범위를 규정합니다.</p>
        <div class="tlkm-box">
          <strong>1. 서비스의 목적 및 무료 제공</strong>
          <ul>
            <li>본 도구는 모임 회비 정산 및 공지문·리포트 작성을 돕기 위한 무료 계산 보조 도구로, 별도의 이용료나 가입 절차 없이 누구나 자유롭게 사용할 수 있습니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 계산 결과의 확인 및 면책 조항</strong>
          <ul>
            <li>카드 승인 문자 자동 추출 기능은 문자 양식에 따라 상호명이나 금액이 일부 다르게 인식될 수 있으므로, 최종 공지 및 송금 전 사용자가 내역을 반드시 직접 확인해야 합니다.</li>
            <li>본 서비스는 계산 편의를 위한 참고용 도구이며, 입력 오류나 절사·반올림 옵션 선택으로 인해 발생하는 금전적 차액 및 회원 간 정산 분쟁에 대해 운영자는 법적 책임을 지지 않습니다.</li>
          </ul>
        </div>
      `
    },
    noise: {
      about: `
        <h4>ToolLab 층간소음 측정 &amp; 소명 리포트 생성기 소개</h4>
        <p><strong>층간소음 측정 &amp; 소명 리포트 생성기</strong>는 공동주택 거주자가 별도의 유료 앱을 설치하거나 회원가입을 거치지 않고도 스마트폰 웹 브라우저만으로 실내 소음도(dBA)를 객관적으로 기록하고, 관리사무소 및 분쟁조정위원회 제출용 <strong>A4 PDF 소명 리포트</strong>와 현장 녹음 파일을 즉시 발급받을 수 있도록 설계된 무료 마이크로 웹 유틸리티입니다.</p>
        <p>기존 모바일 기기의 통화용 음성 보정(잡음 억제·자동 이득 조절)으로 인해 저주파 충격음이 누락되는 한계를 개선하기 위해 Web Audio API의 원시 스트림 제어 기술을 적용했으며, 환경부·국토교통부 공동부령의 주·야간 법정 기준을 자동으로 대조합니다.</p>
      `,
      privacy: `
        <h4>개인정보처리방침 (Zero Data Storage 정책)</h4>
        <div class="tlkm-box">
          <strong>1. 개인정보 및 오디오 데이터의 비수집 원칙</strong>
          <ul>
            <li>본 서비스는 회원가입 절차가 없으며, 마이크를 통해 입력되는 실시간 오디오 파형, 현장 녹음 파일, 데시벨 측정 결과, 그리고 리포트 출력용으로 입력하는 성명·주소지 등 어떠한 정보도 외부 서버로 전송하거나 데이터베이스에 저장하지 않습니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 100% 브라우저 로컬 메모리 처리 및 마이크 권한 해제</strong>
          <ul>
            <li>모든 음성 분석과 PDF 렌더링 연산은 사용자 기기의 웹 브라우저 내부 메모리(Client-Side)에서만 일시적으로 수행되며, 브라우저 탭을 닫거나 새로고침하는 즉시 모든 데이터는 영구 삭제됩니다.</li>
            <li>마이크 접근 권한은 오직 사용자가 측정 시작 버튼을 눌렀을 때만 활성화되며, 측정 종료 즉시 기기 연결이 해제되고 기본 통화 설정으로 원상복구됩니다.</li>
          </ul>
        </div>
      `,
      terms: `
        <h4>서비스 이용약관 및 면책 조항</h4>
        <div class="tlkm-box">
          <strong>1. 목적 및 활용 범위</strong>
          <ul>
            <li>본 웹 도구가 제공하는 데시벨(dBA) 수치와 A4 소명 리포트는 입주민의 자체 사실 확인, 관리사무소 민원 접수 및 층간소음 이웃사이센터 방문 계측 신청 시 기초 참고 자료로 활용하기 위한 것입니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 계측 오차 및 법적 효력에 대한 면책</strong>
          <ul>
            <li>스마트폰 내장 마이크는 제조사 및 기종별 하드웨어 감도 편차가 존재하므로, 국가공인 형식승인 소음계와 일정 수준의 오차가 발생할 수 있습니다. 따라서 본 측정 결과만으로 법원 소송이나 손해배상 청구의 유일한 공인 감정서 효력을 보장하지 않으며, 운영자는 본 자료의 활용 결과에 대해 법적 책임을 지지 않습니다.</li>
          </ul>
        </div>
      `
    },
    etf: {
      about: `
        <h4>ToolLab ETF 실전 배당·절세 시뮬레이터 소개</h4>
        <p>ToolLab은 복잡한 금융 수식과 무분별한 테마성 정보에 지친 투자자들을 위해 설계된 <strong>서버비 $0 기반의 초경량 브라우저 유틸리티 툴킷</strong>입니다.</p>
        <p>검증된 대표 ETF 바구니 종목을 기준으로 숨겨진 실부담비용(TER + 매매중개수수료)과 4대 절세 계좌(해외직투, 일반계좌, ISA, 연금저축/IRP)의 세후 실수령액 및 원금 회수(Payback) 골든크로스를 투명하고 직관적으로 시뮬레이션합니다.</p>
        <div class="tlkm-box">
          <strong>핵심 개발 원칙</strong>
          <ul>
            <li><strong>Zero-Server-Cost:</strong> 일체의 서버 데이터베이스 없이 사용자 브라우저 메모리상에서 100% 독립 연산</li>
            <li><strong>Zero-Barrier UX:</strong> 회원가입, 로그인, 개인정보 요구 없이 누구나 3초 안에 즉시 계산</li>
            <li><strong>Transparent Tax Logic:</strong> 최신 세법 기준(22% 양도세, ISA 비과세/분리과세, 연금소득세) 반영</li>
          </ul>
        </div>
      `,
      privacy: `
        <h4>개인정보처리방침 (Privacy Policy)</h4>
        <p><strong>ToolLab.org</strong>는 이용자의 개인정보를 매우 소중하게 생각하며, 개인정보보호법 등 관련 법령을 준수합니다.</p>
        <div class="tlkm-box">
          <strong>1. 금융 데이터 및 개인정보 미수집 원칙</strong>
          <ul>
            <li>본 서비스는 사용자가 시뮬레이터에 입력한 투자 금액, 적립 기간, 포트폴리오 선택 종목 등 일체의 시뮬레이션 데이터를 서버로 전송하거나 데이터베이스에 저장하지 않습니다. 모든 계산은 사용자의 로컬 브라우저(Client-Side) 메모리에서만 처리되며 창을 닫으면 즉시 파기됩니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 웹 분석 및 광고 게재 쿠키</strong>
          <ul>
            <li>서비스 안정성 및 인프라 최적화를 위해 익명화된 트래픽 통계 도구(Cloudflare Web Analytics)와 Google AdSense 광고 모듈이 사용될 수 있으며, 사용자는 웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
          </ul>
        </div>
      `,
      terms: `
        <h4>이용약관 및 투자 유의사항 (Terms of Service)</h4>
        <div class="tlkm-box">
          <strong>1. 시뮬레이션 목적 및 투자 추천 배제 (면책 조항)</strong>
          <ul>
            <li>본 웹 서비스에서 산출되는 모든 수치(예상 배당금, 실부담비용 차감액, 세후 실수령액, 원금 회수 기간 등)는 과거 공시 지표와 세법 규정을 가정한 단순 모의 계산 결과입니다.</li>
            <li>본 서비스는 특정 금융투자상품(ETF)의 매수·매도를 추천하거나 투자 수익 및 절세 효과를 보증하지 않습니다. 시장 환경 변화, 운용사 보수 변경, 세법 개정 등에 따라 실제 결과와 차이가 발생할 수 있으며, 모든 투자의 최종 결정과 손익 책임은 투자자 본인에게 있습니다.</li>
          </ul>
        </div>
        <div class="tlkm-box">
          <strong>2. 저작권</strong>
          <ul>
            <li>본 서비스의 UI/UX 디자인, 계산 알고리즘 로직 및 자체 콘텐츠에 대한 저작권은 ToolLab에 있습니다.</li>
          </ul>
        </div>
      `
    }
  };

  function getContactBoardInfo() {
    const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) || '';
    if (pathname.startsWith('/etf')) {
      return {
        url: ETF_CAFE_URL,
        label: "로드빌더 툴랩 'ETF 시뮬레이터 수정 및 제안' 게시판 →"
      };
    }
    return {
      url: CAFE_URL,
      label: "로드빌더 툴랩 'Toollab 수정 및 제안' 게시판 →"
    };
  }

  function renderContactHtml() {
    const board = getContactBoardInfo();
    return `
    <h4>오류 제보 및 기능 개선 문의</h4>
    <p>ToolLab 유틸리티 사용 중 오류 제보, 기존 도구 기능 개선 제안, 또는 새로운 유틸리티 툴 아이디어가 있으시면 아래 공식 채널을 통해 언제든 의견을 남겨주세요.</p>
    <div class="tlkm-box">
      <strong>공식 소통 및 피드백 채널</strong>
      <ul>
        <li><strong>툴랩 공식 커뮤니티:</strong> <a href="${board.url}" target="_blank" rel="noopener noreferrer">${board.label}</a></li>
        <li><strong>운영자 이메일:</strong> <a href="mailto:contact@toollab.org">contact@toollab.org</a></li>
        <li><strong>운영 주체:</strong> ToolLab Independent Engineering Project (JN Company)</li>
      </ul>
    </div>
    <p class="tlkm-note">※ 본 서비스는 무료로 제공되며, 남겨주신 실무 피드백은 정기 업데이트에 적극 반영됩니다.</p>
  `;
  }

  function detectServiceId() {
    if (currentScript) {
      const attr = currentScript.getAttribute('data-service-id') || currentScript.getAttribute('data-service');
      if (attr && SERVICE_CONTENTS[attr]) return attr;
    }
    const path = (window.location && window.location.pathname || '').toLowerCase();
    if (path.startsWith('/etf')) return 'etf';
    if (path.startsWith('/market')) return 'market';
    if (path.startsWith('/rest-area')) return 'rest-area';
    if (path.startsWith('/party')) return 'party';
    if (path.startsWith('/noise')) return 'noise';
    return 'ko';
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .tlkm-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(2, 6, 23, 0.8);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", Roboto, sans-serif;
        text-align: left;
      }
      .tlkm-backdrop.tlkm-hidden {
        display: none !important;
      }
      .tlkm-dialog {
        width: 100%;
        max-width: 672px;
        max-height: 86vh;
        background: #0f172a;
        border: 1px solid rgba(51, 65, 85, 0.9);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65);
        color: #cbd5e1;
      }
      .tlkm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #1e293b;
      }
      .tlkm-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tlkm-title {
        margin: 0;
        font-size: 17px;
        font-weight: 800;
        color: #f1f5f9;
        line-height: 1.3;
      }
      .tlkm-close {
        appearance: none;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 16px;
        line-height: 1;
        padding: 6px 8px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.15s, color 0.15s;
      }
      .tlkm-close:hover {
        color: #ffffff;
        background: #1e293b;
      }
      .tlkm-tabs {
        display: flex;
        gap: 4px;
        padding: 0 20px;
        border-bottom: 1px solid #1e293b;
        background: rgba(2, 6, 23, 0.5);
        overflow-x: auto;
      }
      .tlkm-tab {
        appearance: none;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 12px 14px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        color: #94a3b8;
        white-space: nowrap;
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s;
      }
      .tlkm-tab:hover {
        color: #e2e8f0;
      }
      .tlkm-tab.is-active {
        color: #38bdf8;
        border-bottom-color: #38bdf8;
      }
      .tlkm-body {
        padding: 20px;
        overflow-y: auto;
        font-size: 13.5px;
        line-height: 1.65;
        color: #cbd5e1;
      }
      .tlkm-panel {
        display: none;
      }
      .tlkm-panel.is-active {
        display: block;
      }
      .tlkm-panel h4 {
        margin: 0 0 10px;
        font-size: 16px;
        font-weight: 700;
        color: #f1f5f9;
      }
      .tlkm-panel p {
        margin: 0 0 12px;
      }
      .tlkm-panel p:last-child {
        margin-bottom: 0;
      }
      .tlkm-panel strong {
        color: #f1f5f9;
      }
      .tlkm-box {
        background: #020617;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 14px 16px;
        margin: 12px 0;
      }
      .tlkm-box > strong {
        display: block;
        font-size: 12px;
        font-weight: 700;
        color: #38bdf8;
        margin-bottom: 6px;
      }
      .tlkm-box ul {
        margin: 0;
        padding-left: 18px;
        list-style: disc;
        font-size: 12.5px;
        color: #94a3b8;
      }
      .tlkm-box li {
        margin-bottom: 5px;
      }
      .tlkm-box li:last-child {
        margin-bottom: 0;
      }
      .tlkm-box li strong {
        color: #e2e8f0;
      }
      .tlkm-box a {
        color: #38bdf8;
        text-decoration: underline;
        font-weight: 600;
      }
      .tlkm-box a:hover {
        color: #7dd3fc;
      }
      .tlkm-note {
        font-size: 12px;
        color: #94a3b8;
      }
      .tlkm-footer {
        padding: 14px 20px;
        border-top: 1px solid #1e293b;
        background: rgba(2, 6, 23, 0.4);
        display: flex;
        justify-content: flex-end;
      }
      .tlkm-confirm-btn {
        appearance: none;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        background: #38bdf8;
        color: #020617;
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.15s;
      }
      .tlkm-confirm-btn:hover {
        background: #0ea5e9;
      }
      @media print {
        .tlkm-backdrop {
          display: none !important;
        }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function ensureModal() {
    injectStyles();
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    const serviceId = detectServiceId();
    const svc = SERVICE_CONTENTS[serviceId] || SERVICE_CONTENTS.ko;

    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'tlkm-backdrop tlkm-hidden no-print';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'tlkmModalTitle');

    modal.innerHTML = `
      <div class="tlkm-dialog">
        <div class="tlkm-header">
          <div class="tlkm-title-row">
            <span aria-hidden="true">🛡️</span>
            <h3 id="tlkmModalTitle" class="tlkm-title">서비스 안내 및 정책</h3>
          </div>
          <button type="button" class="tlkm-close" data-tlkm-close aria-label="닫기">✕</button>
        </div>
        <div class="tlkm-tabs" role="tablist" aria-label="서비스 안내 및 정책 탭">
          <button type="button" class="tlkm-tab is-active" data-tlkm-tab="about" role="tab" aria-selected="true">서비스소개</button>
          <button type="button" class="tlkm-tab" data-tlkm-tab="contact" role="tab" aria-selected="false">문의</button>
          <button type="button" class="tlkm-tab" data-tlkm-tab="privacy" role="tab" aria-selected="false">개인정보처리방침</button>
          <button type="button" class="tlkm-tab" data-tlkm-tab="terms" role="tab" aria-selected="false">이용약관</button>
        </div>
        <div class="tlkm-body">
          <div class="tlkm-panel is-active" data-tlkm-panel="about" role="tabpanel">${svc.about}</div>
          <div class="tlkm-panel" data-tlkm-panel="contact" role="tabpanel">${renderContactHtml()}</div>
          <div class="tlkm-panel" data-tlkm-panel="privacy" role="tabpanel">${svc.privacy}</div>
          <div class="tlkm-panel" data-tlkm-panel="terms" role="tabpanel">${svc.terms}</div>
        </div>
        <div class="tlkm-footer">
          <button type="button" class="tlkm-confirm-btn" data-tlkm-close>확인 및 닫기</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-tlkm-close]')) {
        closeModal();
        return;
      }
      const tabBtn = e.target.closest('[data-tlkm-tab]');
      if (tabBtn) {
        switchTab(tabBtn.getAttribute('data-tlkm-tab'));
      }
    });

    document.body.appendChild(modal);
    return modal;
  }

  function switchTab(tabKey) {
    const modal = ensureModal();
    const target = VALID_TABS.includes(tabKey) ? tabKey : 'about';

    modal.querySelectorAll('[data-tlkm-tab]').forEach(function (btn) {
      const active = btn.getAttribute('data-tlkm-tab') === target;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    modal.querySelectorAll('[data-tlkm-panel]').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-tlkm-panel') === target);
    });
  }

  function openModal(tabKey) {
    const modal = ensureModal();
    switchTab(tabKey || 'about');
    modal.classList.remove('tlkm-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal || modal.classList.contains('tlkm-hidden')) return;
    modal.classList.add('tlkm-hidden');
    document.body.style.overflow = '';
  }

  function resolveTabFromFooterTarget(el) {
    if (!el) return null;
    const explicitTab = el.getAttribute('data-policy-tab');
    if (explicitTab && VALID_TABS.includes(explicitTab)) {
      return explicitTab;
    }

    if (el.tagName === 'A' && el.closest('footer')) {
      const href = (el.getAttribute('href') || '').toLowerCase();
      if (href.includes('about.html')) return 'about';
      if (href.includes('contact.html')) return 'contact';
      if (href.includes('privacy.html')) return 'privacy';
      if (href.includes('terms.html')) return 'terms';
    }

    if (el.tagName === 'BUTTON' && el.closest('footer')) {
      const label = (el.textContent || '').trim().toLowerCase();
      if (label === 'about us' || label === '소개' || label === '서비스소개') return 'about';
      if (label === 'contact' || label === '문의') return 'contact';
      if (label === 'privacy policy' || label === '개인정보처리방침') return 'privacy';
      if (label === 'terms of service' || label === '이용약관') return 'terms';
    }

    return null;
  }

  function normalizeEtfFooter() {
    if (detectServiceId() !== 'etf') return;
    const footer = document.querySelector('footer');
    if (!footer) return;
    const labelMap = {
      'about us': { text: '서비스소개', tab: 'about' },
      'contact': { text: '문의', tab: 'contact' },
      'privacy policy': { text: '개인정보처리방침', tab: 'privacy' },
      'terms of service': { text: '이용약관', tab: 'terms' }
    };
    footer.querySelectorAll('button').forEach(function (btn) {
      const key = (btn.textContent || '').trim().toLowerCase();
      const mapped = labelMap[key];
      if (mapped) {
        btn.textContent = mapped.text;
        btn.setAttribute('data-policy-tab', mapped.tab);
      }
    });
  }

  function bindGlobalListeners() {
    if (window.__tlkmBound) return;
    window.__tlkmBound = true;

    // Capture phase intercepts footer triggers cleanly (including React-rendered /etf footer)
    document.addEventListener('click', function (e) {
      const target = e.target && e.target.closest ? e.target.closest('button, a') : null;
      if (!target) return;
      if (target.closest('#' + MODAL_ID)) return;

      const tab = resolveTabFromFooterTarget(target);
      if (tab) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        openModal(tab);
      }
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  function init() {
    bindGlobalListeners();
    ensureModal();
    normalizeEtfFooter();

    if (detectServiceId() === 'etf' && typeof MutationObserver === 'function') {
      const observer = new MutationObserver(function () {
        normalizeEtfFooter();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Unified public API + backward-compatible aliases for inline onclick callers
  window.ToolLabKoPolicyModal = {
    open: openModal,
    close: closeModal,
    switchTab: switchTab,
    cafeUrl: CAFE_URL
  };
  window.openPolicyModal = openModal;
  window.closePolicyModal = closeModal;
  window.openLegalModal = openModal;
  window.closeLegalModal = closeModal;
  window.switchLegalTab = switchTab;
})();
