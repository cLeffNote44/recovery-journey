/// <reference types="vite/client" />

// Type declarations for JSX
declare namespace JSX {
  type Element = React.ReactElement<any, any> | null;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Type declarations for @capacitor/share (if not installed)
declare module '@capacitor/share' {
  export interface ShareOptions {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
    files?: string[];
  }

  export interface ShareResult {
    activityType?: string;
  }

  export interface SharePlugin {
    share(options: ShareOptions): Promise<ShareResult>;
    canShare(): Promise<{ value: boolean }>;
  }

  export const Share: SharePlugin;
}
