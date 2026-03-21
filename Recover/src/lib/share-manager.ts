/**
 * Share Manager
 * Handles generating and sharing milestone cards and progress
 */

import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { toast } from 'sonner';

export type ShareCardType =
  | 'milestone'
  | 'badge'
  | 'stats'
  | 'money-saved'
  | 'quote'
  | 'custom';

export interface ShareData {
  type: ShareCardType;
  title: string;
  description?: string;
  primaryValue?: string;
  secondaryValue?: string;
  emoji?: string;
  backgroundColor?: string;
  includeWatermark?: boolean;
}

/**
 * Check if native sharing is supported
 */
export async function canShare(): Promise<boolean> {
  try {
    const result = await Share.canShare();
    return result.value;
  } catch {
    // Fallback for web
    return navigator.share !== undefined;
  }
}

/**
 * Generate image from HTML element
 */
export async function generateCardImage(element: HTMLElement): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // Higher quality
      logging: false,
      useCORS: true
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error generating card image:', error);
    toast.error('Failed to generate share image');
    return null;
  }
}

/**
 * Share using native share API
 */
export async function shareCard(
  blob: Blob,
  title: string,
  text?: string
): Promise<boolean> {
  try {
    // Try Capacitor Share API first (for mobile)
    if (await canShare()) {
      try {
        // Convert blob to base64 for Capacitor
        const base64 = await blobToBase64(blob);

        await Share.share({
          title,
          text: text || title,
          url: base64,
          dialogTitle: 'Share Your Progress'
        });

        return true;
      } catch (capacitorError) {
        // Fallback to Web Share API
        if (navigator.share) {
          const file = new File([blob], 'milestone.png', { type: 'image/png' });

          await navigator.share({
            title,
            text: text || title,
            files: [file]
          });

          return true;
        }
      }
    }

    // Fallback: Download the image
    downloadBlob(blob, 'recovery-milestone.png');
    toast.success('Image downloaded! Share it from your downloads.');
    return true;

  } catch (error) {
    console.error('Error sharing:', error);

    // Last resort: Download
    try {
      downloadBlob(blob, 'recovery-milestone.png');
      toast.info('Image downloaded to your device');
      return true;
    } catch {
      toast.error('Failed to share or download image');
      return false;
    }
  }
}

/**
 * Convert Blob to Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Quick share for text-only content
 */
export async function shareText(title: string, text: string, url?: string): Promise<boolean> {
  try {
    if (await canShare()) {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share Your Progress'
      });
      return true;
    }

    // Fallback: Copy to clipboard
    if (navigator.clipboard) {
      const shareText = `${title}\n\n${text}${url ? `\n${url}` : ''}`;
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
      return true;
    }

    toast.error('Sharing not supported on this device');
    return false;
  } catch (error) {
    console.error('Error sharing text:', error);
    toast.error('Failed to share');
    return false;
  }
}

/**
 * Share milestone achievement
 */
export async function shareMilestone(
  days: number,
  milestoneText: string
): Promise<boolean> {
  const title = `${days} Days Sober! 🎉`;
  const text = `I've reached ${days} days of sobriety! ${milestoneText}\n\nOne day at a time. 💪`;

  return shareText(title, text);
}

/**
 * Share badge achievement
 */
export async function shareBadge(
  badgeName: string,
  badgeDescription: string
): Promise<boolean> {
  const title = `Badge Unlocked: ${badgeName}! 🏆`;
  const text = `I just unlocked "${badgeName}" in my recovery journey!\n\n${badgeDescription}\n\nRecover App 💪`;

  return shareText(title, text);
}

/**
 * Share quote
 */
export async function shareQuote(
  quoteText: string,
  author?: string
): Promise<boolean> {
  const title = 'Daily Inspiration';
  const text = author
    ? `"${quoteText}"\n\n— ${author}\n\nRecover 💪`
    : `"${quoteText}"\n\nRecover 💪`;

  return shareText(title, text);
}
