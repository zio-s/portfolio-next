/**
 * Profanity Filter Utility
 *
 * 욕설을 감지하고 예쁜 말로 자동 변환하는 필터
 */

// 욕설 패턴과 대체어 매핑
const profanityMap: Record<string, string> = {
  // 강한 욕설
  '씨발': '이런',
  '시발': '이런',
  '씹': '이런',
  'ㅅㅂ': '이런',
  '개새': '아이고',
  '개새끼': '친구',
  '새끼': '친구',
  'ㅅㄲ': '친구',
  '병신': '바보',
  'ㅂㅅ': '바보',
  '븅신': '바보',
  '지랄': '웃긴 소리',
  'ㅈㄹ': '웃긴 소리',
  '미친': '특별한',
  '미쳤': '대단한',
  '엿먹어': '수고해요',
  '꺼져': '안녕',
  '닥쳐': '조용히',
  '죽어': '쉬어요',
  '죽을': '쉴',

  // 중간 수준
  '바보': '귀여운 사람',
  '멍청': '순수한',
  '멍청이': '순수한 사람',
  '또라이': '특별한 사람',
  '미친놈': '대단한 사람',
  '미친년': '대단한 사람',
  '개같': '힘든',
  '개빡': '화나는',
  '싸가지': '예의',

  // 비하 표현
  '뻐큐': '안녕',
  '엿같': '별로인',
  '좆같': '별로인',
  'ㅈ같': '별로인',

  // 성적 표현
  '섹스': '관계',
  '섹': '관계',
  'sex': 'relation',
  'xxx': 'ooo',
  '자지': '부분',
  'ㅈㅈ': '부분',
  '보지': '부분',
  'ㅂㅈ': '부분',
  '성교': '관계',
  '야동': '영상',
  '포르노': '영상',
  '야한': '재미있는',
  '19금': '성인',
  '음란': '재미',
  '변태': '특별한',
  '몸캠': '영상',
  '딸쳐': '쉬어요',
  '딸치': '쉬어요',

  // 영어 욕설
  'fuck': 'fun',
  'fck': 'fun',
  'fuk': 'fun',
  'shit': 'shoot',
  'sht': 'shoot',
  'damn': 'darn',
  'bitch': 'buddy',
  'btch': 'buddy',
  'ass': 'butt',
  'asshole': 'buddy',
  'porn': 'content',
  'sexy': 'pretty',
  'dick': 'person',
  'cock': 'person',
  'pussy': 'cat',
};

/**
 * 텍스트 정규화 - 우회 입력 방지
 */
function normalizeText(text: string): string {
  if (!text) return text;

  let normalized = text;

  // 띄어쓰기 제거
  normalized = normalized.replace(/\s+/g, '');

  // 숫자를 유사한 한글로 변환
  const numberMap: Record<string, string> = {
    '0': 'ㅇ',
    '1': 'ㅣ',
    '2': 'ㅡ',
    '3': 'ㅁ',
    '4': 'ㅅ',
    '5': 'ㅅ',
    '6': 'ㅂ',
    '7': 'ㄱ',
    '8': 'ㅂ',
    '9': 'ㄱ',
  };

  Object.entries(numberMap).forEach(([num, char]) => {
    normalized = normalized.replace(new RegExp(num, 'g'), char);
  });

  // 특수문자를 유사한 한글로 변환
  const specialCharMap: Record<string, string> = {
    '!': 'ㅣ',
    '@': 'ㅇ',
    '#': '',
    '$': 'ㅅ',
    '%': '',
    '^': '',
    '&': '',
    '*': '',
    '(': '',
    ')': '',
    '-': 'ㅡ',
    '_': 'ㅡ',
    '=': 'ㅡ',
    '+': '',
    '[': '',
    ']': '',
    '{': '',
    '}': '',
    '\\': 'ㅣ',
    '|': 'ㅣ',
    ';': '',
    ':': '',
    "'": '',
    '"': '',
    ',': '',
    '.': '',
    '<': '',
    '>': '',
    '/': '',
    '?': '',
    '~': '',
    '`': '',
  };

  Object.entries(specialCharMap).forEach(([char, replacement]) => {
    normalized = normalized.replace(new RegExp('\\' + char, 'g'), replacement);
  });

  return normalized;
}

/**
 * 자음 기반 욕설 패턴 감지 (더 정확하게)
 */
