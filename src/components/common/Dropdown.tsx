import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Dropdown.css';

/**
 * 드롭다운 메뉴 아이템 인터페이스
 */
export interface DropdownItem {
  /** 아이템 키 (고유 식별자) */
  key: string;
  /** 아이템 레이블 */
  label: string;
  /** 아이콘 */
  icon?: React.ReactNode;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 구분선 표시 (이 아이템 뒤에) */
  divider?: boolean;
  /** 클릭 이벤트 */
  onClick?: () => void;
}

/**
 * 드롭다운 컴포넌트의 Props 인터페이스
 */
export interface DropdownProps {
  /** 드롭다운 트리거 버튼 내용 */
  trigger: React.ReactNode;
  /** 드롭다운 메뉴 아이템들 */
  items: DropdownItem[];
  /** 위치 */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** 트리거 버튼 전체 너비 사용 */
  fullWidth?: boolean;
  /** 메뉴가 열렸을 때 콜백 */
  onOpen?: () => void;
  /** 메뉴가 닫혔을 때 콜백 */
  onClose?: () => void;
}

/**
 * 공통 드롭다운 메뉴 컴포넌트
 *
 * @example
 * ```tsx
 * const items = [
 *   { key: 'edit', label: '편집', icon: <EditIcon /> },
 *   { key: 'delete', label: '삭제', icon: <DeleteIcon />, divider: true },
 *   { key: 'archive', label: '보관', disabled: true }
 * ];
 *
 * <Dropdown trigger={<Button>액션</Button>} items={items} />
 * ```
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  fullWidth = false,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 드롭다운 토글
  const toggleDropdown = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState) {
      onOpen?.();
    } else {
      onClose?.();
    }
  };

  // 드롭다운 닫기
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  // 아이템 클릭 처리
  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;

    item.onClick?.();
    closeDropdown();
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, closeDropdown]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeDropdown();
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, closeDropdown]);

  // 키보드 네비게이션
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const menuItems = dropdownRef.current?.querySelectorAll(
      '.dropdown-item:not(.dropdown-item--disabled)'
    ) as NodeListOf<HTMLElement>;

    if (!menuItems) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = (index + 1) % menuItems.length;
        menuItems[nextIndex]?.focus();
        break;
      }

      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
        menuItems[prevIndex]?.focus();
        break;
      }

      case 'Home':
        event.preventDefault();
        menuItems[0]?.focus();
        break;

      case 'End':
        event.preventDefault();
        menuItems[menuItems.length - 1]?.focus();
        break;
    }
  };

  const dropdownClasses = [
    'dropdown',
    fullWidth && 'dropdown--full-width',
  ]
    .filter(Boolean)
    .join(' ');

  const menuClasses = [
    'dropdown-menu',
    `dropdown-menu--${placement}`,
    isOpen && 'dropdown-menu--open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={dropdownClasses} ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        ref={triggerRef}
        className="dropdown-trigger"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        {trigger}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className={menuClasses} role="menu" aria-orientation="vertical">
          {items.map((item, index) => (
            <React.Fragment key={item.key}>
              <button
                className={`dropdown-item ${
                  item.disabled ? 'dropdown-item--disabled' : ''
                }`}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={item.disabled}
                role="menuitem"
                type="button"
                tabIndex={item.disabled ? -1 : 0}
              >
                {item.icon && (
                  <span className="dropdown-item__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="dropdown-item__label">{item.label}</span>
              </button>

              {/* 구분선 */}
              {item.divider && <div className="dropdown-divider" role="separator" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
