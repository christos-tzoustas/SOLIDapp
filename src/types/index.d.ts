export {};

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }

  interface Window {
    requestFileSystem: any;
    webkitRequestFileSystem: any;
  }
}
