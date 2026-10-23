declare module 'next' {
  export interface NextConfig {
    [key: string]: any;
  }
  export interface Metadata {
    title?: string | { default: string; template: string };
    description?: string;
    keywords?: string[];
    authors?: { name: string; url?: string }[];
    [key: string]: any;
  }
  export interface Viewport {
    width?: string | number;
    initialScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    themeColor?: string;
    [key: string]: any;
  }
}

declare module 'next/server' {
  export class NextRequest extends Request {
    readonly nextUrl: URL;
  }
  export class NextResponse extends Response {
    static json<T = any>(body: T, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
}
