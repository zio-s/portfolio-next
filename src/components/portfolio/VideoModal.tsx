/**
 * VideoModal Component
 *
 * Fullscreen video player modal for project media
 */

import * as React from 'react';
import { X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoModalProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  videoUrl,
  isOpen,
  onClose,
  title,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Animation on mount/unmount
  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Auto-play video when modal opens
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            // Auto-play might be blocked by browser - silently ignore
          });
        }
      }, 300);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    // Pause video when closing
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/98 backdrop-blur-md transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        handleClose();
      }}
    >
      {/* Close Button */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 z-10 text-white/90 hover:text-white hover:bg-white/10 transition-all w-12 h-12 rounded-full"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Video Title */}
      {title && (
        <div className="absolute top-6 left-6 z-10 max-w-md">
          <p className="text-white text-base font-semibold drop-shadow-lg">{title}</p>
        </div>
      )}

      {/* Video Container */}
      <div
        className={`relative w-full max-w-6xl mx-6 transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          controlsList="nodownload"
          muted
          playsInline
          className="w-full rounded-xl shadow-2xl ring-1 ring-white/10"
          preload="auto"
        >
          <source src={videoUrl} type={`video/${videoUrl.split('.').pop()}`} />
          브라우저가 비디오 재생을 지원하지 않습니다.
        </video>
      </div>

      {/* Helper Text */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <p className="text-white/60 text-sm">ESC 또는 바깥 영역을 클릭하여 닫기</p>
      </div>
    </div>
  );
};
