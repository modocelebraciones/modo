import { useEffect, useRef, useState } from 'react';

const BALL_SIZE = 40;
const CLIMAX_SCALE = 2;
const RIGHT_OFFSET = -20;

// Tile colour palette — silver/white/gray range with a few pastel accents
const TILE_COLORS = [
  '#FFFFFF', // 0 bright white
  '#F1F5F9', // 1 near-white
  '#E2E8F0', // 2 light silver
  '#CBD5E1', // 3 mid silver
  '#94A3B8', // 4 dark silver
  '#64748B', // 5 deep slate
  '#BAE6FD', // 6 ice blue accent
  '#E0F2FE', // 7 pale sky accent
  '#F8FAFC', // 8 almost white
  '#D1D5DB', // 9 neutral gray
];

// Pre-compute a 14×14 tile grid (tileSize=5.4, gap=0.3 → step=5.7, 14*5.7=79.8)
const COLS = 14;
const ROWS = 14;
const STEP = 5.7;
const TILES: { x: number; y: number; ci: number }[] = [];

// Deterministic pseudo-random colour index per tile
function pickColor(col: number, row: number): number {
  const n = (col * 7 + row * 13 + col * row) % 17;
  if (n === 0) return 6;  // ice blue — sparse
  if (n === 1) return 7;  // pale sky — sparse
  if (n <= 3) return 0;   // bright white
  if (n <= 5) return 1;
  if (n <= 7) return 2;
  if (n <= 9) return 3;
  if (n <= 11) return 8;
  if (n <= 13) return 9;
  if (n <= 15) return 4;
  return 5;
}

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    TILES.push({ x: c * STEP, y: r * STEP, ci: pickColor(c, r) });
  }
}

export default function DiscoBall() {
  const ballRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const facetRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const vhRef = useRef(typeof window !== 'undefined' ? window.innerHeight : 800);
  const dimStateRef = useRef<{ active: boolean; opacity: number; t: number }>({ active: false, opacity: 0, t: 0 });
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollMax = Math.max(1, document.body.scrollHeight - window.innerHeight);
      progressRef.current = Math.min(1, Math.max(0, window.scrollY / scrollMax));
    };
    const onResize = () => {
      vhRef.current = window.innerHeight;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const animate = (time: number) => {
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;

      const p = progressRef.current;
      const vh = vhRef.current;

      const translateY = (vh - BALL_SIZE / 2) * (1 - p) - (BALL_SIZE / 2) * p;

      const inMid = p >= 0.4 && p <= 0.6;
      const midT = inMid ? (p - 0.4) / 0.2 : 0;
      const bell = inMid ? Math.sin(midT * Math.PI) : 0;

      const scale = 1 + (CLIMAX_SCALE - 1) * bell;
      const glow = bell;
      const translateX = -60 * bell;

      const speed = 90 + 280 * bell;
      rotationRef.current += speed * dt;

      if (ballRef.current) {
        ballRef.current.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
      }
      if (facetRef.current) {
        facetRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }
      if (glowRef.current) {
        glowRef.current.style.opacity = `${glow}`;
        glowRef.current.style.transform = `scale(${1 + glow * 0.5})`;
      }

      const ds = dimStateRef.current;
      if (bell > 0.82 && !ds.active) {
        ds.active = true;
        ds.t = 1.0;
      }
      if (ds.active) {
        ds.t -= dt;
        if (ds.t <= 0) { ds.t = 0; ds.active = false; }
        const phase = 1 - ds.t;
        let dim;
        if (phase < 0.15) dim = (phase / 0.15) * 0.3;
        else if (phase > 0.85) dim = ((1 - phase) / 0.15) * 0.3;
        else dim = 0.3;
        ds.opacity = dim;
      } else {
        ds.opacity = Math.max(0, ds.opacity - dt * 4);
      }
      if (dimRef.current) {
        dimRef.current.style.opacity = `${ds.opacity}`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      <div
        ref={dimRef}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: '#000',
          opacity: 0,
          pointerEvents: 'none',
          willChange: 'opacity',
        }}
      />

      <a
        ref={ballRef}
        href="https://open.spotify.com/playlist/3XcH3vUyfbsQqIwvEsTllX"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Música para inspirarse"
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        onTouchStart={() => setShowLabel(true)}
        onTouchEnd={() => setTimeout(() => setShowLabel(false), 2500)}
        style={{
          position: 'fixed',
          top: 0,
          right: `${RIGHT_OFFSET}px`,
          zIndex: 9999,
          pointerEvents: 'auto',
          width: `${BALL_SIZE}px`,
          height: `${BALL_SIZE}px`,
          transformOrigin: 'center',
          willChange: 'transform',
          textDecoration: 'none',
        }}
      >
        {/* Glow halo at climax */}
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            inset: '-60%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.5) 35%, transparent 70%)',
            opacity: 0,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
          }}
        />

        {/* Disco sphere */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 3px 12px rgba(0,0,0,0.22)',
          }}
        >
          {/* Rotating SVG mirror-tile grid */}
          <div
            ref={facetRef}
            style={{
              position: 'absolute',
              inset: '-30%',
              willChange: 'transform',
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 80 80"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              {/* Tiles */}
              {TILES.map(({ x, y, ci }, i) => (
                <rect
                  key={i}
                  x={x + 0.15}
                  y={y + 0.15}
                  width="5.4"
                  height="5.4"
                  rx="0.3"
                  fill={TILE_COLORS[ci]}
                />
              ))}
              {/* Grid lines */}
              {Array.from({ length: ROWS + 1 }, (_, i) => (
                <line
                  key={`h${i}`}
                  x1="0" y1={i * STEP}
                  x2={COLS * STEP} y2={i * STEP}
                  stroke="rgba(0,0,0,0.20)"
                  strokeWidth="0.35"
                />
              ))}
              {Array.from({ length: COLS + 1 }, (_, i) => (
                <line
                  key={`v${i}`}
                  x1={i * STEP} y1="0"
                  x2={i * STEP} y2={ROWS * STEP}
                  stroke="rgba(0,0,0,0.20)"
                  strokeWidth="0.35"
                />
              ))}
            </svg>
          </div>

          {/* Spherical shading — darkens edges */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.04) 38%, rgba(80,95,115,0.36) 72%, rgba(30,38,55,0.60) 100%)',
              mixBlendMode: 'multiply',
            }}
          />

          {/* Specular highlight */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 32% 24%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.18) 14%, transparent 28%)',
            }}
          />
        </div>

        {/* Twinkling star sparkles */}
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-1px',
            animation: 'disco-sparkle 1.8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        >
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"
            fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
        </svg>
        <svg
          width="9" height="9" viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            top: '7px',
            right: '4px',
            animation: 'disco-sparkle 1.4s ease-in-out infinite 0.5s',
            pointerEvents: 'none',
          }}
        >
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z"
            fill="#E0F2FE" stroke="#CBD5E1" strokeWidth="0.5" />
        </svg>

        {/* Hover label */}
        <span
          style={{
            position: 'absolute',
            right: 'calc(100% + 12px)',
            top: '50%',
            transform: 'translateY(-50%)',
            whiteSpace: 'nowrap',
            fontSize: '11px',
            letterSpacing: '0.04em',
            color: 'rgba(10,10,10,0.78)',
            background: 'rgba(255,255,255,0.94)',
            padding: '5px 10px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            opacity: showLabel ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
            fontFamily: 'Inter, Helvetica Neue, Arial, sans-serif',
          }}
        >
          Música para inspirarse ↗
        </span>
      </a>
    </>
  );
}
