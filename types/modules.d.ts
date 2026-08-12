// Module declarations for packages that lack @types definitions

declare module 'speakeasy' {
  interface GenerateSecretOptions {
    name?: string;
    issuer?: string;
    length?: number;
    symbols?: boolean;
  }

  interface Secret {
    ascii: string;
    base32: string;
    hex: string;
    otpauth_url?: string;
  }

  interface TOTPVerifyOptions {
    secret: string;
    encoding?: 'ascii' | 'hex' | 'base32';
    token: string;
    window?: number;
  }

  export function generateSecret(options?: GenerateSecretOptions): Secret;

  export const totp: {
    verify(options: TOTPVerifyOptions): boolean;
    generate(options: { secret: string; encoding?: string }): string;
  };
}

declare module 'qrcode' {
  export function toDataURL(text: string, options?: Record<string, unknown>): Promise<string>;
  export function toString(text: string, options?: Record<string, unknown>): Promise<string>;
}
