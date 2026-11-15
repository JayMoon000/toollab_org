/**
 * 고속도로 휴게소 네트워크 뷰어 - 순수 필터 및 거리 계산 엔진
 * (서버 호출 없이 클라이언트 100% 연산)
 */

/**
 * 지원 노선 및 방향 메타데이터
 * - axis: 'ns' (남-북 축, 기점이 남쪽) | 'ew' (서-동 축, 기점이 서쪽)
 *   * 'ns' 노선: 기점(남) -> 종점(북, 상행)으로 갈수록 kmPost 및 위도(lat) 증가
 *   * 'ew' 노선: 기점(서) -> 종점(동, 하행 또는 노선별 방향)으로 갈수록 kmPost 및 경도(lng) 증가
 */
export const ROUTE_META = {
  경부선: {
    id: 'gyeongbu',
    routeNo: '1',
    upLabel: '서울 방면',
    downLabel: '부산 방면',
    axis: 'ns',
    upIncreasesKm: true
  },
  서해안선: {
    id: 'seohaean',
    routeNo: '15',
    upLabel: '서울·목포 방면',
    downLabel: '목포 방면',
    axis: 'ns',
    upIncreasesKm: true
  },
  중부내륙선: {
    id: 'jungbu_naeryuk',
    routeNo: '45',
    upLabel: '양평·대구 방면',
    downLabel: '창원 방면',
    upKeywords: ['양평', '충주', '여주', '대구'],
    downKeywords: ['창원', '마산', '김천', '현풍'],
    axis: 'ns',
    upIncreasesKm: true
  },
  영동선: {
    id: 'yeongdong',
    routeNo: '50',
    upLabel: '인천 방면',
    downLabel: '강릉 방면',
    axis: 'ew',
    upIncreasesKm: false
  },
  중앙선: {
    id: 'jungang',
    routeNo: '55',
    upLabel: '춘천·부산 방면',
    downLabel: '부산·춘천 방면',
    axis: 'ns',
    upIncreasesKm: true
  },
  호남선: {
    id: 'honam',
    routeNo: '25',
    upLabel: '천안 방면',
    downLabel: '순천 방면',
    upKeywords: ['천안', '익산', '전주'],
    downKeywords: ['순천', '광주', '목포'],
    axis: 'ns',
    upIncreasesKm: true
  },
  '호남선지선(논산·대전)': {
    id: 'honam_branch',
    routeNo: '251',
    upLabel: '대전 방면',
    downLabel: '논산 방면',
    upKeywords: ['대전', '회덕'],
    downKeywords: ['논산', '전주'],
    axis: 'ns',
    upIncreasesKm: true
  },
  남해선: {
    id: 'namhae',
    routeNo: '10',
    upLabel: '부산·영암 방면',
    downLabel: '순천·서부산 방면',
    upKeywords: ['부산', '창원', '진주', '영암'],
    downKeywords: ['순천', '서부산', '목포', '해남'],
    axis: 'ew',
    upIncreasesKm: true
  },
  당진영덕선: {
    id: 'dangjin_yeongdeok',
    routeNo: '30',
    upLabel: '청주·대전 방면',
    downLabel: '당진·영덕 방면',
    upKeywords: ['청주', '대전', '상주'],
    downKeywords: ['당진', '영덕'],
    axis: 'ew',
    upIncreasesKm: false
  },
  통영대전선: {
    id: 'tongyeong_daejeon',
    routeNo: '35',
    upLabel: '대전 방면',
    downLabel: '통영 방면',
    axis: 'ns',
    upIncreasesKm: true
  },
  광주대구선: {
    id: 'gwangju_daegu',
    routeNo: '12',
    upLabel: '대구 방면',
    downLabel: '광주 방면',
    upKeywords: ['대구', '함양', '거창'],
    downKeywords: ['광주', '담양'],
    axis: 'ew',
    upIncreasesKm: true
  },
  무안광주선: {
    id: 'muan_gwangju',
    routeNo: '12',
    upLabel: '광주 방면',
    downLabel: '무안 방면',
    upKeywords: ['광주'],
    downKeywords: ['무안', '목포'],
    axis: 'ew',
    upIncreasesKm: true
  },
  중부선: {
    id: 'jungbu',
    routeNo: '35',
    upLabel: '하남 방면',
    downLabel: '남이 방면',
    axis: 'ns',
    upIncreasesKm: true
  },
  평택제천선: {
    id: 'pyeongtaek_jecheon',
    routeNo: '40',
    upLabel: '평택 방면',
    downLabel: '제천 방면',
    axis: 'ew',
    upIncreasesKm: false
  },
  순천완주선: {
    id: 'suncheon_wanju',
    routeNo: '27',
    upLabel: '완주 방면',
    downLabel: '순천 방면',
    axis: 'ns',
    upIncreasesKm: true
  },
  '동해선(삼척·속초)': {
    id: 'donghae_north',
    routeNo: '65',
    upLabel: '속초 방면',
    downLabel: '삼척 방면',
    upKeywords: ['속초', '양양', '강릉'],
    downKeywords: ['삼척', '동해'],
    axis: 'ns',
    upIncreasesKm: true
  },
  '동해선(부산·포항)': {
    id: 'donghae_south',
    routeNo: '65',
    upLabel: '포항·영덕 방면',
    downLabel: '부산 방면',
    upKeywords: ['포항', '영덕'],
    downKeywords: ['부산', '울산', '장안'],
    axis: 'ns',
    upIncreasesKm: true
  },
  서울양양선: {
    id: 'seoul_yangyang',
    routeNo: '60',
    upLabel: '서울 방면',
    downLabel: '양양 방면',
    axis: 'ew',
    upIncreasesKm: false
  },
  '새만금포항선(대구·포항)': {
    id: 'saemangeum_pohang_east',
    routeNo: '20',
    upLabel: '포항 방면',
    downLabel: '대구 방면',
    upKeywords: ['포항'],
    downKeywords: ['대구', '익산'],
    axis: 'ew',
    upIncreasesKm: true
  },
  '새만금포항선(완주·장수)': {
    id: 'saemangeum_pohang_west',
    routeNo: '20',
    upLabel: '전주·장수 방면',
    downLabel: '새만금·익산 방면',
    upKeywords: ['장수', '전주', '완주'],
    downKeywords: ['익산', '새만금', '김제'],
    axis: 'ew',
    upIncreasesKm: true
  },
  수도권제1순환선: {
    id: 'capital_ring',
    routeNo: '100',
    upLabel: '판교·구리(내선) 방면',
    downLabel: '일산 방면',
    axis: 'ns',
    upIncreasesKm: true
  },
  세종포천선: {
    id: 'sejong_pocheon',
    routeNo: '29',
    upLabel: '포천·구리 방면',
    downLabel: '안성·세종 방면',
    axis: 'ns',
    upIncreasesKm: true
  },
  함양울산선: {
    id: 'hamyang_ulsan',
    routeNo: '14',
    upLabel: '함양·울산 방면',
    downLabel: '울산·함양 방면',
    axis: 'ew',
    upIncreasesKm: false
  },
  서천공주선: {
    id: 'seocheon_gongju',
    routeNo: '151',
    upLabel: '공주 방면',
    downLabel: '서천 방면',
    axis: 'ew',
    upIncreasesKm: true
  },
  부산외곽순환선: {
    id: 'busan_ring',
    routeNo: '600',
    upLabel: '기장(해운대) 방면',
    downLabel: '김해(진영) 방면',
    axis: 'ew',
    upIncreasesKm: true
  }
};

