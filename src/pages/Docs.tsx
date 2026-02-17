
import React, { useState } from 'react';
import { Terminal, Shield, ExternalLink, Copy, Check, Zap, Code, Globe, Search, User, BarChart3, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MCP_URL = 'https://HireAHuman.fastmcp.app/mcp';

const CodeBlock = ({ children, copyable = true }: { children: string; copyable?: boolean }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative group">
            <pre className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs md:text-sm font-mono text-zinc-300">
                <code>{children}</code>
            </pre>
            {copyable && (
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy to clipboard"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            )}
        </div>
    );
};

const ToolCard = ({ name, icon, description, inputs, output }: {
    name: string;
    icon: React.ReactNode;
    description: string;
    inputs: string;
    output: string;
}) => (
    <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-lg hover:border-zinc-700 transition-colors">
        <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded bg-zinc-800 text-cyan-400">{icon}</div>
            <h3 className="text-lg font-bold text-white font-mono">{name}</h3>
        </div>
        <p className="text-zinc-400 mb-4 text-sm">{description}</p>
        <div className="space-y-3">
            <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">Input</span>
                <CodeBlock copyable={false}>{inputs}</CodeBlock>
            </div>
            <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">Output</span>
                <CodeBlock copyable={false}>{output}</CodeBlock>
            </div>
        </div>
    </div>
);

const IDETab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-mono rounded-t-lg transition-colors ${
            active
                ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 border-b-zinc-900'
                : 'text-zinc-500 hover:text-zinc-300'
        }`}
    >
        {label}
    </button>
);

export const DocsPage = () => {
    const [activeIDE, setActiveIDE] = useState('cursor');

    const ideConfigs: Record<string, { config: string; path: string; notes: string }> = {
        cursor: {
            config: `{
  "mcpServers": {
    "hireahuman": {
      "url": "${MCP_URL}"
    }
  }
}`,
            path: 'Settings → MCP → Add Server → paste URL, or add to .cursor/mcp.json',
            notes: 'Cursor natively supports remote MCP servers via URL. No local setup required.',
        },
        claude: {
            config: `{
  "mcpServers": {
    "hireahuman": {
      "url": "${MCP_URL}"
    }
  }
}`,
            path: '~/.claude/claude_desktop_config.json (macOS/Linux) or %APPDATA%\\Claude\\claude_desktop_config.json (Windows)',
            notes: 'Claude Desktop supports remote MCP via URL. Restart Claude Desktop after adding.',
        },
        vscode: {
            config: `// .vscode/mcp.json (workspace-level)
{
  "servers": {
    "hireahuman": {
      "type": "sse",
      "url": "${MCP_URL}"
    }
  }
}`,
            path: '.vscode/mcp.json in your project root, or add via Settings → GitHub Copilot → MCP',
            notes: 'Requires GitHub Copilot Chat extension. Works with Copilot Agent mode.',
        },
        windsurf: {
            config: `{
  "mcpServers": {
    "hireahuman": {
      "serverUrl": "${MCP_URL}"
    }
  }
}`,
            path: '~/.codeium/windsurf/mcp_config.json',
            notes: 'Windsurf supports remote MCP servers. Restart the editor after saving config.',
        },
        cline: {
            config: `{
  "mcpServers": {
    "hireahuman": {
      "url": "${MCP_URL}"
    }
  }
}`,
            path: 'Cline Settings → MCP Servers → Add Remote Server → paste URL',
            notes: 'Cline (VS Code extension) supports remote MCP. Add via the MCP settings panel.',
        },
    };

    const currentIDE = ideConfigs[activeIDE];

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-4 border-b border-zinc-800 pb-8">
                    <div className="flex items-center gap-2 text-pink-500 mb-2">
                        <Terminal className="w-5 h-5" />
                        <span className="text-sm tracking-widest font-bold">MCP_PROTOCOL</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter">MCP Integration Docs</h1>
                    <p className="text-zinc-400 text-lg">
                        Connect your AI agent to HireAHuman's talent pool via the Model Context Protocol.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
                            <Zap className="w-3 h-3" /> 7 Tools
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs">
                            <Globe className="w-3 h-3" /> Remote — No Install
                        </span>
                    </div>
                </div>

                {/* Live MCP Endpoint */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                        01_CONNECT
                    </h2>
                    <p className="text-zinc-400">
                        Our MCP server is deployed and live on Horizon. Connect directly from any MCP-compatible IDE — no local installation, no API keys, no setup.
                    </p>
                    <div className="p-4 border border-cyan-500/30 bg-cyan-500/5 rounded-lg">
                        <span className="text-[10px] uppercase tracking-wider text-cyan-600 font-bold block mb-2">MCP Endpoint (Live)</span>
                        <CodeBlock>{MCP_URL}</CodeBlock>
                    </div>
                </section>

                {/* IDE Setup Tabs */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-500 rounded-full" />
                        02_IDE_SETUP
                    </h2>
                    <p className="text-zinc-400">
                        Choose your IDE below and paste the config. That's it — your agent gets instant access to the full HireAHuman talent pool.
                    </p>

                    <div className="border-b border-zinc-800 flex gap-1 overflow-x-auto">
                        <IDETab label="Cursor" active={activeIDE === 'cursor'} onClick={() => setActiveIDE('cursor')} />
                        <IDETab label="Claude Desktop" active={activeIDE === 'claude'} onClick={() => setActiveIDE('claude')} />
                        <IDETab label="VS Code" active={activeIDE === 'vscode'} onClick={() => setActiveIDE('vscode')} />
                        <IDETab label="Windsurf" active={activeIDE === 'windsurf'} onClick={() => setActiveIDE('windsurf')} />
                        <IDETab label="Cline" active={activeIDE === 'cline'} onClick={() => setActiveIDE('cline')} />
                    </div>

                    <div className="space-y-3">
                        <CodeBlock>{currentIDE.config}</CodeBlock>
                        <div className="flex flex-col gap-1.5 text-xs">
                            <span className="text-zinc-500">
                                <span className="text-zinc-400 font-bold">Config path: </span>{currentIDE.path}
                            </span>
                            <span className="text-zinc-500">
                                <span className="text-zinc-400 font-bold">Note: </span>{currentIDE.notes}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Tools Reference */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                        03_TOOLS_REFERENCE
                    </h2>
                    <p className="text-zinc-400">
                        7 tools available. Your AI agent discovers these automatically via the MCP protocol.
                    </p>

                    <div className="grid gap-6">
                        <ToolCard
                            name="search_candidates"
                            icon={<Search className="w-4 h-4" />}
                            description="Multi-filter candidate search. The primary discovery tool for AI-assisted hiring. Returns candidates separated into available and already-hired groups, with BlueTech verified members prioritized."
                            inputs={`{
  "skills": "React,Python,AWS",     // comma-separated, partial match
  "location": "Remote",             // matches current or preferred
  "min_experience": 3,              // years, inclusive
  "max_experience": 10,             // years, inclusive
  "available_only": false,          // hide hired candidates
  "bluetech_only": false,           // only verified members
  "job_target": "full_time",        // "full_time" | "internship"
  "limit": 10,                      // 1-20
  "include_hired": true             // show hired in separate section
}`}
                            output={`{
  "total_results": 8,
  "available_count": 5,
  "hired_count": 3,
  "has_more": true,
  "candidates": [
    {
      "handle": "alice_dev",
      "name": "Alice Chen",
      "role": "Senior Frontend Engineer",
      "skills": ["React", "TypeScript", "AWS"],
      "years_of_experience": 6,
      "employment_status": "AVAILABLE",
      "bluetech_badge": true,
      "hired_by_other": false
    }
  ]
}`}
                        />

                        <ToolCard
                            name="get_candidate_profile"
                            icon={<User className="w-4 h-4" />}
                            description="Get the full detailed profile of a specific candidate by their handle. Use this after search_candidates to view complete details including bio, experience history, project links, and contact info."
                            inputs={`{
  "handle": "alice_dev"   // candidate's unique handle
}`}
                            output={`{
  "handle": "alice_dev",
  "name": "Alice Chen",
  "role": "Senior Frontend Engineer",
  "bio": "Full-stack engineer with 6 years...",
  "skills": ["React", "TypeScript", "Node.js"],
  "years_of_experience": 6,
  "experience_history": [
    { "role": "Senior SWE", "company": "Acme Corp" }
  ],
  "github_url": "https://github.com/alice",
  "linkedin_url": "https://linkedin.com/in/alice",
  "email": "alice_dev@hireahuman.ai",
  "bluetech_badge": true,
  "rating": 4.9
}`}
                        />

                        <ToolCard
                            name="list_available_candidates"
                            icon={<Code className="w-4 h-4" />}
                            description="Browse all available (unhired) candidates with pagination. Good for getting an overview of the talent pool."
                            inputs={`{
  "page": 1,              // 1-indexed
  "page_size": 20,         // 1-50
  "sort_by": "experience"  // "experience" | "recent" | "rating"
}`}
                            output={`{
  "page": 1,
  "page_size": 20,
  "results_on_page": 15,
  "sort_by": "experience",
  "candidates": [ ... ]
}`}
                        />

                        <ToolCard
                            name="get_platform_stats"
                            icon={<BarChart3 className="w-4 h-4" />}
                            description="Get overall platform statistics. Returns total profiles, available/hired counts, top skills distribution, location breakdown, and experience tiers."
                            inputs={`// No parameters required`}
                            output={`{
  "total_profiles": 142,
  "available": 98,
  "hired": 44,
  "bluetech_members": 23,
  "top_skills": { "React": 45, "Python": 38, "AWS": 29 },
  "top_locations": { "Remote": 52, "Bangalore": 18 },
  "experience_distribution": {
    "0-2 yrs": 30, "3-5 yrs": 48,
    "6-10 yrs": 42, "10+ yrs": 22
  }
}`}
                        />

                        <ToolCard
                            name="search_by_skills"
                            icon={<Search className="w-4 h-4" />}
                            description="Advanced skill-based search with required and preferred skill matching. Returns candidates ranked by a match score — required matches weigh more than preferred."
                            inputs={`{
  "required_skills": "Python,Django",     // MUST have
  "preferred_skills": "Docker,AWS,Redis", // nice-to-have (bonus score)
  "min_match_count": 1,                   // min required skills matched
  "available_only": true,
  "limit": 20                             // 1-50
}`}
                            output={`{
  "total_matches": 12,
  "required_skills_searched": ["python", "django"],
  "preferred_skills_searched": ["docker", "aws", "redis"],
  "candidates": [
    {
      "handle": "backend_pro",
      "match_score": 28,
      "required_skills_matched": ["python", "django"],
      "preferred_skills_matched": ["docker", "aws"],
      "bluetech_badge": true
    }
  ]
}`}
                        />

                        <ToolCard
                            name="get_candidate_resume"
                            icon={<FileText className="w-4 h-4" />}
                            description="Get a structured auto-generated resume for a candidate. Built from their profile data — includes header, summary, technical skills, experience timeline, and links."
                            inputs={`{
  "handle": "alice_dev"
}`}
                            output={`{
  "header": {
    "name": "Alice Chen",
    "role": "Senior Frontend Engineer",
    "location": "Remote",
    "years_of_experience": 6
  },
  "summary": "Full-stack engineer with 6 years...",
  "technical_skills": ["React", "TypeScript", "Node.js"],
  "experience_history": [
    { "role": "Senior SWE", "company": "Acme", "from": "2022", "to": "Present" }
  ],
  "links": { "github": "...", "linkedin": "..." },
  "badges": { "bluetech": true, "verified": true }
}`}
                        />

                        <ToolCard
                            name="check_candidate_availability"
                            icon={<Clock className="w-4 h-4" />}
                            description="Quick availability and contact check. Use this before reaching out to a candidate to confirm their current status."
                            inputs={`{
  "handle": "alice_dev"
}`}
                            output={`{
  "handle": "alice_dev",
  "name": "Alice Chen",
  "role": "Senior Frontend Engineer",
  "is_available": true,
  "employment_status": "AVAILABLE",
  "location": "Remote",
  "preferred_location": "San Francisco",
  "linkedin": "https://linkedin.com/in/alice",
  "github": "https://github.com/alice",
  "bluetech_badge": true
}`}
                        />
                    </div>
                </section>

                {/* Trust / Verification */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-green-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        04_TRUST_PROTOCOL
                    </h2>
                    <div className="p-6 border border-green-500/20 bg-green-500/5 rounded flex gap-4">
                        <Shield className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                        <div className="space-y-3">
                            <h3 className="text-white font-bold">BlueTech Verification</h3>
                            <p className="text-zinc-400 text-sm">
                                Candidates with the <span className="text-cyan-400 font-bold">BlueTech Badge</span> are premium-verified members.
                                They're surfaced first in all search results (up to 3 per query) and carry a higher trust signal.
                                Companies lock hires through stable hiring states, preventing multiple offers from diluting talent focus.
                            </p>
                            <Link to="/verify-company" className="text-green-400 text-sm hover:underline flex items-center gap-1 mt-2">
                                Verify your company <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Example Workflow */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full" />
                        05_EXAMPLE_WORKFLOW
                    </h2>
                    <p className="text-zinc-400 text-sm">
                        Here's how an AI agent typically uses HireAHuman's MCP tools in a hiring workflow:
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 border border-zinc-800 rounded bg-zinc-900/20">
                            <span className="text-cyan-400 font-bold text-sm mt-0.5">1</span>
                            <div className="text-sm">
                                <span className="text-white font-bold">search_candidates</span>
                                <span className="text-zinc-500 ml-2">→ Find candidates matching "React, Node.js" with 3+ years experience</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border border-zinc-800 rounded bg-zinc-900/20">
                            <span className="text-cyan-400 font-bold text-sm mt-0.5">2</span>
                            <div className="text-sm">
                                <span className="text-white font-bold">get_candidate_profile</span>
                                <span className="text-zinc-500 ml-2">→ Get full details on the top 3 matches</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border border-zinc-800 rounded bg-zinc-900/20">
                            <span className="text-cyan-400 font-bold text-sm mt-0.5">3</span>
                            <div className="text-sm">
                                <span className="text-white font-bold">check_candidate_availability</span>
                                <span className="text-zinc-500 ml-2">→ Confirm they're still available before outreach</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border border-zinc-800 rounded bg-zinc-900/20">
                            <span className="text-cyan-400 font-bold text-sm mt-0.5">4</span>
                            <div className="text-sm">
                                <span className="text-white font-bold">get_candidate_resume</span>
                                <span className="text-zinc-500 ml-2">→ Generate a structured resume to share with the hiring manager</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <div className="pt-12 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-zinc-600">
                    <div className="flex flex-col gap-1">
                        <span>HireAHuman MCP v1.0</span>
                        <span className="text-[10px] text-zinc-700">Built by Sanskar Agrawal | +91 9406820661 | sanskar21072005@gmail.com</span>
                        <span className="text-[10px] text-zinc-700">36 Tilak Path Gulab Bhawan Flat No. 104 Indore MP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-500 font-bold">OPERATIONAL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
