/**
 * 경력 시작 시점
 *
 * 프론트엔드 실무 시작: 2025년 7월.
 * 홈페이지의 "N년차" 수치는 이 날짜를 기준으로 매번 계산되므로
 * 해가 바뀌어도 숫자를 손으로 고칠 필요가 없다.
 */
export const CAREER_START_DATE = new Date(2025, 6, 1);

/**
 * CAREER_START_DATE로부터 만으로 채운 연차를 계산한다.
 * (예: 2025-07 시작 → 2026-06까지는 0년, 2026-07부터 1년, ...)
 * 최소 1을 보장해 "실무를 시작한 지 1년이 채 안 됐어도 1년차"로 표기한다.
 */
export function getYearsOfExperience(now: Date = new Date()): number {
  let years = now.getFullYear() - CAREER_START_DATE.getFullYear();
  const monthDiff = now.getMonth() - CAREER_START_DATE.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < CAREER_START_DATE.getDate())) {
    years -= 1;
  }

  return Math.max(years, 1);
}