/**
 * 원클릭 페르소나 프리셋 3종 정의
 * - trucker (화물·장거리): ex-화물차라운지 + 24시 운영
 * - family (가족·나들이): ex-food + 수유실 보유
 * - ev (전기·수소차): 급속충전 OR 수소충전 보유
 */
export const PERSONA_PRESETS = {
  trucker: {
    id: 'trucker',
    label: '화물·장거리',
    description: 'ex-화물차라운지 + 24시 운영',
    match: (item) =>
      Boolean(item.is24h) &&
      Array.isArray(item.facilities) &&
      item.facilities.includes('ex-화물차라운지')
  },
  family: {
    id: 'family',
    label: '가족·나들이',
    description: 'ex-food + 수유실 보유',
    match: (item) =>
      Array.isArray(item.facilities) &&
      item.facilities.includes('ex-food') &&
      item.facilities.includes('수유실')
  },
  ev: {
    id: 'ev',
    label: '전기·수소차',
    description: '급속충전 OR 수소충전 보유',
    match: (item) =>
      Array.isArray(item.facilities) &&
      (item.facilities.includes('급속충전') || item.facilities.includes('수소충전'))
  }
};

/**
 * 상세 시설 매트릭스 필터 항목
 */
export const FACILITY_FILTERS = [
  '알뜰주유소',
  '셀프정비',
  '반려견놀이터',
  '쇼핑몰',
  '스타벅스'
];

