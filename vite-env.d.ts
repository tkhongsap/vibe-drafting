/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly GEMINI_API_KEY: string;
  }
}

declare const process: {
  env: {
    API_KEY: string;
    GEMINI_API_KEY: string;
  }
};
