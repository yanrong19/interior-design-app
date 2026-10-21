// The Roomwright mark: a room in plan with its door swing. Placeholder name; swap for the real brand.
export function Mark({ size = 24, inverse = false }: { size?: number; inverse?: boolean }) {
  const bg = inverse ? 'var(--paper)' : 'var(--ink)';
  const fg = inverse ? 'var(--ink)' : 'var(--paper)';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: 'none' }}>
      <rect width="32" height="32" fill={bg} />
      <path d="M8 8h16v16H8z" fill="none" stroke={fg} strokeWidth="2" />
      <path d="M8 18a6 6 0 0 1 6 6" fill="none" stroke={fg} strokeWidth="2" />
    </svg>
  );
}

export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 500, letterSpacing: '-0.01em' }}>
      <Mark size={22} inverse={inverse} />
      Roomwright
    </span>
  );
}
