/**
 * Footer Component
 *
 * Minimal footer inspired by h-creations.com aesthetic
 */

/**
 * 푸터 Props 인터페이스
 */
interface FooterProps {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 푸터 컴포넌트
 *
 * - 포트폴리오 목적 명시
 * - 저작권 정보
 */
export const Footer = ({ className = '' }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`w-full border-t border-border bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          {/* Portfolio Purpose Statement */}
          <p className="text-xs text-muted-foreground">
            이 웹사이트는 작업물을 프리뷰를 위한 포트폴리오 목적으로 제작되었습니다.
          </p>
          <p className="text-xs text-muted-foreground">
            이곳 공개되는 모든 프로젝트와 콘텐츠의 저작권은 원작자에게 있으며,
            본사이트는 상업적 목적이 아닌 포트폴리오 전시 목적으로만 사용됩니다.
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground pt-2">
            Copyright © {currentYear} B.S
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
