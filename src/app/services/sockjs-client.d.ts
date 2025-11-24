declare module 'sockjs-client' {
  export default class SockJS {
    constructor(url: string, _reserved?: any, options?: any);
    close(code?: number, reason?: string): void;
    send(data: string): void;
    onopen: ((ev: Event) => any) | null;
    onmessage: ((ev: MessageEvent) => any) | null;
    onclose: ((ev: CloseEvent) => any) | null;
    onerror: ((ev: Event) => any) | null;
    readyState: number;
    url: string;
    protocol: string;
    extensions: string;
    bufferedAmount: number;
    binaryType: string;
  }
}
