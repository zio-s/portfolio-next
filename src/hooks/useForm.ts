import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

/**
 * 필드 유효성 검사 규칙
 */
export type ValidationRule<T> = {
  /** 필수 입력 여부 */
  required?: boolean;
  /** 최소 길이 */
  minLength?: number;
  /** 최대 길이 */
  maxLength?: number;
  /** 정규식 패턴 */
  pattern?: RegExp;
  /** 커스텀 유효성 검사 함수 */
  validate?: (value: T[keyof T]) => boolean | string;
};

/**
 * 폼 필드의 유효성 검사 규칙 맵
 */
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>;
};

/**
 * 필드별 에러 메시지
 */
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * 폼 상태를 관리하는 훅의 반환 타입
 */
export interface UseFormReturn<T> {
  /** 폼 데이터 값들 */
  values: T;
  /** 필드별 에러 메시지 */
  errors: FormErrors<T>;
  /** 터치된 필드들 (사용자가 수정한 필드) */
  touched: { [K in keyof T]?: boolean };
  /** 입력 필드의 값 변경 핸들러 */
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** 입력 필드의 blur 핸들러 */
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** 폼 제출 핸들러 */
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e: FormEvent) => Promise<void>;
  /** 특정 필드 값 설정 */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** 특정 필드 에러 설정 */
  setFieldError: <K extends keyof T>(field: K, error: string) => void;
  /** 특정 필드를 터치됨으로 표시 */
  setFieldTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  /** 폼 초기화 */
  resetForm: () => void;
  /** 폼 유효성 여부 */
  isValid: boolean;
  /** 제출 중 여부 */
  isSubmitting: boolean;
}

/**
 * 폼 상태 관리 및 유효성 검사를 처리합니다.
 *
 * @template T - 폼 데이터의 타입
 * @param initialValues - 초기 폼 값들
 * @param validationRules - 필드별 유효성 검사 규칙
 * @returns 폼 상태와 제어 함수들
 *
 * @example
 * ```tsx
 * interface LoginForm {
 *   email: string;
 *   password: string;
 * }
 *
 * function LoginPage() {
 *   const form = useForm<LoginForm>(
 *     { email: '', password: '' },
 *     {
 *       email: {
 *         required: true,
 *         pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
 *       },
 *       password: {
 *         required: true,
 *         minLength: 8,
 *       },
 *     }
 *   );
 *
 *   return (
 *     <form onSubmit={form.handleSubmit((values) => console.log(values))}>
 *       <input
 *         name="email"
 *         value={form.values.email}
 *         onChange={form.handleChange}
 *         onBlur={form.handleBlur}
 *       />
 *       {form.touched.email && form.errors.email && (
 *         <span>{form.errors.email}</span>
 *       )}
 *
 *       <input
 *         name="password"
 *         type="password"
 *         value={form.values.password}
 *         onChange={form.handleChange}
 *         onBlur={form.handleBlur}
 *       />
 *       {form.touched.password && form.errors.password && (
 *         <span>{form.errors.password}</span>
 *       )}
 *
 *       <button type="submit" disabled={!form.isValid || form.isSubmitting}>
 *         로그인
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {}
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 단일 필드 유효성 검사
  const validateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]): string | undefined => {
      const rules = validationRules[field];
      if (!rules) return undefined;

      // 필수 입력 검사
      if (rules.required && !value) {
        return '필수 입력 항목입니다';
      }

      // 문자열 타입인 경우에만 길이 검사
      if (typeof value === 'string') {
        // 최소 길이 검사
        if (rules.minLength && value.length < rules.minLength) {
          return `최소 ${rules.minLength}자 이상 입력해주세요`;
        }

        // 최대 길이 검사
        if (rules.maxLength && value.length > rules.maxLength) {
          return `최대 ${rules.maxLength}자까지 입력 가능합니다`;
        }

        // 정규식 패턴 검사
        if (rules.pattern && !rules.pattern.test(value)) {
          return '올바른 형식이 아닙니다';
        }
      }

      // 커스텀 유효성 검사
      if (rules.validate) {
        const result = rules.validate(value);
        if (typeof result === 'string') {
          return result;
        }
        if (result === false) {
          return '유효하지 않은 값입니다';
        }
      }

      return undefined;
    },
    [validationRules]
  );

  // 전체 폼 유효성 검사
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    (Object.keys(values) as Array<keyof T>).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // 입력 필드 변경 핸들러
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;

      let fieldValue: T[keyof T];

      // 체크박스 처리
      if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        fieldValue = e.target.checked as T[keyof T];
      } else {
        fieldValue = value as T[keyof T];
      }

      setValues((prev) => ({ ...prev, [fieldName]: fieldValue }));

      // 변경 시 해당 필드 유효성 검사
      const error = validateField(fieldName, fieldValue);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    },
    [validateField]
  );

  // 필드 blur 핸들러
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const fieldName = name as keyof T;

      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      // blur 시 해당 필드 유효성 검사
      const error = validateField(fieldName, values[fieldName]);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    },
    [values, validateField]
  );

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => {
      return async (e: FormEvent) => {
        e.preventDefault();

        // 모든 필드를 터치됨으로 표시
        const allTouched = Object.keys(values).reduce((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {} as { [K in keyof T]: boolean });
        setTouched(allTouched);

        // 전체 폼 유효성 검사
        const isValid = validateForm();

        if (isValid) {
          setIsSubmitting(true);
          try {
            await onSubmit(values);
          } catch {
            // Error handled silently
          } finally {
            setIsSubmitting(false);
          }
        }
      };
    },
    [values, validateForm]
  );

  // 특정 필드 값 설정
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 특정 필드 에러 설정
  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // 특정 필드를 터치됨으로 표시
  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  // 폼 초기화
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 폼 유효성 여부
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    isValid,
    isSubmitting,
  };
}
