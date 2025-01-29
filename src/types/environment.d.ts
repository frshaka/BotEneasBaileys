declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT: string;
      DATABASE_URL: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};