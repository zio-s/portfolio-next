/**
 * 403 Forbidden Page
 *
 * 권한이 없을 때 표시되는 페이지
 */

import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../router/routes';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '120px',
          fontWeight: '700',
          color: '#ef4444',
          lineHeight: 1,
          marginBottom: '16px',
        }}
      >
        403
      </div>

      <h1
        style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}
      >
        접근 권한이 없습니다
      </h1>

      <p
        style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
          maxWidth: '400px',
        }}
      >
        이 페이지에 접근할 권한이 없습니다. 관리자 계정이 필요합니다.
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          ← 뒤로 가기
        </button>

        <button
          onClick={() => navigate(ROUTES.HOME)}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          홈으로 가기
        </button>
      </div>
    </div>
  );
};

export default ForbiddenPage;
