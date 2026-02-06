# Modal Management System

A complete, production-ready modal management system for React applications with TypeScript support.

## Features

- **Observer Pattern**: Efficient state management with automatic updates
- **Browser History Integration**: Back button closes modals naturally
- **Stack-Based Management**: Handle multiple modals with proper z-index stacking
- **TypeScript Strict Mode**: Full type safety and IntelliSense support
- **Framework Agnostic**: Works with any React project
- **Zero Dependencies**: Only requires React and uuid (already in your project)
- **Keyboard Support**: ESC key closes modals
- **Backdrop Click**: Optional backdrop click to close
- **Custom Modals**: Support for custom modal components

## Installation

The modal system is already installed in your project. Just import and use!

## Quick Start

### 1. Add ModalContainer to Your App

Add the `ModalContainer` to your app's root component:

```tsx
// src/App.tsx
import { ModalContainer } from './components/modal';

function App() {
  return (
    <>
      <YourAppContent />
      <ModalContainer />
    </>
  );
}

export default App;
```

### 2. Use Modal Hooks in Your Components

```tsx
import { useAlertModal, useConfirmModal } from './components/modal';

function MyComponent() {
  const { showAlert } = useAlertModal();
  const { showConfirm } = useConfirmModal();

  const handleSuccess = () => {
    showAlert({
      title: 'Success',
      message: 'Operation completed successfully!',
      type: 'success',
      onConfirm: () => console.log('Alert closed'),
    });
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item?',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        console.log('Item deleted');
      },
      onCancel: () => {
        console.log('Cancelled');
      },
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleDelete}>Show Confirm</button>
    </div>
  );
}
```

## API Reference

### Alert Modal

Display simple alert messages with a single action button.

```tsx
const { showAlert, closeAlert } = useAlertModal();

const alertId = showAlert({
  title: 'Alert Title',
  message: 'Alert message content',
  type: 'info' | 'success' | 'warning' | 'error',
  confirmText: 'OK',
  closeOnBackdrop: true,
  closeOnEsc: true,
  onConfirm: () => {
    // Called when OK is clicked
  },
});

// Close programmatically
closeAlert(alertId);
```

### Confirm Modal

Display confirmation dialogs with confirm and cancel actions.

```tsx
const { showConfirm, closeConfirm } = useConfirmModal();

const confirmId = showConfirm({
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  type: 'info' | 'warning' | 'danger',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  closeOnBackdrop: true,
  closeOnEsc: true,
  onConfirm: () => {
    // Called when Confirm is clicked
  },
  onCancel: () => {
    // Called when Cancel is clicked
  },
});

// Close programmatically
closeConfirm(confirmId);
```

### Custom Modal

Create custom modal components with your own content.

```tsx
import { modalManager } from './components/modal';
import type { ModalComponentProps } from './components/modal';

// Define your custom modal component
const CustomModal: React.FC<ModalComponentProps> = ({ close, name }) => {
  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
      <h2>Hello {name}!</h2>
      <button onClick={close}>Close</button>
    </div>
  );
};

// Show the custom modal
const modalId = modalManager.custom({
  component: CustomModal,
  props: { name: 'World' },
  closeOnBackdrop: true,
  closeOnEsc: true,
  onClose: () => {
    console.log('Modal closed');
  },
});
```

### Modal Manager

Direct access to the modal manager for advanced use cases.

```tsx
import { modalManager } from './components/modal';

// Open modals
const alertId = modalManager.alert({ message: 'Hello' });
const confirmId = modalManager.confirm({ message: 'Confirm?' });
const customId = modalManager.custom({ component: MyComponent });

// Close modals
modalManager.close(alertId); // Close specific modal
modalManager.closeTop(); // Close topmost modal
modalManager.closeAll(); // Close all modals

// Get modal state
const modals = modalManager.getModals();

// Subscribe to changes
const unsubscribe = modalManager.subscribe((modals) => {
  console.log('Modals changed:', modals);
});

// Cleanup
unsubscribe();
```

