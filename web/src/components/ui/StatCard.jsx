import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const colorMap = {
  primary: {
    bg: 'var(--blue-50)',
    iconBg: 'var(--blue-100)',
    iconColor: 'var(--blue-600)',
    accent: 'var(--blue-600)',
    glow: 'rgba(37,99,235,0.12)',
  },
  green: {
    bg: 'var(--emerald-50)',
    iconBg: 'var(--emerald-100)',
    iconColor: 'var(--emerald-500)',
    accent: 'var(--emerald-500)',
    glow: 'rgba(16,185,129,0.12)',
  },
  amber: {
    bg: 'var(--amber-50)',
    iconBg: 'var(--amber-100)',
    iconColor: 'var(--amber-500)',
    accent: 'var(--amber-500)',
    glow: 'rgba(245,158,11,0.12)',
  },
  violet: {
    bg: 'var(--violet-50)',
    iconBg: 'var(--violet-100)',
    iconColor: 'var(--violet-500)',
    accent: 'var(--violet-500)',
    glow: 'rgba(139,92,246,0.12)',
  },
  rose: {
    bg: 'var(--rose-50)',
    iconBg: 'var(--rose-100)',
    iconColor: 'var(--rose-500)',
    accent: 'var(--rose-500)',
    glow: 'rgba(244,63,94,0.12)',
  },
  orange: {
    bg: '#fff7ed',
    iconBg: '#ffedd5',
    iconColor: '#f97316',
    accent: '#f97316',
    glow: 'rgba(249,115,22,0.12)',
  },
  blue: {
    bg: 'var(--blue-50)',
    iconBg: 'var(--blue-100)',
    iconColor: 'var(--blue-600)',
    accent: 'var(--blue-600)',
    glow: 'rgba(37,99,235,0.12)',
  },
  red: {
    bg: 'var(--rose-50)',
    iconBg: 'var(--rose-100)',
    iconColor: 'var(--rose-500)',
    accent: 'var(--rose-500)',
    glow: 'rgba(244,63,94,0.12)',
  },
  purple: {
    bg: 'var(--violet-50)',
    iconBg: 'var(--violet-100)',
    iconColor: 'var(--violet-500)',
    accent: 'var(--violet-500)',
    glow: 'rgba(139,92,246,0.12)',
  },
};

export default function StatCard({
  title, value, icon: Icon, color = 'primary', subtitle, trend, trendValue,
}) {
  const c = colorMap[color] || colorMap.primary;
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const trendIcon = trend === 'up'
    ? <TrendingUp size={11} />
    : trend === 'down'
    ? <TrendingDown size={11} />
    : <Minus size={11} />;

  const trendColor = trend === 'up' ? 'var(--emerald-500)' : trend === 'down' ? 'var(--rose-500)' : 'var(--slate-400)';
  const trendBg   = trend === 'up' ? 'var(--emerald-50)' : trend === 'down' ? 'var(--rose-50)' : 'var(--slate-100)';

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid ${hovered ? c.accent + '30' : 'var(--slate-200)'}`,
        padding: '1.25rem 1.375rem',
        boxShadow: hovered ? `0 8px 24px ${c.glow}, var(--shadow-sm)` : 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 220ms cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        opacity: visible ? 1 : 0,
        animation: visible ? 'fadeUp 0.4s ease both' : 'none',
      }}
    >
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 96, height: 96,
        background: `radial-gradient(circle at 100% 0%, ${c.glow} 0%, transparent 70%)`,
        pointerEvents: 'none',
        transition: 'opacity 220ms',
        opacity: hovered ? 1 : 0.6,
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40,
          background: c.iconBg,
          borderRadius: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          flexShrink: 0,
        }}>
          <Icon size={19} style={{ color: c.iconColor }} />
        </div>

        {/* Trend badge */}
        {trendValue && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '0.1875rem 0.5rem',
            borderRadius: 999,
            background: trendBg,
            color: trendColor,
            fontSize: '0.6875rem',
            fontWeight: 700,
          }}>
            {trendIcon}
            {trendValue}
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '1.625rem',
        color: 'var(--slate-900)',
        lineHeight: 1.15,
        letterSpacing: '-0.03em',
        marginBottom: '0.25rem',
        transition: 'transform 220ms',
        transform: hovered ? 'translateX(2px)' : 'translateX(0)',
      }}>
        {value}
      </div>

      {/* Title */}
      <div style={{
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: 'var(--slate-500)',
        lineHeight: 1.4,
      }}>
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 2 }}>
          {subtitle}
        </div>
      )}

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: 3,
        width: hovered ? '100%' : '0%',
        background: `linear-gradient(90deg, ${c.accent}, transparent)`,
        transition: 'width 300ms ease',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      }} />
    </div>
  );
}
