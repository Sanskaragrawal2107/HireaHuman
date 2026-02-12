
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export const NotFoundPage = () => {
    return (
        <Layout>
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
                <Terminal className="w-16 h-16 text-zinc-700 mb-6" />
                <h1 className="text-4xl font-bold font-mono tracking-tighter mb-4 text-white">
                    404_PAGE_NOT_FOUND
                </h1>
                <p className="text-zinc-500 mb-8 max-w-md font-mono text-sm">
                    The requested emotional resource or neural pathway does not exist.
                    Please return to the main interface.
                </p>
                <Link
                    to="/"
                    className="px-6 py-2 bg-white text-black font-bold text-xs tracking-widest uppercase hover:bg-cyan-500 transition-colors font-mono"
                >
                    Return Home
                </Link>
            </div>
        </Layout>
    );
};