### useModalManager Hook

React hook for managing modal state in components.

```tsx
import { useModalManager } from './components/modal';

function MyComponent() {
  const {
    modals, // Array of all active modals
    closeModal, // Close specific modal by ID
    closeTopModal, // Close topmost modal
    closeAllModals, // Close all modals
    modalCount, // Number of active modals
    hasModals, // Boolean indicating if any modal is open
  } = useModalManager();

  return (
    <div>
      <p>Active modals: {modalCount}</p>
      {hasModals && <button onClick={closeTopModal}>Close Top</button>}
    </div>
  );
}
```

## Options

### Base Modal Options

Common options available for all modal types:

```typescript
interface BaseModalOptions {
  id?: string; // Unique identifier (auto-generated if not provided)
  title?: string; // Modal title
  closeOnBackdrop?: boolean; // Close on backdrop click (default: true)
  closeOnEsc?: boolean; // Close on ESC key (default: true)
  className?: string; // Additional CSS classes
  zIndex?: number; // Custom z-index (default: 1000 + stack position)
}
```

### Alert Modal Options

```typescript
interface AlertModalOptions extends BaseModalOptions {
  message: string; // Alert message (required)
  confirmText?: string; // Confirm button text (default: 'OK')
  type?: 'info' | 'success' | 'warning' | 'error'; // Alert type (default: 'info')
  onConfirm?: () => void; // Callback when confirmed
}
```

### Confirm Modal Options

```typescript
interface ConfirmModalOptions extends BaseModalOptions {
  message: string; // Confirmation message (required)
  confirmText?: string; // Confirm button text (default: 'Confirm')
  cancelText?: string; // Cancel button text (default: 'Cancel')
  type?: 'info' | 'warning' | 'danger'; // Confirmation type (default: 'info')
  onConfirm?: () => void; // Callback when confirmed
  onCancel?: () => void; // Callback when cancelled
}
```

## Browser History Integration

The modal system automatically integrates with browser history:

- Opening a modal pushes a new history state
- Pressing the back button closes the topmost modal
- Multiple modals create multiple history states
- Natural browser navigation experience

## Styling

The modal system includes built-in styles with smooth animations:

- Fade-in backdrop animation
- Slide-up modal animation
- Hover effects on buttons
- Responsive design
- Accessible color schemes

To customize styles, you can:

1. Use the `className` prop to add custom CSS classes
2. Override inline styles in your custom components
3. Wrap modals in styled components

## TypeScript Support

Full TypeScript support with strict mode enabled:

```typescript
import type {
  ModalId,
  AlertModalOptions,
  ConfirmModalOptions,
  CustomModalOptions,
  ModalComponentProps,
} from './components/modal';
```

## Best Practices

1. **Add ModalContainer once** at your app root
2. **Use hooks in components** for reactive updates
3. **Use modalManager directly** for imperative calls
4. **Handle cleanup** in custom modal components
5. **Test with keyboard navigation** (ESC, Tab)
6. **Test with browser back button** for history integration

## Examples

See the `EXAMPLES.md` file for more detailed examples and use cases.

## Architecture

### File Structure

```
modal/
├── types.ts                    # TypeScript types and interfaces
├── modal-manager.ts            # Singleton modal manager (Observer pattern)
├── ModalContainer.tsx          # Root container for rendering modals
├── AlertModal.tsx              # Alert modal component
├── ConfirmModal.tsx            # Confirm modal component
├── hooks/
│   ├── use-modal-manager.ts    # Modal state management hook
│   ├── use-alert-modal.ts      # Alert modal hook
│   ├── use-confirm-modal.ts    # Confirm modal hook
│   └── index.ts                # Hook exports
├── index.ts                    # Main export file
└── README.md                   # Documentation
```

### Design Patterns

- **Singleton Pattern**: Single modal manager instance
- **Observer Pattern**: State change notifications
- **Factory Pattern**: Modal creation methods
- **Hook Pattern**: React integration

## License

Part of your project. Use freely.