/**
 * 휴게소명에서 괄호 속 방면 키워드 추출 ('양방향' 등은 제외)
 * @param {string} name
 * @returns {string}
 */
export function extractParenTarget(name) {
  const m = String(name || '').match(/\(([^)]+)\)/);
  if (!m) return '';
  let target = m[1].trim();
  if (target.endsWith('방면')) {
    target = target.slice(0, -2).trim();
  }
  if (!target || target === '양방향' || target === '상행' || target === '하행') {
    return '';
  }
  return target;
}

/**
 * 해당 노선·방향(up/down)에 실제 포함된 휴게소들의 괄호 속 방면 키워드 빈도 상위 2개를 추출하여
 * "상행 (익산·완주 방면)" 형태의 동적 방면 라벨 생성
 * @param {string} routeName - 노선명 (예: '경부선', '새만금포항선(완주·장수)')
 * @param {'up'|'down'} direction - 'up'(상행) | 'down'(하행)
 * @param {Array<Object>} [restAreas=[]] - 전체 또는 노선 휴게소 배열 (제공 시 동적 빈도 계산 우선)
 * @returns {string} 종점 방면 문자열
 */
export function getDirectionEndpointLabel(routeName, direction, restAreas = []) {
  const prefix = direction === 'up' ? '상행' : '하행';
  const meta = ROUTE_META[routeName];
  const fallback = meta
    ? direction === 'up'
      ? meta.upLabel
      : meta.downLabel
    : '';

  if (Array.isArray(restAreas) && restAreas.length > 0) {
    const counts = new Map();
    for (const item of restAreas) {
      if (!item || item.route !== routeName || item.direction !== direction) continue;
      const kw = extractParenTarget(item.name);
      if (kw) {
        counts.set(kw, (counts.get(kw) || 0) + 1);
      }
    }
    if (counts.size > 0) {
      const topKeywords = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k]) => k);
      return `${prefix} (${topKeywords.join('·')} 방면)`;
    }
  }

  if (!fallback) return prefix;
  return `${prefix} (${fallback})`;
}

/**
 * CSV 원본 '도로노선방향' 컬럼 값('상행', '하행', '양방향')을 1순위로 사용해 주행 방향 판별
 * (누락된 경우에만 괄호 방면 텍스트 보조 활용 - scripts/build_rest_areas.py의 parse_direction과 동일 기준)
 * @param {string} routeName - 노선명
 * @param {string} rawName - 휴게소명
 * @param {string} [rawDir=''] - 원본 도로노선방향 ('상행' | '하행' | '양방향')
 * @returns {{ direction: 'up'|'down'|'both', isShared: boolean, directionLabel: string }}
 */
