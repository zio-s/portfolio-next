import type { Ball } from '../types/lotto.types';
import { LOTTO } from './lottoConstants';
import { getBallColor } from './lottoColors';

export function createBalls(domeRadius: number, centerX: number, centerY: number): Ball[] {
  const balls: Ball[] = [];
  const r = LOTTO.BALL_RADIUS;
  const safeRadius = domeRadius - r - 5;

  for (let i = 1; i <= LOTTO.MAX_NUMBER; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * safeRadius * 0.7;
    const { bg, text } = getBallColor(i);

    balls.push({
      id: i,
      x: centerX + Math.cos(angle) * dist,
      y: centerY + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * LOTTO.MAX_VELOCITY * 2,
      vy: (Math.random() - 0.5) * LOTTO.MAX_VELOCITY * 2,
      radius: r,
      color: bg,
      textColor: text,
      selected: false,
      opacity: 1,
    });
  }

  return balls;
}

export function updateBalls(
  balls: Ball[],
  domeRadius: number,
  centerX: number,
  centerY: number,
  isSpinning: boolean,
  dt: number
): Ball[] {
  const clampedDt = Math.min(dt, 3);

  for (const ball of balls) {
    if (ball.selected) continue;

    // Gravity
    ball.vy += LOTTO.GRAVITY * clampedDt;

    // Extra energy when spinning
    if (isSpinning) {
      ball.vx += (Math.random() - 0.5) * 0.8;
      ball.vy += (Math.random() - 0.5) * 0.8;
    }

    // Friction
    ball.vx *= LOTTO.FRICTION;
    ball.vy *= LOTTO.FRICTION;

    // Clamp velocity
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    const maxSpeed = 8;
    if (speed > maxSpeed) {
      ball.vx = (ball.vx / speed) * maxSpeed;
      ball.vy = (ball.vy / speed) * maxSpeed;
    }

    // Update position
    ball.x += ball.vx * clampedDt;
    ball.y += ball.vy * clampedDt;
  }

  // Dome boundary collision
  for (const ball of balls) {
    if (ball.selected) continue;

    const dx = ball.x - centerX;
    const dy = ball.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = domeRadius - ball.radius;

    if (dist > maxDist) {
      const nx = dx / dist;
      const ny = dy / dist;

      ball.x = centerX + nx * maxDist;
      ball.y = centerY + ny * maxDist;

      const dotProduct = ball.vx * nx + ball.vy * ny;
      ball.vx -= 2 * dotProduct * nx * LOTTO.RESTITUTION;
      ball.vy -= 2 * dotProduct * ny * LOTTO.RESTITUTION;
    }
  }

  // Ball-ball collision
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].selected) continue;
    for (let j = i + 1; j < balls.length; j++) {
      if (balls[j].selected) continue;

      const a = balls[i];
      const b = balls[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;

      if (dist < minDist && dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (minDist - dist) / 2;

        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        const relVx = a.vx - b.vx;
        const relVy = a.vy - b.vy;
        const relDot = relVx * nx + relVy * ny;

        if (relDot > 0) {
          const impulse = relDot * LOTTO.BALL_RESTITUTION;
          a.vx -= impulse * nx;
          a.vy -= impulse * ny;
          b.vx += impulse * nx;
          b.vy += impulse * ny;
        }
      }
    }
  }

  return balls;
}

export function renderDome(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number
) {
  // Background glow
  const outerGlow = ctx.createRadialGradient(centerX, centerY, radius * 0.9, centerX, centerY, radius * 1.15);
  outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0)');
  outerGlow.addColorStop(0.7, 'rgba(139, 92, 246, 0.15)');
  outerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = outerGlow;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Dome background
  const grad = ctx.createRadialGradient(
    centerX - radius * 0.3, centerY - radius * 0.3, 0,
    centerX, centerY, radius
  );
  grad.addColorStop(0, 'rgba(30, 20, 60, 0.6)');
  grad.addColorStop(0.7, 'rgba(15, 10, 35, 0.8)');
  grad.addColorStop(1, 'rgba(10, 5, 25, 0.9)');

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Glass border
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner highlight
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Glass reflection
  ctx.beginPath();
  ctx.ellipse(centerX - radius * 0.2, centerY - radius * 0.3, radius * 0.35, radius * 0.15, -0.5, 0, Math.PI * 2);
  const reflGrad = ctx.createRadialGradient(
    centerX - radius * 0.2, centerY - radius * 0.3, 0,
    centerX - radius * 0.2, centerY - radius * 0.3, radius * 0.35
  );
  reflGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
  reflGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = reflGrad;
  ctx.fill();
}

export function renderBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  if (ball.selected) return;

  ctx.save();
  ctx.globalAlpha = ball.opacity;

  // Ball shadow
  const shadowGrad = ctx.createRadialGradient(
    ball.x + 2, ball.y + 2, 0,
    ball.x + 2, ball.y + 2, ball.radius
  );
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.beginPath();
  ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = shadowGrad;
  ctx.fill();

  // Ball body
  const bodyGrad = ctx.createRadialGradient(
    ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.1,
    ball.x, ball.y, ball.radius
  );
  bodyGrad.addColorStop(0, lightenColor(ball.color, 40));
  bodyGrad.addColorStop(0.7, ball.color);
  bodyGrad.addColorStop(1, darkenColor(ball.color, 30));

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.arc(ball.x - ball.radius * 0.25, ball.y - ball.radius * 0.25, ball.radius * 0.35, 0, Math.PI * 2);
  const hlGrad = ctx.createRadialGradient(
    ball.x - ball.radius * 0.25, ball.y - ball.radius * 0.25, 0,
    ball.x - ball.radius * 0.25, ball.y - ball.radius * 0.25, ball.radius * 0.35
  );
  hlGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  hlGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = hlGrad;
  ctx.fill();

  // Number text
  ctx.fillStyle = ball.textColor;
  ctx.font = `bold ${ball.radius * 0.85}px "Pretendard Variable", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(ball.id), ball.x, ball.y + 1);

  ctx.restore();
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}
