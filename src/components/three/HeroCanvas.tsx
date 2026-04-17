'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer, RenderPass, EffectPass, BloomEffect } from 'postprocessing';

gsap.registerPlugin(ScrollTrigger);

// ─── 구 버텍스 셰이더 ─────────────────────────────────────────────
const sphereVert = /* glsl */`
  uniform vec3  uMouseWorld;
  uniform float uTime;
  attribute float aSize;
  attribute vec3  aColor;
  attribute float aDisplacement;
  varying vec3  vColor;
  varying float vProximity;
  varying float vRipple;
  varying float vDisp;

  void main() {
    vColor = aColor;
    vDisp  = aDisplacement;

    // 월드 스페이스 XY 거리 — 사이즈 부스트/ripple용
    vec3 worldPos  = (modelMatrix * vec4(position, 1.0)).xyz;
    float dist2D   = length(worldPos.xy - uMouseWorld.xy);
    vProximity     = 1.0 - smoothstep(0.0, 2.2, dist2D);

    // ripple 파동
    float wave     = sin(dist2D * 4.0 - uTime * 3.5);
    vRipple        = max(0.0, wave) * smoothstep(0.0, 1.2, vProximity) * 0.5;

    vec4  mvPos    = modelViewMatrix * vec4(position, 1.0);
    float base     = aSize * (600.0 / -mvPos.z);
    float boost    = 1.0 + vProximity * 2.2 + vRipple * 1.2;
    gl_PointSize   = base * boost;
    gl_Position    = projectionMatrix * mvPos;
  }
`;

// ─── 구 프래그먼트 셰이더 — 포트폴리오 퍼플 테마 ──────────────────
const sphereFrag = /* glsl */`
  uniform float uCenterGlow;
  varying vec3  vColor;
  varying float vProximity;
  varying float vRipple;
  varying float vDisp;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;

    float core  = smoothstep(0.5, 0.02, d);
    float halo  = smoothstep(0.5, 0.18, d) * 0.35;

    // 실제 변위된 파티클만 보라색으로 시프트 (aDisplacement 기반, 근접도 아님)
    vec3  purpleShift = mix(vColor, vec3(0.62, 0.38, 1.0), vDisp);
    // ripple 아우라 — 보라빛 파동
    vec3  aura    = vec3(0.60, 0.28, 0.95) * vRipple * halo * 2.2;
    // 중앙 호버 시 보라 앰비언트 성운 효과
    vec3  ambient = vec3(0.50, 0.22, 0.88) * uCenterGlow * 0.6;

    float alpha   = core + halo * (0.2 + vProximity * 0.55);
    gl_FragColor  = vec4(purpleShift + aura + ambient, alpha);
  }
`;

// ─── 텍스트 버텍스 셰이더 ─────────────────────────────────────────
const textVert = /* glsl */`
  uniform vec3  uMouse;
  uniform float uTime;
  attribute float aSize;
  attribute vec3  aColor;
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    float dist      = length(position.xy - uMouse.xy);
    float proximity = 1.0 - smoothstep(0.0, 2.4, dist);
    float brightness = 0.05 + proximity * 0.95;
    vec3 pos = position;
    pos.y   += sin(uTime * 0.35 + position.x * 1.8) * 0.007;
    vColor = aColor * brightness;
    vAlpha = brightness;
    vec4  mvPos   = modelViewMatrix * vec4(pos, 1.0);
    float sizePx  = aSize * (500.0 / -mvPos.z);
    float szBoost = 1.0 + proximity * 3.0;
    gl_PointSize  = sizePx * szBoost;
    gl_Position   = projectionMatrix * mvPos;
  }
`;

