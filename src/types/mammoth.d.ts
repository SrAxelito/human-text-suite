declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface MammothOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }

  export function extractRawText(input: MammothOptions): Promise<MammothResult>;
  export function convertToHtml(input: MammothOptions): Promise<MammothResult>;
  export function convertToMarkdown(input: MammothOptions): Promise<MammothResult>;
}
