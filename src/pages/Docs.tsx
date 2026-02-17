
import React from 'react';
import { Terminal, Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs md:text-sm font-mono text-zinc-300">
        <code>{children}</code>
    </pre>
);

export const DocsPage = () => {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-4 border-b border-zinc-800 pb-8">
                    <div className="flex items-center gap-2 text-pink-500 mb-2">
                        <Terminal className="w-5 h-5" />
                        <span className="text-sm tracking-widest font-bold">DEVELOPER_NEXUS</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter">Integration Documentation</h1>
                    <p className="text-zinc-500 text-lg">
                        Standardize human emotion into a programmable API resource.
                    </p>
                </div>

                {/* Quick Start */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                        01_MCP_SERVER_SETUP
                    </h2>
                    <p className="text-zinc-400">
                        The easiest way to give your agent access to HireAHuman resources is via our Model Context Protocol (MCP) server.
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-white font-bold">Configuration (Claude Desktop / Cursor)</h3>
                        <CodeBlock>
                            {`{
  "mcpServers": {
    "hireahuman": {
      "command": "python",
      "args": ["server.py"],
      "cwd": "/path/to/hireahuman-mcp"
    }
  }
}`}
                        </CodeBlock>
                        <p className="text-xs text-zinc-500">* Requires Python 3.10+</p>
                    </div>
                </section>

                {/* API Reference */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-pink-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full" />
                        02_CORE_TOOLS
                    </h2>

                    <div className="grid gap-6">
                        <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded">
                            <h3 className="text-lg font-bold text-white mb-2 font-mono">search_candidates</h3>
                            <p className="text-zinc-500 mb-4 text-sm">Query the talent database for verified professionals.</p>
                            <CodeBlock>
                                {`Input: {
  "skills": "string (comma separated)",
  "min_experience": "number",
  "location": "string"
}

Output: {
  "candidates": [
    { "handle": "dev_lyla", "role": "Senior Frontend", "skills": ["React", "TS"] }
  ]
}`}
                            </CodeBlock>
                        </div>

                        <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded">
                            <h3 className="text-lg font-bold text-white mb-2 font-mono">get_candidate_profile</h3>
                            <p className="text-zinc-500 mb-4 text-sm">Retrieve full structured verification data.</p>
                            <CodeBlock>
                                {`Input: {
  "handle": "dev_lyla"
}

Output: {
  "profile": {
    "name": "Lyla Chen",
    "verified_history": [...],
    "contact": "..."
  }
}`}
                            </CodeBlock>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-green-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        03_TRUST_SIGNAL_PROTOCOL
                    </h2>
                    <div className="p-6 border border-green-500/20 bg-green-500/5 rounded flex gap-4">
                        <Shield className="w-8 h-8 text-green-500 flex-shrink-0" />
                        <div className="space-y-2">
                            <h3 className="text-white font-bold">Verified Expertise</h3>
                            <p className="text-zinc-400 text-sm">
                                Every profile is anchored by our verification engine. Companies lock hires through
                                stable hiring states, preventing multiple offers from diluting talent focus.
                            </p>
                            <Link to="/verify" className="text-green-400 text-sm hover:underline flex items-center gap-1 mt-2">
                                Learn about Company Verification <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="pt-12 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-600">
                    <div className="flex flex-col gap-1">
                        <span>HireAHuman API v1.2.0</span>
                        <span className="text-[10px] text-zinc-700">Built by Sanskar Agrawal | +91 9406820661</span>
                    </div>

                    <span>Status: <span className="text-green-500">OPERATIONAL</span></span>
                </div>
            </div>
        </div>
    );
};
