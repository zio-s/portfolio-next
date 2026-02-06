# Toast Notification System

A complete, production-ready toast notification system for React applications.

## Features

- **Auto-dismiss**: Toasts automatically disappear after 3 seconds (configurable)
- **Multiple types**: Success, error, warning, and info variants
- **Smooth animations**: Slide-in and slide-out animations
- **Stack support**: Display multiple toasts simultaneously
- **TypeScript**: Full type safety with strict mode
- **Accessible**: ARIA labels and keyboard navigation support
- **Responsive**: Mobile-friendly with adaptive animations
- **Dark mode**: Automatic dark mode support
- **Reduced motion**: Respects user preferences for reduced motion

## Installation

All files are already in place. No additional dependencies required.

## Setup

### 1. Wrap your app with ToastProvider

```tsx
import { ToastProvider, ToastContainer } from './components/toast';

function App() {
  return (
    <ToastProvider>
      <YourApp />
      <ToastContainer />
    </ToastProvider>
  );
}
```

### 2. Use the toast hook in your components

```tsx
import { useToast } from './components/toast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handleWarning = () => {
    toast.warning('Please be careful!');
  };

  const handleInfo = () => {
    toast.info('Here is some information.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

## API Reference

### ToastProvider

The context provider that manages toast state.

```tsx
<ToastProvider>
  {children}
</ToastProvider>
```

### ToastContainer

The container component that renders all active toasts.

```tsx
<ToastContainer />
```

### useToast()

Hook that provides access to toast functions.

```tsx
const toast = useToast();
```

#### Methods

- **`toast.success(message, duration?)`** - Show success toast
- **`toast.error(message, duration?)`** - Show error toast
- **`toast.warning(message, duration?)`** - Show warning toast
- **`toast.info(message, duration?)`** - Show info toast
- **`toast.addToast(message, type?, duration?)`** - Generic toast method
- **`toast.removeToast(id)`** - Manually remove a toast

#### Parameters

- `message` (string): The message to display
- `type` (ToastType): 'success' | 'error' | 'warning' | 'info'
- `duration` (number): Duration in milliseconds (default: 3000)

### toastManager

Singleton manager for use outside React components.

```tsx
import { toastManager } from './components/toast';

// In non-React code
toastManager.success('Action completed!');
toastManager.error('Error occurred!');
```

## Advanced Usage

### Custom Duration

```tsx
// Toast will stay for 5 seconds
toast.success('Long message', 5000);

// Toast will stay indefinitely (must be closed manually)
toast.info('Persistent message', 0);
```

### Manual Toast Removal

```tsx
const id = toast.info('Processing...');

// Later, remove the toast manually
toast.removeToast(id);
```

### Using Outside React Components

```tsx
import { toastManager } from './components/toast';

// In API utility, Redux middleware, etc.
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    toastManager.success('Data loaded successfully!');
    return response.json();
  } catch (error) {
    toastManager.error('Failed to load data');
    throw error;
  }
}
```

## Customization

### CSS Variables

You can customize colors by modifying `toast.css` or overriding CSS classes:

```css
/* Custom success color */
.toast--success {
  background-color: #your-color;
  border-left-color: #your-border-color;
}
```

### Position

By default, toasts appear in the top-right corner. To change position, modify `.toast-container` in `toast.css`:

```css
.toast-container {
  /* Top-left */
  top: 20px;
  left: 20px;
  right: auto;

  /* Bottom-right */
  /* top: auto; */
  /* bottom: 20px; */
  /* right: 20px; */
}
```

## TypeScript Types

```typescript
import type { ToastType, ToastContextValue } from './components/toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires support for:
  - CSS animations
  - CSS Grid/Flexbox
  - ES2022 features
  - crypto.randomUUID()

## Accessibility

- Proper ARIA roles and labels
- Keyboard navigation support
- Screen reader friendly
- Respects `prefers-reduced-motion`
- Focus management for close buttons

## File Structure

```
toast/
├── hooks/
│   ├── index.ts              # Hook exports
│   └── use-toast.ts          # Main toast hook
├── index.ts                  # Main exports
├── toast-manager.ts          # State management
├── Toast.tsx                 # Individual toast component
├── ToastContainer.tsx        # Container component
├── ToastProvider.tsx         # Context provider
├── toast.css                 # Styles
├── types.ts                  # TypeScript types
└── README.md                 # This file
```

## License

Part of the frontend-portfolio-cms project.
