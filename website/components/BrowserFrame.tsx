import Image from 'next/image';

interface BrowserFrameProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function BrowserFrame({
  src,
  alt,
  width = 1440,
  height = 900,
  className = '',
}: BrowserFrameProps) {
  return (
    <div className={`w-full ${className}`} style={{ maxWidth: 800 }}>
      <div className="rounded-xl bg-gray-900 shadow-2xl shadow-black/40 border border-gray-700/60 overflow-hidden">
        {/* Browser chrome bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border-b border-gray-700/50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-6 rounded-md bg-gray-700/60 max-w-md mx-auto flex items-center justify-center">
              <span className="text-[10px] text-gray-400 tracking-wide">
                recovery-journey.app
              </span>
            </div>
          </div>
        </div>
        {/* Screenshot */}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
