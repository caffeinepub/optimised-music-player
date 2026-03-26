function hashHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffff;
  return ((hash % 360) + 360) % 360;
}

interface PlaceholderArtProps {
  title: string;
  size?: number;
  className?: string;
}

export default function PlaceholderArt({
  title,
  size = 48,
  className = "",
}: PlaceholderArtProps) {
  const hue = hashHue(title);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={{ borderRadius: 4, flexShrink: 0 }}
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="48" height="48" fill={`hsl(${hue},45%,20%)`} />
      <path
        d="M30 12v16.5a5 5 0 1 1-2-4V16l-10 2v14.5a5 5 0 1 1-2-4V13.5L30 12z"
        fill={`hsl(${hue},60%,55%)`}
        opacity="0.9"
      />
    </svg>
  );
}
