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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          {/* Portfolio Purpose Statement */}
          <p className="text-xs text-muted-foreground">
            공개된 프로젝트와 콘텐츠의 저작권은 원작자에게 있으며, 포트폴리오 전시 목적으로만 사용합니다.
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">© {currentYear} 변세민</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
