'use client';

/**
 * CountUp
 *
 * 자릿수별 오도미터(슬롯머신) 롤링 카운터.
 * - 자릿수마다 독립된 "릴"이 빠르게 숫자를 돌리다가 왼쪽부터 순서대로 멈춰 정확한 값에 착지한다
 * - target의 자릿수(예: 9 → 1자리, 12 → 2자리)에 맞춰 릴 개수가 자동으로 늘어난다
 * - prefers-reduced-motion이면 스핀 없이 바로 최종 값을 보여준다
 * - target이 바뀌면(비동기로 실제 값이 로드된 시점 등) 이전 타이머를 모두 정리하고 새로 재생한다
 */

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  target: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const SPIN_INTERVAL_MS = 55; // 스핀 중 릴이 다음 숫자로 바뀌는 간격
const BASE_SETTLE_MS = 550; // 가장 왼쪽(가장 큰 자릿수) 릴이 멈추기까지 걸리는 시간
const STAGGER_MS = 180; // 오른쪽으로 갈수록 더해지는 지연 — 왼쪽부터 차례로 "착"하고 멈추는 연출

function toDigits(n: number): number[] {
  const safe = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  return String(safe).split('').map(Number);
}

function Digit({ value, spinning }: { value: number; spinning: boolean }) {
  return (
    <span
      className="relative inline-block overflow-hidden align-baseline"
      style={{ height: '1em', width: '1ch' }}
    >
      <span
        className="absolute left-0 top-0"
        style={{
          transform: `translateY(-${value}em)`,
          transition: spinning
            ? `transform ${SPIN_INTERVAL_MS}ms linear`
            : 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {Array.from({ length: 10 }).map((_, d) => (
          <span key={d} className="block" style={{ height: '1em', lineHeight: '1em' }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export function CountUp({ target, className, prefix, suffix }: CountUpProps) {
  const [displayDigits, setDisplayDigits] = useState<number[]>(() => toDigits(target));
  const [spinning, setSpinning] = useState<boolean[]>(() => toDigits(target).map(() => false));
  const intervalsRef = useRef<Array<ReturnType<typeof setInterval> | null>>([]);
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout> | null>>([]);

  useEffect(() => {
    const targetDigits = toDigits(target);

    intervalsRef.current.forEach((t) => t && clearInterval(t));
    timeoutsRef.current.forEach((t) => t && clearTimeout(t));
    intervalsRef.current = [];
    timeoutsRef.current = [];

    // setState는 effect 본문에서 동기적으로 호출하지 않고, 항상 타이머 콜백 안에서만 호출한다
    // (0ms 지연이라 체감상 즉시지만, effect 본문 자체는 setState를 직접 트리거하지 않는다)
    const kickoff = setTimeout(() => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        setDisplayDigits(targetDigits);
        setSpinning(targetDigits.map(() => false));
        return;
      }

      setDisplayDigits(targetDigits.map(() => Math.floor(Math.random() * 10)));
      setSpinning(targetDigits.map(() => true));

      targetDigits.forEach((finalDigit, i) => {
        intervalsRef.current[i] = setInterval(() => {
          setDisplayDigits((prev) => {
            if (i >= prev.length) return prev;
            const next = [...prev];
            next[i] = Math.floor(Math.random() * 10);
            return next;
          });
        }, SPIN_INTERVAL_MS);

        timeoutsRef.current[i] = setTimeout(() => {
          const interval = intervalsRef.current[i];
          if (interval) clearInterval(interval);

          setDisplayDigits((prev) => {
            if (i >= prev.length) return prev;
            const next = [...prev];
            next[i] = finalDigit;
            return next;
          });
          setSpinning((prev) => {
            if (i >= prev.length) return prev;
            const next = [...prev];
            next[i] = false;
            return next;
          });
        }, BASE_SETTLE_MS + (targetDigits.length - 1 - i) * STAGGER_MS);
      });
    }, 0);

    return () => {
      clearTimeout(kickoff);
      intervalsRef.current.forEach((t) => t && clearInterval(t));
      timeoutsRef.current.forEach((t) => t && clearTimeout(t));
    };
  }, [target]);

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      {prefix}
      {displayDigits.map((d, i) => (
        <Digit key={i} value={d} spinning={spinning[i] ?? false} />
      ))}
      {suffix}
    </span>
  );
}
