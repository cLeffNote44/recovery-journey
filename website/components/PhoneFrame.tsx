import Image from 'next/image';

interface PhoneFrameProps {
  src: string;
  alt: string;
  className?: string;
}

export function PhoneFrame({ src, alt, className = '' }: PhoneFrameProps) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ maxWidth: 280 }}
    >
      {/* Phone body */}
      <div className="rounded-[2.5rem] bg-gray-900 p-3 shadow-2xl shadow-black/40 border border-gray-700/60">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="rounded-[2rem] overflow-hidden bg-black">
          <Image
            src={src}
            alt={alt}
            width={390}
            height={844}
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
