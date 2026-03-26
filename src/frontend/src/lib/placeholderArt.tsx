import { Music } from "lucide-react";

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const h = Math.abs(hash) % 360;
  const s = 40 + (Math.abs(hash >> 4) % 30);
  const l = 28 + (Math.abs(hash >> 8) % 18);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

interface PlaceholderArtProps {
  title: string;
  size?: number;
  className?: string;
}

export function PlaceholderArt({
  title,
  size = 48,
  className = "",
}: PlaceholderArtProps) {
  const bg = hashColor(title || "unknown");
  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 rounded-md ${className}`}
      style={{ width: size, height: size, background: bg }}
    >
      <Music
        style={{ width: size * 0.4, height: size * 0.4 }}
        className="text-white/80"
      />
    </div>
  );
}
