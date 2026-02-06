/**
 * 404 Not Found 페이지
 *
 * 존재하지 않는 경로에 접근했을 때 표시되는 페이지입니다.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { ROUTES } from '../router/routes';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '6rem',
        margin: '0 0 1rem 0',
        color: '#3498db',
        fontWeight: 'bold',
      }}>
        404
      </h1>

      <h2 style={{
        fontSize: '2rem',
        margin: '0 0 1rem 0',
        color: '#333',
      }}>
        페이지를 찾을 수 없습니다
      </h2>

      <p style={{
        fontSize: '1.1rem',
        color: '#666',
        marginBottom: '2rem',
        maxWidth: '500px',
      }}>
        요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
        URL을 다시 확인해주세요.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ← 이전 페이지
        </button>

        <Link
          to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          {isAuthenticated ? '대시보드로 가기' : '홈으로 가기'}
        </Link>
      </div>

      <div style={{ marginTop: '3rem', color: '#999', fontSize: '0.9rem' }}>
        <p>도움이 필요하신가요? <a href="mailto:support@example.com" style={{ color: '#3498db' }}>고객지원 문의</a></p>
      </div>
    </div>
  );
};

export default NotFoundPage;
