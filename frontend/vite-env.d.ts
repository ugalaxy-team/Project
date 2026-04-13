interface ViteTypeOptions {
    strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_SOCKETIO_SERVER_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}