/** `PW_DEV=1` tests the dev server; otherwise a production build via `vite preview`. */
export const USE_DEV_SERVER = Boolean(process.env.PW_DEV);
export const BASE_URL = USE_DEV_SERVER ? 'http://localhost:5173' : 'http://localhost:4173';
