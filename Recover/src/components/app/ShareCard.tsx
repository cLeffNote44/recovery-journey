import { forwardRef } from 'react';
import type { ShareData } from '@/lib/share-manager';

interface ShareCardProps {
  data: ShareData;
}

/**
 * ShareCard Component
 * Renders a beautiful card optimized for sharing as an image
 * Use with html2canvas to generate shareable images
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ data }, ref) => {
  const {
    type,
    title,
    description,
    primaryValue,
    secondaryValue,
    emoji,
    backgroundColor = 'from-slate-600 to-gray-700',
    includeWatermark = true
  } = data;

  return (
    <div
      ref={ref}
      className={`relative w-[600px] h-[600px] bg-gradient-to-br ${backgroundColor} p-12 flex flex-col justify-between overflow-hidden`}
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
        {/* Emoji */}
        {emoji && (
          <div className="text-9xl mb-8 drop-shadow-lg">
            {emoji}
          </div>
        )}

        {/* Primary Value (Large Number/Text) */}
        {primaryValue && (
          <div className="text-white mb-6">
            <div className="text-8xl font-black leading-none drop-shadow-lg">
              {primaryValue}
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-white text-5xl font-bold mb-4 drop-shadow-lg leading-tight">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-white text-2xl font-medium opacity-95 drop-shadow max-w-lg">
            {description}
          </p>
        )}

        {/* Secondary Value */}
        {secondaryValue && (
          <div className="text-white text-xl font-semibold mt-6 opacity-90 drop-shadow">
            {secondaryValue}
          </div>
        )}
      </div>

      {/* Watermark */}
      {includeWatermark && (
        <div className="relative z-10 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-4xl">💪</div>
            <div className="text-2xl font-bold drop-shadow">Recover</div>
          </div>
          <div className="text-lg opacity-90 drop-shadow">
            One day at a time
          </div>
        </div>
      )}
    </div>
  );
});

ShareCard.displayName = 'ShareCard';
