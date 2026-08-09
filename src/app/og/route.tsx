import { ImageResponse } from 'next/og';

/**
 * 기본 OG 이미지 (1200x630)
 *
 * 빌드 타임에 정적 생성 — Google Fonts에서 사용 글자만 서브셋으로 받아 렌더.
 * 사용처: generateSEOMetadata의 DEFAULT_SEO.image
 */

export const dynamic = 'force-static';

const WIDTH = 1200;
const HEIGHT = 630;

const NAME = '변세민';
const ROLE = 'Frontend Developer';
const TAGLINE = '사용자 경험을 최우선으로 생각하는 개발자';
const STACKS = ['React', 'TypeScript', 'Next.js'];
const DOMAIN = 'semincode.com';

/** Google Fonts css2에서 TTF URL을 추출해 폰트 데이터를 가져온다 (satori는 woff2 미지원) */
async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!resource) throw new Error(`OG font css parse 실패: ${family} ${weight}`);

  const res = await fetch(resource[1]);
  if (!res.ok) throw new Error(`OG font fetch 실패: ${res.status}`);
  return res.arrayBuffer();
}

export async function GET() {
  const allText = [NAME, ROLE, TAGLINE, ...STACKS, DOMAIN].join('');
  const [bold, regular] = await Promise.all([
    loadGoogleFont('Noto Sans KR', 700, allText),
    loadGoogleFont('Noto Sans KR', 400, allText),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a0f',
          backgroundImage:
            'radial-gradient(ellipse 60% 55% at 72% 30%, rgba(139, 92, 246, 0.22), transparent 70%), radial-gradient(ellipse 50% 45% at 20% 80%, rgba(96, 165, 250, 0.14), transparent 70%)',
          padding: '72px 80px',
          fontFamily: 'Noto Sans KR',
        }}
      >
        {/* 상단: 도메인 라벨 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'rgba(255,255,255,0.55)',
            fontSize: 26,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              backgroundColor: '#8b5cf6',
            }}
          />
          {DOMAIN}
        </div>

        {/* 중앙: 이름 + 직무 + 태그라인 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 28,
            }}
          >
            <div style={{ fontSize: 96, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
              {NAME}
            </div>
            <div
              style={{
                fontSize: 54,
                fontWeight: 700,
                lineHeight: 1.1,
                backgroundImage: 'linear-gradient(90deg, #60a5fa, #818cf8, #a78bfa)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {ROLE}
            </div>
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 34,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            {TAGLINE}
          </div>
        </div>

        {/* 하단: 기술 스택 칩 */}
        <div style={{ display: 'flex', gap: 16 }}>
          {STACKS.map((stack) => (
            <div
              key={stack}
              style={{
                display: 'flex',
                padding: '12px 28px',
                borderRadius: 9999,
                border: '1px solid rgba(139, 92, 246, 0.45)',
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 26,
              }}
            >
              {stack}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Noto Sans KR', data: bold, weight: 700, style: 'normal' },
        { name: 'Noto Sans KR', data: regular, weight: 400, style: 'normal' },
      ],
    },
  );
}
