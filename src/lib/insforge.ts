
import { createClient } from '@insforge/sdk';

const url = import.meta.env.VITE_INSFORGE_URL;
const key = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!url || !key) {
    throw new Error('Missing InsForge environment variables');
}

export const insforge = createClient({
    baseUrl: url,
    anonKey: key
});
