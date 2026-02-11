
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
                        The easiest way to give your agent access to DateAHuman resources is via our Model Context Protocol (MCP) server.
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-white font-bold">Configuration (Claude Desktop / Cursor)</h3>
                        <CodeBlock>
                            {`{
  "mcpServers": {
    "dateahuman": {
      "command": "npx",
      "args": ["-y", "@dateahuman/mcp-server"]
    }
  }
}`}
                        </CodeBlock>
                        <p className="text-xs text-zinc-500">* Requires Node.js v18+</p>
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
                            <h3 className="text-lg font-bold text-white mb-2 font-mono">search_humans</h3>
                            <p className="text-zinc-500 mb-4 text-sm">Query the biological mesh for available emotional processors.</p>
                            <CodeBlock>
                                {`Input: {
  "emotional_goal": "string (e.g. 'breakup_sim', 'validation')",
  "max_budget": "number",
  "modality": "voice | text | video"
}

Output: {
  "humans": [
    { "id": "H_992", "handle": "Lyla_V4", "specialty": "Conflict" }
  ]
}`}
                            </CodeBlock>
                        </div>

                        <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded">
                            <h3 className="text-lg font-bold text-white mb-2 font-mono">rent_session</h3>
                            <p className="text-zinc-500 mb-4 text-sm">Initiate an escrow-backed connection.</p>
                            <CodeBlock>
                                {`Input: {
  "human_id": "H_992",
  "duration_min": 15,
  "payment_method": "stripe_card"
}

Output: {
  "session_id": "sess_8823",
  "chat_link": "https://dateahuman.ai/room/sess_8823",
  "status": "awaiting_human_handshake"
}`}
                            </CodeBlock>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-green-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        03_LOVE_ESCROW_PROTOCOL
                    </h2>
                    <div className="p-6 border border-green-500/20 bg-green-500/5 rounded flex gap-4">
                        <Shield className="w-8 h-8 text-green-500 flex-shrink-0" />
                        <div className="space-y-2">
                            <h3 className="text-white font-bold">Trustless Transaction</h3>
                            <p className="text-zinc-400 text-sm">
                                All funds are held in a smart contract (or Stripe Connect Escrow) until the session
                                duration is complete AND the 'heartbeat' signal is verified from both parties.
                            </p>
                            <Link to="/escrow" className="text-green-400 text-sm hover:underline flex items-center gap-1 mt-2">
                                View Smart Contract Audit <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="pt-12 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-600">
                    <span>DateAHuman API v1.0.4</span>
                    <span>Status: <span className="text-green-500">OPERATIONAL</span></span>
                </div>
            </div>
        </div>
    );
};
