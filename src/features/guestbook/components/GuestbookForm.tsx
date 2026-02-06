/**
 * Guestbook Form Component
 *
 * h-creations.com style form with profanity filter
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useCreateGuestbookEntryMutation } from '../api/guestbookApi';
import { useAlertModal } from '@/components/modal/hooks/use-alert-modal';
import { filterProfanity, filterNickname, hasProfanity } from '@/utils/profanityFilter';
import type { GuestbookFormData } from '../types/Guestbook';

export const GuestbookForm: React.FC = () => {
  const [createEntry, { isLoading }] = useCreateGuestbookEntryMutation();
  const { showAlert } = useAlertModal();

  const [formData, setFormData] = React.useState<GuestbookFormData>({
    authorName: '',
    authorEmail: '',
    content: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!formData.authorName.trim()) {
      showAlert({
        title: '입력 오류',
        message: '이름을 입력해주세요.',
        type: 'warning',
      });
      return false;
    }

    if (formData.authorName.trim().length < 2) {
      showAlert({
        title: '입력 오류',
        message: '이름은 최소 2자 이상이어야 합니다.',
        type: 'warning',
      });
      return false;
    }

    if (!formData.content.trim()) {
      showAlert({
        title: '입력 오류',
        message: '메시지를 입력해주세요.',
        type: 'warning',
      });
      return false;
    }

    if (formData.content.trim().length < 2) {
      showAlert({
        title: '입력 오류',
        message: '메시지는 최소 2자 이상이어야 합니다.',
        type: 'warning',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // 욕설 필터 적용
    const filteredName = filterNickname(formData.authorName.trim());
    const filteredContent = filterProfanity(formData.content.trim());

    // 욕설이 감지되었는지 확인
    const nameHadProfanity = hasProfanity(formData.authorName);
    const contentHadProfanity = hasProfanity(formData.content);

    if (nameHadProfanity || contentHadProfanity) {
      showAlert({
        title: '내용이 수정되었습니다',
        message: '부적절한 표현이 예쁜 말로 자동 변환되었습니다.',
        type: 'info',
      });
    }

    try {
      await createEntry({
        authorName: filteredName,
        authorEmail: formData.authorEmail?.trim() || undefined,
        content: filteredContent,
      }).unwrap();

      setFormData({
        authorName: '',
        authorEmail: '',
        content: '',
      });
    } catch (error: unknown) {
      let errorMessage = '방문록 등록에 실패했습니다.';

      if (error && typeof error === 'object') {
        if ('data' in error && typeof (error as { data?: { message?: string } }).data === 'object' && (error as { data?: { message?: string } }).data?.message) {
          errorMessage = (error as { data: { message: string } }).data.message;
        } else if ('message' in error && typeof (error as { message?: string }).message === 'string') {
          errorMessage = (error as { message: string }).message;
        }
      }

      showAlert({
        title: '방문록 등록 실패',
        message: errorMessage,
        type: 'error',
      });
    }
  };

  return (
    <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
      <h2 className="text-lg font-semibold mb-4">방문록 작성</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Name */}
        <div className="relative">
          <input
            name="authorName"
            type="text"
            placeholder="닉네임을 입력해주세요. (최소 2자)"
            value={formData.authorName}
            onChange={handleChange}
            className="w-full p-3 pr-12 text-sm rounded-lg bg-background/50 border border-border/50 focus:border-accent focus:bg-background focus:outline-none transition-all"
            maxLength={50}
            disabled={isLoading}
          />
        </div>

        {/* Message Content */}
        <div className="relative">
          <textarea
            name="content"
            placeholder="따뜻한 메시지를 남겨주세요."
            value={formData.content}
            onChange={handleChange}
            className="w-full p-3 text-sm rounded-lg bg-background/50 border border-border/50 focus:border-accent focus:bg-background focus:outline-none resize-none transition-all"
            rows={4}
            maxLength={1000}
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 cursor-pointer px-4 rounded-lg bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              등록 중...
            </span>
          ) : (
            '방문록 등록하기'
          )}
        </button>
      </form>
    </div>
  );
};