export function classifyDirection(routeName, rawName, rawDir = '') {
  const meta = ROUTE_META[routeName] || {};
  const upLabel = meta.upLabel || '상행 방면';
  const downLabel = meta.downLabel || '하행 방면';
  const name = String(rawName || '').trim();
  const dirText = String(rawDir || '').trim();
  const parenTarget = extractParenTarget(name);

  // 1순위: CSV의 '도로노선방향' 컬럼 값 직접 적용
  if (dirText === '양방향' || name.includes('양방향')) {
    const upShort = upLabel.replace(' 방면', '');
    const downShort = downLabel.replace(' 방면', '');
    return {
      direction: 'both',
      isShared: true,
      directionLabel: `${upShort}·${downShort} 양방향 공용`
    };
  }

  if (dirText === '상행') {
    return {
      direction: 'up',
      isShared: false,
      directionLabel: parenTarget ? `${parenTarget} 방면` : upLabel
    };
  }

  if (dirText === '하행') {
    return {
      direction: 'down',
      isShared: false,
      directionLabel: parenTarget ? `${parenTarget} 방면` : downLabel
    };
  }

  // 2순위 (보조): '도로노선방향' 컬럼이 비어있는 경우에만 괄호 방면 텍스트로 판별
  if (!dirText && !name.includes('(')) {
    const upShort = upLabel.replace(' 방면', '');
    const downShort = downLabel.replace(' 방면', '');
    return {
      direction: 'both',
      isShared: true,
      directionLabel: `${upShort}·${downShort} 양방향 공용`
    };
  }

  const upKeywords = meta.upKeywords || [];
  const downKeywords = meta.downKeywords || [];

  if (parenTarget) {
    for (const kw of upKeywords) {
      if (kw !== '상행' && (parenTarget.includes(kw) || kw.includes(parenTarget))) {
        return {
          direction: 'up',
          isShared: false,
          directionLabel: `${parenTarget} 방면`
        };
      }
    }
    for (const kw of downKeywords) {
      if (kw !== '하행' && (parenTarget.includes(kw) || kw.includes(parenTarget))) {
        return {
          direction: 'down',
          isShared: false,
          directionLabel: `${parenTarget} 방면`
        };
      }
    }
  }

  const generalUpTargets = [
    '서울', '인천', '양평', '춘천', '천안', '대전', '하남',
    '평택', '완주', '전주', '장수', '속초', '공주', '당진', '청주', '포항', '영덕'
  ];
  if (generalUpTargets.some((t) => parenTarget.includes(t))) {
    return {
      direction: 'up',
      isShared: false,
      directionLabel: parenTarget ? `${parenTarget} 방면` : upLabel
    };
  }

  return {
    direction: 'down',
    isShared: false,
    directionLabel: parenTarget ? `${parenTarget} 방면` : downLabel
  };
}

/**
 * Haversine 공식을 이용한 두 GPS 좌표 간 직선 거리(km) 계산
 * @param {number} lat1 - 현재 위도
 * @param {number} lng1 - 현재 경도
 * @param {number} lat2 - 대상 위도
 * @param {number} lng2 - 대상 경도
 * @returns {number|null} 거리 (km, 소수점 첫째 자리 반올림)
 */
export function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  if (
    typeof lat1 !== 'number' ||
    typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lng2 !== 'number' ||
    Number.isNaN(lat1) ||
    Number.isNaN(lng1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lng2)
  ) {
    return null;
  }

  const R = 6371; // 지구 반지름 (km)
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * 진행 방향 기준 전방(Ahead) 여부 및 잔여 거리 산출
 * @param {Object} restArea - 휴게소 데이터 객체
 * @param {{lat: number, lng: number}|null} userLocation - 사용자 현재 GPS 좌표
 * @param {'up'|'down'|'all'} direction - 선택된 주행 방향
 * @returns {{ distanceKm: number|null, isAhead: boolean, statusLabel: string }}
 */
