/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_SPEECH_SUBSCRIPTION_KEY: string
    readonly VITE_AZURE_OPENAI_API_KEY: string
    readonly VITE_AZURE_OPENAI_ENDPOINT: string
    readonly VITE_AZURE_OPENAI_DEPLOYMENT_NAME: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