const consonantProfanityPatterns = [
  // 시발 패턴 - ㅅㅂ, ㅅ1ㅂ, 시발 등 (* 대신 + 사용하여 0개 이상 허용)
  { pattern: /ㅅ[1!@\s]*ㅂ/gi, replacement: '이런' },
  { pattern: /ㅅ[ㅣ1!|]+ㅂ[ㅏㅑ]ㄹ/gi, replacement: '이런' },

  // 개새끼 패턴
  { pattern: /개[새\s]*[ㄲ끼]/gi, replacement: '친구' },
  { pattern: /ㅅ[ㄲㅋ]+[ㅣ끼]/gi, replacement: '친구' },

  // 병신 패턴 - ㅂㅅ, 병신 등
  { pattern: /ㅂ[ㅕㅓ]*[ㅇㄴ]*ㅅ[ㅣ인]*/gi, replacement: '바보' },

  // 지랄 패턴
  { pattern: /[ㅈㅉ][ㅣ]*ㄹ[ㅏㅑ]*ㄹ/gi, replacement: '웃긴 소리' },
];

/**
 * 텍스트에서 욕설을 감지하고 예쁜 말로 변환
 */
export function filterProfanity(text: string): string {
  if (!text) return text;

  let filtered = text;

  // 1단계: 정규화된 텍스트로 자음 패턴 감지
  const normalized = normalizeText(text);

  // 자음 기반 패턴 필터링
  consonantProfanityPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(normalized)) {
      filtered = filtered.replace(pattern, replacement);
    }
  });

  // 2단계: 일반 욕설 패턴 대체
  Object.entries(profanityMap).forEach(([profanity, replacement]) => {
    const regex = new RegExp(profanity, 'gi');
    filtered = filtered.replace(regex, replacement);
  });

  // 3단계: 정규화된 텍스트에서 완전 욕설 패턴 감지
  const advancedPatterns = [
    { pattern: /[ㅅ시씨][1!@\s]*[ㅂ발]/gi, replacement: '이런' },
    { pattern: /[ㅂ병븅][1!@\s]*[ㅅ신]/gi, replacement: '바보' },
    { pattern: /[ㅈ지][1!@\s]*[ㄹ랄]/gi, replacement: '웃긴 소리' },
    { pattern: /개[1!@\s]*새[1!@\s]*[ㄲ끼]/gi, replacement: '친구' },
    { pattern: /새[1!@\s]*[ㄲ끼]/gi, replacement: '친구' },
  ];

  advancedPatterns.forEach(({ pattern, replacement }) => {
    filtered = filtered.replace(pattern, replacement);
  });

  return filtered;
}

/**
 * 텍스트에 욕설이 포함되어 있는지 검사
 */
export function hasProfanity(text: string): boolean {
  if (!text) return false;

  // 숫자만 있는 경우 욕설 아님
  if (/^[0-9\s]+$/.test(text)) return false;

  // 일반적인 축약어 제외 (ㅎㅇ, ㅋㅋ, ㄱㅅ, ㅇㅋ 등)
  const commonAbbreviations = ['ㅎㅇ', 'ㅋㅋ', 'ㄱㅅ', 'ㅇㅋ', 'ㄳ', 'ㅊㅋ', 'ㅅㄱ'];
  if (commonAbbreviations.includes(text.trim())) return false;

  const normalized = normalizeText(text);
  const lowerText = text.toLowerCase();

  // 일반 욕설 패턴 체크 (profanityMap에 있는 명확한 욕설들)
  const hasClearProfanity = Object.keys(profanityMap).some(profanity => {
    const regex = new RegExp(profanity, 'i');
    return regex.test(lowerText);
  });

  if (hasClearProfanity) return true;

  // 자음 기반 패턴 체크 (정규화된 텍스트에서만)
  // 최소 길이 체크 - 너무 짧으면 false positive 가능성
  if (normalized.length >= 2) {
    return consonantProfanityPatterns.some(({ pattern }) => pattern.test(normalized));
  }

  return false;
}

/**
 * 닉네임 전용 필터 (더 엄격함)
 */
export function filterNickname(nickname: string): string {
  // 먼저 일반 욕설 필터 적용
  const filtered = filterProfanity(nickname);

  // 닉네임 특별 규칙
  const nicknameBlockList = [
    '관리자', 'admin', 'administrator', 'root', 'system',
    '운영자', '매니저', 'manager', 'mod', 'moderator'
  ];

  const lowerNickname = filtered.toLowerCase().trim();

  // 차단 목록에 있는 경우
  if (nicknameBlockList.some(blocked => lowerNickname.includes(blocked))) {
    return '방문자';
  }

  // 특수문자만 있는 경우
  if (/^[^a-zA-Z0-9가-힣]+$/.test(filtered.trim())) {
    return '익명';
  }

  return filtered;
}