export function evaluateForwardDistance(restArea, userLocation, direction = 'down') {
  if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
    return {
      distanceKm: null,
      isAhead: true,
      statusLabel: '위치 미확인'
    };
  }

  const rawDistance = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    restArea.lat,
    restArea.lng
  );

  if (rawDistance === null) {
    return {
      distanceKm: null,
      isAhead: true,
      statusLabel: '거리 계산 불가'
    };
  }

  // 고속도로 도로 굴곡 보정 계수 (직선거리 대비 평균 약 1.15배)
  const estimatedRoadKm = Math.round(rawDistance * 1.15 * 10) / 10;

  // 노선 메타데이터(축 방향 및 상행 증감 여부)에 따른 전방 판별
  const meta = ROUTE_META[restArea.route] || { axis: 'ns', upIncreasesKm: true };
  let isAhead = true;

  if (meta.axis === 'ew') {
    // 동서축 노선: upIncreasesKm=false(영동선, 서울양양선, 평택제천선 등)는 상행이 서쪽(lng 감소), 하행이 동쪽(lng 증가)
    // upIncreasesKm=true(남해선, 광주대구선 등)는 상행이 동쪽(lng 증가), 하행이 서쪽(lng 감소)
    const movingEast = meta.upIncreasesKm ? direction === 'up' : direction === 'down';
    if (direction === 'up' || direction === 'down') {
      isAhead = movingEast
        ? restArea.lng >= userLocation.lng - 0.02
        : restArea.lng <= userLocation.lng + 0.02;
    }
  } else {
    // 남북축 노선: 상행(북쪽, lat 증가), 하행(남쪽, lat 감소)
    if (direction === 'down') {
      isAhead = restArea.lat <= userLocation.lat + 0.02;
    } else if (direction === 'up') {
      isAhead = restArea.lat >= userLocation.lat - 0.02;
    }
  }

  return {
    distanceKm: estimatedRoadKm,
    isAhead,
    statusLabel: isAhead ? `전방 약 ${estimatedRoadKm}km` : `후방 약 ${estimatedRoadKm}km (지나침)`
  };
}

/**
 * 휴게소 통합 필터링 및 정렬 함수
 * @param {Array<Object>} restAreas - 전체 휴게소 배열
 * @param {Object} options - 필터 옵션
 * @param {string} [options.route='ALL'] - 선택 노선 ('ALL' 또는 노선명)
 * @param {'up'|'down'|'all'} [options.direction='all'] - 주행 방향 ('up': 상행, 'down': 하행, 'all': 전체)
 * @param {string|null} [options.persona=null] - 페르소나 프리셋 키 ('trucker' | 'family' | 'ev' | null)
 * @param {Array<string>} [options.facilities=[]] - 선택된 상세 시설 배열 (AND 조건)
 * @param {{lat: number, lng: number}|null} [options.userLocation=null] - 사용자 현재 GPS 좌표
 * @param {boolean} [options.onlyAhead=false] - GPS 활성화 시 전방 휴게소만 보기 여부
 * @returns {Array<Object>} 필터링 및 거리 계산이 적용된 휴게소 배열
 */
