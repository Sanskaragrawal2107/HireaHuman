
import { createClient } from '@insforge/sdk';

const url = import.meta.env.VITE_INSFORGE_BASE_URL || import.meta.env.VITE_INSFORGE_URL;
const key = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!url || !key) {
    throw new Error('Missing InsForge environment variables. Please ensure VITE_INSFORGE_BASE_URL and VITE_INSFORGE_ANON_KEY are set in your .env file.');
}

export const insforge = createClient({
    baseUrl: url,
    anonKey: key
});
