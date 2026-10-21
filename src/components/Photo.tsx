import { useState } from 'react';
import { unsplash } from '../data/images';

interface PhotoProps {
  id: string;
  alt: string;
  w: number;
  h: number;
  className?: string;
  eager?: boolean;
  style?: React.CSSProperties;
}

/** A fixed-ratio photograph. Falls back to a flat tone if the image cannot load. */
export function Photo({ id, alt, w, h, className, eager, style }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div role={alt ? 'img' : undefined} aria-label={alt || undefined} className={className} style={{ background: 'var(--control)', aspectRatio: `${w} / ${h}`, ...style }} />;
  }
  return (
    <img
      src={unsplash(id, w, h)}
      srcSet={`${unsplash(id, w, h)} 1x, ${unsplash(id, w * 2, h * 2)} 2x`}
      alt={alt}
      width={w}
      height={h}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      style={{ objectFit: 'cover', ...style }}
      onError={() => setFailed(true)}
    />
  );
}
