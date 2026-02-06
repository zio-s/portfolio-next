/**
 * StatsCard Component
 *
 * Dashboard 통계 카드 컴포넌트
 * CSS Variables 기반 완전 다크모드 지원
 */

import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  gradient: string;
  link?: string;
  onClick?: () => void;
}

export const StatsCard = ({ title, value, icon, gradient, link, onClick }: StatsCardProps) => {
  const isClickable = !!link || !!onClick;

  const card = (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-xl)',
        background: gradient,
        color: 'white',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all var(--transition-normal)',
        boxShadow: 'var(--shadow-md)',
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onClick={onClick}
    >
      <div style={{
        fontSize: 'var(--font-size-3xl)',
        marginBottom: 'var(--spacing-sm)',
      } as React.CSSProperties}>
        {icon}
      </div>
      <div style={{
        fontSize: 'var(--font-size-sm)',
        opacity: 0.9,
        marginBottom: 'var(--spacing-xs)',
        fontWeight: 'var(--font-weight-medium)',
      } as React.CSSProperties}>
        {title}
      </div>
      <div style={{
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)',
      } as React.CSSProperties}>
        {value}
      </div>
    </div>
  );

  if (link) {
    return <Link to={link} style={{ textDecoration: 'none' }}>{card}</Link>;
  }

  return card;
};

export default StatsCard;
