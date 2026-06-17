/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BMC_USERNAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