export function filterRestAreas(restAreas, options = {}) {
  if (!Array.isArray(restAreas)) return [];

  const {
    route = 'ALL',
    direction = 'all',
    persona = null,
    facilities = [],
    userLocation = null,
    onlyAhead = false
  } = options;

  const filtered = restAreas
    .filter((item) => {
      // 1. 노선 필터
      if (route && route !== 'ALL' && item.route !== route) {
        return false;
      }

      // 2. 방향 필터 (양방향 공용 거점 휴게소는 상·하행 어느 방향을 선택해도 동시에 노출)
      if (direction && direction !== 'all') {
        const isBidirectional = Boolean(item.isShared) || item.direction === 'both';
        if (!isBidirectional && item.direction !== direction) {
          return false;
        }
      }

      // 3. 원클릭 페르소나 프리셋 필터
      if (persona && PERSONA_PRESETS[persona]) {
        if (!PERSONA_PRESETS[persona].match(item)) {
          return false;
        }
      }

      // 4. 상세 시설 매트릭스 필터 (선택된 모든 시설 보유 여부 검사)
      if (Array.isArray(facilities) && facilities.length > 0) {
        const itemFacilities = Array.isArray(item.facilities) ? item.facilities : [];
        const hasAllSelected = facilities.every((fac) => itemFacilities.includes(fac));
        if (!hasAllSelected) {
          return false;
        }
      }

      return true;
    })
    .map((item) => {
      const distanceInfo = evaluateForwardDistance(item, userLocation, direction);
      return {
        ...item,
        distanceKm: distanceInfo.distanceKm,
        isAhead: distanceInfo.isAhead,
        distanceLabel: distanceInfo.statusLabel,
        navigationLinks: buildNavigationLinks(item)
      };
    })
    .filter((item) => {
      if (onlyAhead && userLocation && item.distanceKm !== null) {
        return item.isAhead;
      }
      return true;
    });

  // 정렬 로직:
  // 1) GPS 위치가 있으면 전방 우선 + 잔여 거리 오름차순
  // 2) GPS 위치가 없으면 주행 방향 기준(상행/하행) 이정표(kmPost) 순 정렬
  return filtered.sort((a, b) => {
    if (userLocation && a.distanceKm !== null && b.distanceKm !== null) {
      if (a.isAhead !== b.isAhead) {
        return a.isAhead ? -1 : 1;
      }
      return a.distanceKm - b.distanceKm;
    }

    if (typeof a.kmPost === 'number' && typeof b.kmPost === 'number') {
      if (a.route === b.route) {
        const meta = ROUTE_META[a.route];
        const upIncreasesKm = meta ? meta.upIncreasesKm !== false : true;
        if (!upIncreasesKm) {
          // 서(기점, 0km) -> 동(종점)으로 kmPost가 증가하되 상행이 서쪽(기점) 방면인 노선
          return direction === 'up' ? b.kmPost - a.kmPost : a.kmPost - b.kmPost;
        }
        // 남/서(기점, 0km) -> 북/동(종점, 상행)으로 kmPost가 증가하는 노선
        return direction === 'up' ? a.kmPost - b.kmPost : b.kmPost - a.kmPost;
      }
    }

    return 0;
  });
}

/**
 * 길찾기 원클릭 딥링크 생성 (카카오내비 / 네이버지도)
 * 모바일(/Android|iPhone|iPad/i) 환경에서는 앱 딥링크와 웹 폴백 URL을 함께 반환하고,
 * 데스크톱 브라우저에서는 앱 스킴 호출 없이 웹 길찾기 URL만 반환합니다.
 * @param {{ name: string, lat: number, lng: number }} restArea
 * @returns {{
 *   isMobile: boolean,
 *   kakaoUrl: string,
 *   kakaoAppUrl: string | null,
 *   kakaoWebUrl: string,
 *   naverUrl: string,
 *   naverAppUrl: string | null,
 *   naverWebUrl: string
 * }}
 */
export function buildNavigationLinks(restArea) {
  const name = encodeURIComponent(restArea?.name || '고속도로휴게소');
  const lat = restArea?.lat ?? 0;
  const lng = restArea?.lng ?? 0;
  const isMobile =
    typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent);

  const kakaoWebUrl = `https://map.kakao.com/link/to/${name},${lat},${lng}`;
  const naverWebUrl = `https://map.naver.com/p/search/${name}`;

  const kakaoAppUrl = isMobile
    ? `kakaonavi://navigate?name=${name}&y=${lat}&x=${lng}&coord_type=wgs84`
    : null;
  const naverAppUrl = isMobile
    ? `nmap://navigation?dlat=${lat}&dlng=${lng}&dname=${name}&appname=toollab.org`
    : null;

  return {
    isMobile,
    kakaoUrl: kakaoAppUrl || kakaoWebUrl,
    kakaoAppUrl,
    kakaoWebUrl,
    naverUrl: naverAppUrl || naverWebUrl,
    naverAppUrl,
    naverWebUrl
  };
}
