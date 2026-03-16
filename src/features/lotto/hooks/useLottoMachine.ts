import { useRef, useEffect, useCallback, useState } from 'react';
import type { Ball } from '../types/lotto.types';
import { createBalls, updateBalls, renderDome, renderBall } from '../utils/ballPhysics';

interface UseLottoMachineOptions {
  isSpinning: boolean;
  selectedIds: number[];
}

export function useLottoMachine({ isSpinning, selectedIds }: UseLottoMachineOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

  const getCanvasMetrics = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const domeRadius = Math.min(w, h) / 2 - 20;

    return { dpr, w, h, centerX, centerY, domeRadius };
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const metrics = getCanvasMetrics();
    if (!metrics) return;

    const { dpr, w, h, centerX, centerY, domeRadius } = metrics;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    ballsRef.current = createBalls(domeRadius, centerX, centerY);
    setIsReady(true);
  }, [getCanvasMetrics]);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const metrics = getCanvasMetrics();

    if (!canvas || !ctx || !metrics) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    const { dpr, w, h, centerX, centerY, domeRadius } = metrics;

    const delta = lastTimeRef.current ? (time - lastTimeRef.current) / 16.67 : 1;
    lastTimeRef.current = time;

    // Mark selected balls
    for (const ball of ballsRef.current) {
      ball.selected = selectedIds.includes(ball.id);
    }

    // Update physics
    ballsRef.current = updateBalls(
      ballsRef.current,
      domeRadius,
      centerX,
      centerY,
      isSpinning,
      delta
    );

    // Clear and render
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    renderDome(ctx, centerX, centerY, domeRadius);

    for (const ball of ballsRef.current) {
      renderBall(ctx, ball);
    }

    ctx.restore();

    rafRef.current = requestAnimationFrame(animate);
  }, [isSpinning, selectedIds, getCanvasMetrics]);

  const resetBalls = useCallback(() => {
    const metrics = getCanvasMetrics();
    if (!metrics) return;
    ballsRef.current = createBalls(metrics.domeRadius, metrics.centerX, metrics.centerY);
  }, [getCanvasMetrics]);

  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return { canvasRef, isReady, resetBalls };
}
