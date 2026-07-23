/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOG?: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
