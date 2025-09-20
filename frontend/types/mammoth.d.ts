declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: any[];
  }

  interface Options {
    buffer: Buffer;
  }

  export function extractRawText(options: Options): Promise<ExtractResult>;
} 