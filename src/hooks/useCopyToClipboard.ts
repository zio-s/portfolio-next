import { useState, useCallback } from 'react';

/**
 * 클립보드 복사 상태
 */
export interface CopyState {
  /** 복사된 값 (복사되지 않았으면 null) */
  value: string | null;
  /** 복사 성공 여부 */
  success: boolean;
  /** 에러 발생 시 에러 객체 */
  error: Error | null;
}

/**
 * 클립보드에 텍스트를 복사하고 그 상태를 추적합니다.
 *
 * @returns 복사 상태와 복사 함수를 포함하는 튜플
 *
 * @example
 * ```tsx
 * function ShareButton({ url }: { url: string }) {
 *   const [copyState, copyToClipboard] = useCopyToClipboard();
 *
 *   const handleCopy = async () => {
 *     await copyToClipboard(url);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCopy}>
 *         {copyState.success ? '복사됨!' : 'URL 복사'}
 *       </button>
 *       {copyState.error && (
 *         <span>복사 실패: {copyState.error.message}</span>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCopyToClipboard(): [
  CopyState,
  (text: string) => Promise<void>
] {
  const [state, setState] = useState<CopyState>({
    value: null,
    success: false,
    error: null,
  });

  const copyToClipboard = useCallback(async (text: string) => {
    // 브라우저 환경이 아니면 early return
    if (typeof window === 'undefined') {
      setState({
        value: null,
        success: false,
        error: new Error('브라우저 환경이 아닙니다'),
      });
      return;
    }

    try {
      // 최신 Clipboard API 사용 (권장)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setState({
          value: text,
          success: true,
          error: null,
        });
      } else {
        // Fallback: document.execCommand 사용 (구형 브라우저)
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setState({
            value: text,
            success: true,
            error: null,
          });
        } else {
          throw new Error('복사 명령 실행에 실패했습니다');
        }
      }
    } catch (error) {
      setState({
        value: null,
        success: false,
        error: error instanceof Error ? error : new Error('클립보드 복사에 실패했습니다'),
      });
    }
  }, []);

  return [state, copyToClipboard];
}