// ─── 텍스트 프래그먼트 셰이더 ─────────────────────────────────────
const textFrag = /* glsl */`
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha  = smoothstep(0.5, 0.02, d) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ─── 모바일 감지 ─────────────────────────────────────────────
    const isMobile = () => window.innerWidth < 768;
    const hasMouse = !('ontouchstart' in window); // 마우스 있는 디바이스만 hover 효과

    // ─── Three.js 세팅 ────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = isMobile() ? 6.0 : 4; // 모바일: 카메라 멀리 → 구가 작게

    // alpha: true → 캔버스 배경 투명, 사이트 자체 배경색 사용
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 완전 투명
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // 저DPR(일반 모니터)에선 Bloom이 과포화되어 보여 완화
    const isLowDpr = Math.min(window.devicePixelRatio, 2) < 1.5;
    composer.addPass(new EffectPass(camera, new BloomEffect({
      intensity: isLowDpr ? 0.22 : 0.45,
      luminanceThreshold: isLowDpr ? 0.45 : 0.28,
      luminanceSmoothing: 0.88,
      mipmapBlur: true,
    })));

    // ─── ① 파티클 구 데이터 생성 ─────────────────────────────────
    const PARTICLE_COUNT = isMobile() ? 1800 : 4000; // 모바일 성능 최적화
    const SPHERE_RADIUS  = 1.5;

    const spherePos   = new Float32Array(PARTICLE_COUNT * 3);
    const sphereCol   = new Float32Array(PARTICLE_COUNT * 3);
    const sphereSiz   = new Float32Array(PARTICLE_COUNT);
    const sphereDisp  = new Float32Array(PARTICLE_COUNT); // 변위량 (0=원위치, 1=최대)
    const baseOrig    = new Float32Array(PARTICLE_COUNT * 3);
    const scatterOrig = new Float32Array(PARTICLE_COUNT * 3);
    const velocity    = new Float32Array(PARTICLE_COUNT * 3);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y     = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const r     = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x     = Math.cos(theta) * r * SPHERE_RADIUS;
      const z     = Math.sin(theta) * r * SPHERE_RADIUS;
      const yy    = y * SPHERE_RADIUS;

      spherePos[i*3] = x;  spherePos[i*3+1] = yy; spherePos[i*3+2] = z;
      baseOrig[i*3]  = x;  baseOrig[i*3+1]  = yy; baseOrig[i*3+2]  = z;

      scatterOrig[i*3]   = (Math.random() - 0.5) * 14;
      scatterOrig[i*3+1] = (Math.random() - 0.5) * 8;
      scatterOrig[i*3+2] = (Math.random() - 0.5) * 5 - 0.5;

      // 단순 화이트 — 밝기만 살짝 변주, 색상은 중립
      const b = 0.65 + Math.random() * 0.35;
      sphereCol[i*3] = b; sphereCol[i*3+1] = b; sphereCol[i*3+2] = b;

      sphereSiz[i] = Math.random() < 0.04
        ? 0.020 + Math.random() * 0.010
        : 0.004 + Math.random() * 0.005;
    }

    const sphereGeo = new THREE.BufferGeometry();
    sphereGeo.setAttribute('position',     new THREE.BufferAttribute(spherePos,  3));
    sphereGeo.setAttribute('aColor',       new THREE.BufferAttribute(sphereCol,  3));
    sphereGeo.setAttribute('aSize',        new THREE.BufferAttribute(sphereSiz,  1));
    sphereGeo.setAttribute('aDisplacement',new THREE.BufferAttribute(sphereDisp, 1));

    const uMouseWorldVec = new THREE.Vector3(9999, 9999, 9999);
    const sphereMat    = new THREE.ShaderMaterial({
      uniforms: {
        uMouseWorld: { value: uMouseWorldVec },
        uTime:       { value: 0 },
        uCenterGlow: { value: 0 },
      },
      vertexShader:   sphereVert,
      fragmentShader: sphereFrag,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });

    const particleSphere = new THREE.Points(sphereGeo, sphereMat);
    particleSphere.renderOrder = 1;
    scene.add(particleSphere);

    // ─── ② 배경 FRONTEND 텍스트 파티클 ───────────────────────────
    const uTextMouse = new THREE.Uniform(new THREE.Vector3(9999, 9999, 9999));
    const uTextTime  = new THREE.Uniform(0);
    let   textMesh: THREE.Points | null = null;

    const textMat = new THREE.ShaderMaterial({
      uniforms:       { uMouse: uTextMouse, uTime: uTextTime },
      vertexShader:   textVert,
      fragmentShader: textFrag,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });

    document.fonts.ready.then(() => {
      const cv  = document.createElement('canvas');
      cv.width  = 2400;
      cv.height = 420;
      const ctx = cv.getContext('2d')!;
      ctx.fillStyle    = 'white';
      ctx.font         = 'bold 310px "Inter", sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FRONTEND', cv.width / 2, cv.height / 2);

      const img  = ctx.getImageData(0, 0, cv.width, cv.height);
      const pts: number[] = [];
      const col: number[] = [];
      const siz: number[] = [];

      const STEP = 8;
      for (let y = 0; y < cv.height; y += STEP) {
        for (let x = 0; x < cv.width; x += STEP) {
          if (img.data[(y * cv.width + x) * 4 + 3] > 100) {
            const wx = (x / cv.width  - 0.5) * 8.0;
            const wy = -(y / cv.height - 0.5) * (8.0 * cv.height / cv.width);
            const wz = -0.7 + (Math.random() - 0.5) * 0.15;
            pts.push(wx, wy, wz);
            const t = Math.random();
            if (t < 0.45)      col.push(0.65, 0.72, 1.0);
            else if (t < 0.72) col.push(0.80, 0.68, 1.0);
            else               col.push(1.0,  1.0,  1.0);
            siz.push(Math.random() < 0.07 ? 0.024 : 0.010 + Math.random() * 0.007);
          }
        }
      }

      const tGeo = new THREE.BufferGeometry();
      tGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
      tGeo.setAttribute('aColor',   new THREE.BufferAttribute(new Float32Array(col), 3));
      tGeo.setAttribute('aSize',    new THREE.BufferAttribute(new Float32Array(siz), 1));
      textMesh = new THREE.Points(tGeo, textMat);
      textMesh.renderOrder = 0;
      scene.add(textMesh);
    });

    // ─── 마우스 인터랙션 ─────────────────────────────────────────
    const raycaster   = new THREE.Raycaster();
    // 평면을 구 앞면(z = SPHERE_RADIUS)으로 설정 — 커서와 보이드 위치 일치
    const planeSphere = new THREE.Plane(new THREE.Vector3(0, 0, 1), -SPHERE_RADIUS);
    const planeText   = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.7);
    const mouseWorld  = new THREE.Vector3(9999, 9999, 9999);
    const mouseTextW  = new THREE.Vector3(9999, 9999, 9999);

    // ─── 드래그 회전 ─────────────────────────────────────────────
    let isDragging = false;
    let prevDragX  = 0, prevDragY = 0;
    let inertiaDX  = 0, inertiaDY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevDragX  = e.clientX;
      prevDragY  = e.clientY;
      inertiaDX  = 0;
      inertiaDY  = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      // 터치(모바일)는 hover 반발력 비활성화 — 드래그 회전만 허용
      if (hasMouse && e.pointerType !== 'touch') {
        const mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        const nd = new THREE.Vector2(mouseX, -mouseY);
        raycaster.setFromCamera(nd, camera);
        if (!raycaster.ray.intersectPlane(planeSphere, mouseWorld)) mouseWorld.set(9999,9999,9999);
        if (!raycaster.ray.intersectPlane(planeText,   mouseTextW)) mouseTextW.set(9999,9999,9999);
      }
      if (!isDragging) return;
      inertiaDX = (e.clientX - prevDragX) * 0.007;
      inertiaDY = (e.clientY - prevDragY) * 0.007;
      prevDragX = e.clientX;
      prevDragY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      // 터치 종료 시 mouseWorld 초기화 (잔류 반발력 제거)
      if (e.pointerType === 'touch') mouseWorld.set(9999, 9999, 9999);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup',   onPointerUp);
    // ─── 스크롤 분산 ─────────────────────────────────────────────
    let disperseAmount = 0;
    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: '#hero',
      pin: !isMobile(), // 모바일에서는 pin 비활성화
      scrub: 1.5,
      start: 'top top',
      end: '+=100%',
      onUpdate: (self) => { disperseAmount = self.progress; },
    });

    // ─── 리사이즈 ─────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.position.z = isMobile() ? 6.0 : 4; // 방향 전환 시 카메라 거리 재조정
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // ─── 물리 상수 ───────────────────────────────────────────────
    const REPULSION_RADIUS   = 0.50;    // 마우스 영향 반경 — 클수록 넓은 범위 밀림 (월드 단위)
    const REPULSION_STRENGTH = 0.009;  // 밀어내는 힘 세기 — 클수록 강하게 튕겨남
    const SPRING_STRENGTH    = 0.0035; // 원위치 복귀 속도 — 클수록 빨리 돌아옴
    const DAMPING            = 0.96;   // 속도 감쇠 — 1에 가까울수록 관성이 오래 유지됨 (0.85~0.97 권장)
    const DRIFT_AMP          = 0.0095;  // 미세 흔들림 진폭 — 클수록 평소에 많이 흔들림
    const DRIFT_SPEED        = 0.015;   // 미세 흔들림 속도 — 클수록 빠르게 흔들림

    // ─── 인트로 애니메이션 ────────────────────────────────────────
    particleSphere.scale.setScalar(0);
    gsap.to(particleSphere.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.6,
      ease: 'elastic.out(1, 0.45)',
      delay: 0.5,
    });

    // ─── 애니메이션 루프 ─────────────────────────────────────────
    const clock = new THREE.Clock();
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // 드래그 + 관성 + 자동 회전
      if (isDragging) {
        particleSphere.rotation.y += inertiaDX;
        particleSphere.rotation.x += inertiaDY;
        particleSphere.rotation.x = Math.max(-1.2, Math.min(1.2, particleSphere.rotation.x));
      } else {
        inertiaDX *= 0.93;
        inertiaDY *= 0.93;
        particleSphere.rotation.y += inertiaDX;
        particleSphere.rotation.x += inertiaDY;
        const autoSpeed = 0.001 * (1.0 - Math.min(1.0, Math.abs(inertiaDX) * 30));
        particleSphere.rotation.y += autoSpeed;
      }

      uMouseWorldVec.copy(mouseWorld);
      uTextMouse.value.copy(mouseTextW);
      uTextTime.value          = elapsed;
      sphereMat.uniforms.uTime.value = elapsed;

      // 중앙 호버 앰비언트 보라 성운 효과 (월드 스페이스 기준)
      const mwxGlow = mouseWorld.x, mwyGlow = mouseWorld.y;
      const mouseDist2D = (mwxGlow === 9999) ? 9999 : Math.sqrt(mwxGlow*mwxGlow + mwyGlow*mwyGlow);
      const targetGlow  = Math.max(0, 1.0 - mouseDist2D / 2.0);
      sphereMat.uniforms.uCenterGlow.value +=
        (targetGlow - sphereMat.uniforms.uCenterGlow.value) * 0.06;

      // 월드 스페이스 반발력 계산용 — 구 회전행렬 프리컴퓨트
      particleSphere.updateMatrixWorld();
      const me = particleSphere.matrixWorld.elements;
      const sphereSX = Math.hypot(me[0], me[1], me[2]);
      const sphereSY = Math.hypot(me[4], me[5], me[6]);
      const sphereSZ = Math.hypot(me[8], me[9], me[10]);
      const invSx2 = sphereSX > 0.01 ? 1.0 / (sphereSX * sphereSX) : 0;
      const invSy2 = sphereSY > 0.01 ? 1.0 / (sphereSY * sphereSY) : 0;
      const invSz2 = sphereSZ > 0.01 ? 1.0 / (sphereSZ * sphereSZ) : 0;
      const mwx = mouseWorld.x, mwy = mouseWorld.y;
      const isMouseActive = mwx !== 9999;

      const pos = sphereGeo.attributes.position.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const cx = pos[i3], cy = pos[i3+1], cz = pos[i3+2];

        const td = elapsed * DRIFT_SPEED + i * 0.01;
        const tx = baseOrig[i3]   + Math.sin(td + i * 0.67) * DRIFT_AMP;
        const ty = baseOrig[i3+1] + Math.cos(td + i * 1.37) * DRIFT_AMP;
        const tz = baseOrig[i3+2] + Math.sin(td + i * 2.11) * DRIFT_AMP;

        let fx = 0, fy = 0, fz = 0;

        // 월드 스페이스 XY 반발력 — 구가 회전해도 대칭 보이드 없음
        // 로컬→월드 변환 후 XY 거리 계산, 힘을 R^T 로 로컬로 역변환
        if (isMouseActive) {
          const wx = me[0]*cx + me[4]*cy + me[8]*cz + me[12];
          const wy = me[1]*cx + me[5]*cy + me[9]*cz + me[13];
          const ddx = wx - mwx, ddy = wy - mwy;
          const dist2D = Math.sqrt(ddx*ddx + ddy*ddy);
          if (dist2D < REPULSION_RADIUS && dist2D > 0.001) {
            // 선형 감쇠 — REPULSION_STRENGTH 값이 체감과 1:1 비례
            const s = REPULSION_STRENGTH * (1.0 - dist2D / REPULSION_RADIUS);
            const fwx = (ddx/dist2D)*s, fwy = (ddy/dist2D)*s;
            // F_local = R^T * F_world / scale^2
            fx += (me[0]*fwx + me[1]*fwy) * invSx2;
            fy += (me[4]*fwx + me[5]*fwy) * invSy2;
            fz += (me[8]*fwx + me[9]*fwy) * invSz2;
          }
        }

        // 스프링 복귀 (scatter lerp)
        const finalTx = tx + (scatterOrig[i3]   - tx) * disperseAmount;
        const finalTy = ty + (scatterOrig[i3+1] - ty) * disperseAmount;
        const finalTz = tz + (scatterOrig[i3+2] - tz) * disperseAmount;
        const spring = SPRING_STRENGTH + disperseAmount * 0.035;
        fx += (finalTx - cx) * spring;
        fy += (finalTy - cy) * spring;
        fz += (finalTz - cz) * spring;

        // 속도 상한 — 강도 올려도 파티클이 튕겨 나가지 않도록
        const MAX_VEL = 0.038;
        velocity[i3]   = Math.max(-MAX_VEL, Math.min(MAX_VEL, velocity[i3]   * DAMPING + fx));
        velocity[i3+1] = Math.max(-MAX_VEL, Math.min(MAX_VEL, velocity[i3+1] * DAMPING + fy));
        velocity[i3+2] = Math.max(-MAX_VEL, Math.min(MAX_VEL, velocity[i3+2] * DAMPING + fz));

        pos[i3]   = cx + velocity[i3];
        pos[i3+1] = cy + velocity[i3+1];
        pos[i3+2] = cz + velocity[i3+2];

        // 원위치 대비 변위량 계산 → 색상 제어용 (0~1)
        const ox = baseOrig[i3], oy = baseOrig[i3+1], oz = baseOrig[i3+2];
        const nx = pos[i3], ny = pos[i3+1], nz = pos[i3+2];
        const dispDist = Math.sqrt((nx-ox)*(nx-ox) + (ny-oy)*(ny-oy) + (nz-oz)*(nz-oz));
        // 2.5 → 작은 변위도 빠르게 색상 변화, 상한 1.0
        sphereDisp[i] = Math.min(1.0, dispDist * 2.5);
      }

      sphereGeo.attributes.position.needsUpdate = true;
      (sphereGeo.attributes.aDisplacement as THREE.BufferAttribute).needsUpdate = true;
      composer.render();
    }
    animate();

    // ─── 클린업 ──────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup',   onPointerUp);
      window.removeEventListener('resize', onResize);
      scrollTriggerInstance.kill();
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      textMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
    />
  );
}
