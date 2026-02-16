
import React, { useEffect, useState, useRef } from 'react';
import { insforge } from '../lib/insforge';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '../lib/logger';
import { sanitizeText, sanitizeUrl } from '../lib/sanitize';
import { Terminal, Save, User, Briefcase, Code, MapPin, Github, Linkedin, AlertCircle, Loader, Plus, X, Search, Globe, Sparkles, ChevronDown, FolderGit2, Target, ExternalLink } from 'lucide-react';

// ──────────────────────────────────────────────
// COMPREHENSIVE CURATED SKILLS DATABASE
// Organized by category, from latest/trending → established
// ──────────────────────────────────────────────
const SKILL_CATEGORIES: Record<string, string[]> = {
    "Languages": [
        "JavaScript", "TypeScript", "Python", "Rust", "Go", "Java", "C#", "C++", "C",
        "Kotlin", "Swift", "Dart", "Ruby", "PHP", "Scala", "Elixir", "Haskell",
        "Clojure", "Lua", "Perl", "R", "MATLAB", "Julia", "Zig", "Mojo",
        "Assembly", "COBOL", "Fortran", "Erlang", "F#", "OCaml", "Nim",
        "V", "Crystal", "Groovy", "Objective-C", "Shell", "Bash", "PowerShell",
        "Solidity", "Move", "Cairo", "WGSL", "GLSL", "SQL", "PL/SQL"
    ],
    "Frontend": [
        "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit",
        "Solid.js", "Qwik", "Astro", "Remix", "Gatsby", "HTML", "CSS",
        "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Ant Design",
        "Styled Components", "Emotion", "SASS/SCSS", "PostCSS", "Framer Motion",
        "GSAP", "Three.js", "D3.js", "Chart.js", "Storybook", "Vitest",
        "Cypress", "Playwright", "Puppeteer", "Webpack", "Vite", "Rollup",
        "esbuild", "Turbopack", "Parcel", "Bun", "jQuery", "Alpine.js",
        "HTMX", "Lit", "Web Components", "PWA", "Figma", "Responsive Design"
    ],
    "Backend": [
        "Node.js", "Express.js", "Fastify", "NestJS", "Hono", "Deno",
        "Django", "Flask", "FastAPI", "Spring Boot", "Spring", "Quarkus",
        "ASP.NET", "ASP.NET Core", "Ruby on Rails", "Laravel", "Symfony",
        "Phoenix", "Gin", "Echo", "Fiber", "Actix", "Rocket", "Axum",
        "gRPC", "GraphQL", "REST API", "WebSocket", "tRPC", "Prisma",
        "Drizzle ORM", "TypeORM", "Sequelize", "SQLAlchemy", "Hibernate",
        "Entity Framework", "Mongoose", "Redis", "RabbitMQ", "Kafka",
        "NATS", "Celery", "BullMQ", "Temporal", "Microservices", "Serverless",
        "API Design", "OAuth", "JWT", "SSO", "SAML"
    ],
    "Databases": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "MariaDB",
        "DynamoDB", "Cassandra", "CockroachDB", "ScyllaDB", "ClickHouse",
        "TimescaleDB", "InfluxDB", "Neo4j", "ArangoDB", "Supabase",
        "Firebase Firestore", "PlanetScale", "Neon", "Turso", "FaunaDB",
        "Elasticsearch", "OpenSearch", "Meilisearch", "Typesense", "Algolia",
        "Pinecone", "Weaviate", "Qdrant", "ChromaDB", "Milvus",
        "Oracle Database", "SQL Server", "DB2", "Snowflake", "BigQuery",
        "Redshift", "Druid", "Presto", "Trino"
    ],
    "DevOps & Infra": [
        "Docker", "Kubernetes", "Terraform", "Pulumi", "Ansible", "Chef", "Puppet",
        "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "ArgoCD", "Flux",
        "Helm", "Istio", "Envoy", "Traefik", "Nginx", "Caddy", "HAProxy",
        "Prometheus", "Grafana", "Datadog", "New Relic", "ELK Stack",
        "Vault", "Consul", "Nomad", "Packer", "Vagrant",
        "CI/CD", "Infrastructure as Code", "GitOps", "SRE",
        "Linux", "Unix", "Windows Server", "Networking", "Load Balancing",
        "Service Mesh", "Container Orchestration", "Monitoring", "Observability"
    ],
    "Cloud": [
        "AWS", "Azure", "Google Cloud", "DigitalOcean", "Vercel", "Netlify",
        "Cloudflare", "Fly.io", "Railway", "Render", "Heroku",
        "AWS Lambda", "AWS EC2", "AWS S3", "AWS ECS", "AWS EKS",
        "Azure Functions", "Azure DevOps", "Google Cloud Functions", "GKE",
        "Cloud Architecture", "Multi-Cloud", "Hybrid Cloud", "Edge Computing",
        "CloudFormation", "CDK", "Serverless Framework", "SAM",
        "Cloudflare Workers", "Durable Objects", "R2", "KV"
    ],
    "AI & ML": [
        "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
        "TensorFlow", "PyTorch", "Keras", "scikit-learn", "JAX", "Hugging Face",
        "LangChain", "LlamaIndex", "OpenAI API", "GPT", "Claude API",
        "Gemini API", "Stable Diffusion", "Midjourney", "DALL-E",
        "RAG", "Fine-tuning", "Prompt Engineering", "RLHF", "LoRA",
        "MLOps", "MLflow", "Weights & Biases", "Kubeflow", "BentoML",
        "ONNX", "TensorRT", "vLLM", "Triton", "Model Deployment",
        "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn",
        "Data Science", "Data Engineering", "Feature Engineering",
        "Reinforcement Learning", "Generative AI", "AI Agents", "MCP"
    ],
    "Mobile": [
        "React Native", "Flutter", "Swift", "SwiftUI", "Kotlin", "Jetpack Compose",
        "Expo", "Ionic", "Capacitor", "Xamarin", ".NET MAUI",
        "iOS Development", "Android Development", "Cross-Platform",
        "App Store Optimization", "Push Notifications", "Mobile CI/CD",
        "ARKit", "ARCore", "Core ML", "ML Kit", "Firebase",
        "Objective-C", "Java (Android)", "Wear OS", "watchOS", "tvOS"
    ],
    "Web3 & Blockchain": [
        "Solidity", "Rust (Solana)", "Move", "Cairo", "Vyper",
        "Ethereum", "Solana", "Polygon", "Arbitrum", "Optimism",
        "Hardhat", "Foundry", "Truffle", "Anchor", "OpenZeppelin",
        "Web3.js", "Ethers.js", "Viem", "Wagmi", "RainbowKit",
        "Smart Contracts", "DeFi", "NFT", "DAO", "Layer 2",
        "IPFS", "The Graph", "Chainlink", "Cross-chain", "ZK Proofs",
        "MEV", "Tokenomics", "Wallet Integration", "MetaMask"
    ],
    "Testing & QA": [
        "Jest", "Mocha", "Vitest", "Pytest", "JUnit", "TestNG",
        "Cypress", "Playwright", "Selenium", "Puppeteer", "Detox",
        "React Testing Library", "Enzyme", "Storybook",
        "TDD", "BDD", "E2E Testing", "Unit Testing", "Integration Testing",
        "Load Testing", "Performance Testing", "Security Testing",
        "k6", "Locust", "JMeter", "Gatling", "Artillery",
        "SonarQube", "CodeClimate", "Snyk", "OWASP",
        "API Testing", "Postman", "Insomnia", "Contract Testing"
    ],
    "Security": [
        "Cybersecurity", "Penetration Testing", "OWASP", "OAuth 2.0",
        "JWT", "SAML", "SSO", "MFA", "Zero Trust",
        "Encryption", "TLS/SSL", "PKI", "HSM",
        "SAST", "DAST", "IAST", "WAF", "SIEM",
        "SOC", "Incident Response", "Threat Modeling", "Bug Bounty",
        "Reverse Engineering", "Malware Analysis", "Forensics",
        "Network Security", "Cloud Security", "Application Security",
        "Identity & Access Management", "Compliance", "GDPR", "SOC 2"
    ],
    "Data Engineering": [
        "Apache Spark", "Apache Kafka", "Apache Flink", "Apache Beam",
        "Airflow", "dbt", "Dagster", "Prefect", "Luigi",
        "Snowflake", "BigQuery", "Redshift", "Databricks", "Delta Lake",
        "Apache Iceberg", "Apache Hudi", "Parquet", "Avro",
        "ETL", "ELT", "Data Pipelines", "Data Warehousing", "Data Lakes",
        "Data Modeling", "Data Governance", "Data Quality",
        "Stream Processing", "Batch Processing", "CDC",
        "Fivetran", "Airbyte", "Stitch", "Meltano"
    ],
    "Game Development": [
        "Unity", "Unreal Engine", "Godot", "Bevy", "Phaser",
        "C# (Unity)", "C++ (Unreal)", "GDScript", "Lua (Game)",
        "3D Graphics", "2D Graphics", "Shader Programming",
        "Game Physics", "Game AI", "Procedural Generation",
        "Multiplayer Networking", "ECS", "WebGL", "WebGPU",
        "VR Development", "AR Development", "XR",
        "Blender", "Maya", "Substance Painter",
        "Level Design", "Game Design", "Audio Programming"
    ],
    "Embedded & IoT": [
        "Embedded C", "Embedded C++", "Rust (Embedded)", "MicroPython",
        "Arduino", "Raspberry Pi", "ESP32", "STM32", "FPGA",
        "RTOS", "FreeRTOS", "Zephyr", "Bare Metal",
        "IoT", "MQTT", "CoAP", "BLE", "Zigbee", "LoRa",
        "Firmware Development", "Hardware Design", "PCB Design",
        "Verilog", "VHDL", "SystemVerilog",
        "Signal Processing", "Control Systems", "Robotics", "ROS"
    ],
    "Design & Product": [
        "UI Design", "UX Design", "Product Design", "Interaction Design",
        "Figma", "Sketch", "Adobe XD", "InVision", "Framer",
        "Design Systems", "Typography", "Color Theory", "Accessibility",
        "User Research", "Usability Testing", "A/B Testing",
        "Wireframing", "Prototyping", "Motion Design",
        "Information Architecture", "Design Thinking",
        "Product Management", "Agile", "Scrum", "Jira"
    ]
};

// Flatten all curated skills for quick lookup
const ALL_CURATED_SKILLS = Object.values(SKILL_CATEGORIES).flat();

// ──────────────────────────────────────────────
// Stack Exchange API for discovering more skills
// Free, no auth required, returns real tech tags
// ──────────────────────────────────────────────
interface StackExchangeTag {
    name: string;
    count: number;
}

async function searchStackExchangeTags(query: string): Promise<StackExchangeTag[]> {
    if (!query || query.length < 2) return [];
    try {
        const url = `https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize=20&inname=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.items || []).map((item: any) => ({
            name: item.name,
            count: item.count
        }));
    } catch {
        return [];
    }
}

// Debounce hook
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// ──────────────────────────────────────────────
// PROFILE PAGE COMPONENT
// ──────────────────────────────────────────────
export const ProfilePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileExists, setProfileExists] = useState(false);
    const [profileEditsLeft, setProfileEditsLeft] = useState(2);

    // Skill selection state
    const [skillSearch, setSkillSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Languages');
    const [showApiResults, setShowApiResults] = useState(false);
    const [apiResults, setApiResults] = useState<StackExchangeTag[]>([]);
    const [apiLoading, setApiLoading] = useState(false);
    const [customSkillInput, setCustomSkillInput] = useState('');
    const [showCategories, setShowCategories] = useState(true);

    const debouncedSearch = useDebounce(skillSearch, 400);
    const skillSearchRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        handle: '',
        display_name: '',
        bio: '',
        location: '',
        role_title: '',
        years_of_experience: 0,
        skills: [] as string[],
        github_url: '',
        linkedin_url: '',
        leetcode_url: '',
        preferred_location: '',
        avatar_url: '',
        employment_status: 'AVAILABLE',
        experience_history: [] as { company: string; role: string; from: string; to: string }[],
        projects: [] as { title: string; description: string; tech_stack: string; url: string }[],
        job_target: 'full_time' as 'internship' | 'full_time'
    });

    // ── Search Stack Exchange API on debounced input ──
    useEffect(() => {
        if (debouncedSearch.length >= 2) {
            setApiLoading(true);
            setShowApiResults(true);
            searchStackExchangeTags(debouncedSearch).then(results => {
                setApiResults(results);
                setApiLoading(false);
            });
        } else {
            setShowApiResults(false);
            setApiResults([]);
        }
    }, [debouncedSearch]);

    // ── Filter curated skills by search ──
    const filteredCuratedSkills = skillSearch
        ? ALL_CURATED_SKILLS.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))
        : SKILL_CATEGORIES[activeCategory] || [];

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            // @ts-ignore
            const { data: { user } } = await insforge.auth.getCurrentUser();
            if (!user) {
                navigate('/join');
                return;
            }
            setUser(user);

            // @ts-ignore
            const { data: profile } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (profile) {
                // Redirect to dashboard if profile already exists and user didn't click Edit
                if (!isEditMode) {
                    navigate('/dashboard');
                    return;
                }
                setProfileExists(true);
                setFormData({
                    handle: profile.handle || '',
                    display_name: profile.display_name || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                    role_title: profile.role_title || '',
                    years_of_experience: profile.years_of_experience || 0,
                    skills: profile.skills || [],
                    github_url: profile.github_url || '',
                    linkedin_url: profile.linkedin_url || '',
                    leetcode_url: profile.leetcode_url || '',
                    preferred_location: profile.preferred_location || '',
                    avatar_url: profile.avatar_url || '',
                    employment_status: profile.employment_status || 'AVAILABLE',
                    experience_history: profile.experience_history || [],
                    projects: profile.projects || [],
                    job_target: profile.job_target || 'full_time'
                });

                // Profile edit counter (2 edits per 30 days)
                const count = profile.profile_edit_count || 0;
                const lastEdit = profile.last_profile_edit ? new Date(profile.last_profile_edit) : null;
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                if (lastEdit && lastEdit < thirtyDaysAgo) {
                    setProfileEditsLeft(2);
                } else {
                    setProfileEditsLeft(Math.max(0, 2 - count));
                }
            } else {
                setProfileExists(false);
                setFormData(prev => ({
                    ...prev,
                    // @ts-ignore
                    display_name: user.profile?.name || user.email?.split('@')[0] || '',
                }));
            }
        } catch (err: any) {
            logger.error("Check user error", err);
            setError("Failed to load user data. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        if (!formData.handle) {
            setError("Handle is required.");
            setSaving(false);
            return;
        }

        if (formData.skills.length === 0) {
            setError("Select at least one skill.");
            setSaving(false);
            return;
        }

        // Block edits if limit reached (only for existing profiles)
        if (profileExists && profileEditsLeft <= 0) {
            setError("Profile edit limit reached (2 per 30 days). You cannot save changes right now.");
            setSaving(false);
            return;
        }

        try {
            // Sanitize all user inputs before persisting
            const payload: any = {
                handle: sanitizeText(formData.handle, 40),
                display_name: sanitizeText(formData.display_name, 100),
                bio: sanitizeText(formData.bio, 1000),
                location: sanitizeText(formData.location, 100),
                role_title: sanitizeText(formData.role_title, 100),
                years_of_experience: Math.max(0, Math.min(50, Number(formData.years_of_experience) || 0)),
                skills: formData.skills.map(s => sanitizeText(s, 60)).filter(Boolean),
                github_url: sanitizeUrl(formData.github_url),
                linkedin_url: sanitizeUrl(formData.linkedin_url),
                leetcode_url: sanitizeUrl(formData.leetcode_url),
                preferred_location: sanitizeText(formData.preferred_location, 100),
                avatar_url: sanitizeUrl(formData.avatar_url),
                employment_status: ['AVAILABLE', 'OPEN', 'BUSY'].includes(formData.employment_status)
                    ? formData.employment_status : 'AVAILABLE',
                experience_history: formData.experience_history.map(exp => ({
                    company: sanitizeText(exp.company, 100),
                    role: sanitizeText(exp.role, 100),
                    from: sanitizeText(exp.from, 20),
                    to: sanitizeText(exp.to, 20),
                })),
                projects: formData.projects.map(proj => ({
                    title: sanitizeText(proj.title, 120),
                    description: sanitizeText(proj.description, 500),
                    tech_stack: sanitizeText(proj.tech_stack, 200),
                    url: sanitizeUrl(proj.url),
                })),
                job_target: ['internship', 'full_time'].includes(formData.job_target)
                    ? formData.job_target : 'full_time'
            };

            if (profileExists) {
                // Increment profile edit counter
                payload.profile_edit_count = (2 - profileEditsLeft) + 1;
                payload.last_profile_edit = new Date().toISOString();

                // @ts-ignore
                const { error: updateError } = await insforge.database
                    .from('profiles')
                    .update(payload)
                    .eq('id', user.id);
                if (updateError) throw updateError;

                setProfileEditsLeft(prev => prev - 1);
            } else {
                // First-time profile creation doesn't count as an edit
                // @ts-ignore
                const { error: insertError } = await insforge.database
                    .from('profiles')
                    .insert({ id: user.id, ...payload });
                if (insertError) throw insertError;
                setProfileExists(true);
            }

            setSuccess("Profile saved successfully!");
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err: any) {
            logger.error("Save Error:", err);
            setError(err.message || "Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };



    const addSkill = (skill: string) => {
        const normalized = skill.trim();
        if (!normalized) return;
        if (formData.skills.length >= 15) return;
        if (formData.skills.some(s => s.toLowerCase() === normalized.toLowerCase())) return;
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, normalized]
        }));
    };

    const removeSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const addCustomSkill = () => {
        const skill = customSkillInput.trim();
        if (skill) {
            addSkill(skill);
            setCustomSkillInput('');
        }
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience_history: [...prev.experience_history, { company: '', role: '', from: '', to: '' }]
        }));
    };

    const removeExperience = (index: number) => {
        setFormData(prev => ({
            ...prev,
            experience_history: prev.experience_history.filter((_, i) => i !== index)
        }));
    };

    const updateExperience = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            experience_history: prev.experience_history.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp
            )
        }));
    };

    // ── Project helpers ──
    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { title: '', description: '', tech_stack: '', url: '' }]
        }));
    };

    const removeProject = (index: number) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    const updateProject = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map((proj, i) =>
                i === index ? { ...proj, [field]: value } : proj
            )
        }));
    };

    const formatCount = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
        return count.toString();
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono"><Loader className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 pb-20">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.15) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            />

            <div className="max-w-3xl mx-auto px-6 pt-24 relative z-10">

                <header className="mb-12 border-b border-zinc-800 pb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3">
                                <Terminal className="text-cyan-500" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                                    ENGINEER PROFILE
                                </span>
                            </h1>
                            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                                // Structured data for AI-native hiring
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-zinc-600 font-mono">PROFILE_EDITS_LEFT</div>
                            <div className={`text-lg font-bold font-mono ${profileEditsLeft > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {profileEditsLeft}/2
                            </div>
                            <div className="text-[10px] text-zinc-700 font-mono">per 30 days</div>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSave} className="space-y-12">

                    {/* ════════════════════════════════════════ */}
                    {/* SECTION 1: IDENTITY                      */}
                    {/* ════════════════════════════════════════ */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-cyan-500 pl-4">
                            <User className="w-5 h-5 text-zinc-500" /> Identity
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase">Handle (Unique)</label>
                                <input
                                    type="text" required
                                    value={formData.handle}
                                    onChange={e => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                    placeholder="e.g. rust_wizard"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase">Full Name</label>
                                <input
                                    type="text" required
                                    value={formData.display_name}
                                    onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                    placeholder="e.g. Jane Smith"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. San Francisco, CA"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-500" /> Preferred Job Location</label>
                                <input
                                    type="text"
                                    value={formData.preferred_location}
                                    onChange={e => setFormData({ ...formData, preferred_location: e.target.value })}
                                    placeholder="e.g. Remote, NYC, or London"
                                    className="w-full bg-zinc-900/50 border border-indigo-700/50 text-white p-4 rounded focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1"><Briefcase className="w-3 h-3" /> Current Role</label>
                                <input
                                    type="text"
                                    value={formData.role_title}
                                    onChange={e => setFormData({ ...formData, role_title: e.target.value })}
                                    placeholder="e.g. Senior Backend Engineer"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Brief professional summary. What do you build? What are you great at?"
                                rows={3}
                                className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2 max-w-xs">
                            <label className="text-xs font-mono text-zinc-500 uppercase">Years of Experience</label>
                            <input
                                type="number" min="0" max="50"
                                value={formData.years_of_experience}
                                onChange={e => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                                className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-lg transition-all"
                            />
                        </div>
                    </section>

                    {/* ════════════════════════════════════════ */}
                    {/* SECTION 2: SKILLS (The Big One)          */}
                    {/* ════════════════════════════════════════ */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-purple-500 pl-4">
                                <Code className="w-5 h-5 text-zinc-500" /> Technical Skills
                            </h2>
                            <span className={`text-xs font-mono ${formData.skills.length >= 15 ? 'text-red-500' : formData.skills.length >= 10 ? 'text-yellow-500' : 'text-zinc-600'}`}>
                                {formData.skills.length}/15
                            </span>
                        </div>

                        {/* Selected Skills Display */}
                        {formData.skills.length > 0 && (
                            <div className="p-4 border border-zinc-800 bg-zinc-900/30 rounded-lg">
                                <div className="text-[10px] font-mono text-zinc-600 uppercase mb-3 tracking-widest">Selected Skills</div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map(skill => (
                                        <span
                                            key={skill}
                                            className="group flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs rounded-full font-mono hover:border-red-500/50 hover:bg-red-500/10 transition-all cursor-pointer"
                                            onClick={() => removeSkill(skill)}
                                        >
                                            {skill}
                                            <X className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:text-red-400 transition-opacity" />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                ref={skillSearchRef}
                                type="text"
                                value={skillSearch}
                                onChange={e => setSkillSearch(e.target.value)}
                                placeholder="Search 250+ skills or type to discover from StackOverflow..."
                                className="w-full bg-zinc-900/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded focus:border-purple-500 focus:outline-none font-mono text-sm transition-all"
                            />
                            {skillSearch && (
                                <button
                                    type="button"
                                    onClick={() => { setSkillSearch(''); setShowApiResults(false); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* API Results (when searching) */}
                        {showApiResults && (
                            <div className="p-4 border border-indigo-500/30 bg-indigo-500/5 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
                                    <Globe className="w-3 h-3" />
                                    STACKOVERFLOW_TAGS — Real-time results for "{skillSearch}"
                                    {apiLoading && <Loader className="w-3 h-3 animate-spin" />}
                                </div>
                                {apiResults.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {apiResults
                                            .filter(tag => !formData.skills.some(s => s.toLowerCase() === tag.name.toLowerCase()))
                                            .map(tag => (
                                                <button
                                                    key={tag.name}
                                                    type="button"
                                                    onClick={() => addSkill(tag.name)}
                                                    disabled={formData.skills.length >= 15}
                                                    className="group flex items-center gap-2 px-3 py-1.5 rounded border bg-zinc-900 border-zinc-800 text-zinc-400 text-xs hover:border-indigo-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="font-mono">{tag.name}</span>
                                                    <span className="text-[10px] text-zinc-600 font-mono">{formatCount(tag.count)} questions</span>
                                                </button>
                                            ))
                                        }
                                    </div>
                                ) : !apiLoading && (
                                    <div className="text-zinc-600 text-xs font-mono">No matching tags found on StackOverflow.</div>
                                )}
                            </div>
                        )}

                        {/* Curated Skills by Category (when not searching) */}
                        {!skillSearch && (
                            <>
                                {/* Category Tabs */}
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCategories(!showCategories)}
                                        className="text-xs text-zinc-500 font-mono flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        <ChevronDown className={`w-3 h-3 transition-transform ${showCategories ? '' : '-rotate-90'}`} />
                                        CATEGORIES
                                    </button>
                                </div>

                                {showCategories && (
                                    <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-800/50">
                                        {Object.keys(SKILL_CATEGORIES).map(category => (
                                            <button
                                                key={category}
                                                type="button"
                                                onClick={() => setActiveCategory(category)}
                                                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${activeCategory === category
                                                    ? 'bg-purple-500/20 border border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Skills Grid */}
                                <div className="flex flex-wrap gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                                    {(SKILL_CATEGORIES[activeCategory] || []).map(skill => {
                                        const isSelected = formData.skills.includes(skill);
                                        return (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => isSelected ? removeSkill(skill) : addSkill(skill)}
                                                disabled={!isSelected && formData.skills.length >= 15}
                                                className={`px-3 py-1.5 rounded border text-xs transition-all ${isSelected
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed'
                                                    }`}
                                            >
                                                {skill}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Filtered curated results (when searching) */}
                        {skillSearch && filteredCuratedSkills.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">From Our Database</div>
                                <div className="flex flex-wrap gap-2">
                                    {filteredCuratedSkills
                                        .filter(s => !formData.skills.includes(s))
                                        .slice(0, 30)
                                        .map(skill => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => addSkill(skill)}
                                                disabled={formData.skills.length >= 15}
                                                className="px-3 py-1.5 rounded border bg-zinc-900 border-zinc-800 text-zinc-400 text-xs hover:border-purple-500 hover:text-purple-300 hover:bg-purple-500/10 transition-all disabled:opacity-30"
                                            >
                                                {skill}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Custom Skill Input */}
                        <div className="p-4 border border-dashed border-zinc-800 bg-zinc-900/20 rounded-lg space-y-3">
                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                <Sparkles className="w-3 h-3 text-yellow-500" />
                                CAN'T FIND YOUR SKILL? ADD IT MANUALLY
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customSkillInput}
                                    onChange={e => setCustomSkillInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                                    placeholder="e.g. Temporal, Qdrant, MCP..."
                                    className="flex-1 bg-black border border-zinc-700 text-white px-4 py-2 rounded focus:border-yellow-500 focus:outline-none font-mono text-sm"
                                    disabled={formData.skills.length >= 15}
                                />
                                <button
                                    type="button"
                                    onClick={addCustomSkill}
                                    disabled={!customSkillInput.trim() || formData.skills.length >= 15}
                                    className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold rounded hover:bg-yellow-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> ADD
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] text-zinc-600 font-mono">
                            {formData.skills.length}/15 selected • Skills are used by AI for candidate matching • Search discovers tags from StackOverflow (free, no auth)
                        </p>
                    </section>

                    {/* ════════════════════════════════════════ */}
                    {/* SECTION 3: LINKS                        */}
                    {/* ════════════════════════════════════════ */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-green-500 pl-4">
                            <Github className="w-5 h-5 text-zinc-500" /> Links
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1"><Github className="w-3 h-3" /> GitHub URL</label>
                                <input
                                    type="url"
                                    value={formData.github_url}
                                    onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                                    placeholder="https://github.com/username"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 font-mono transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={formData.linkedin_url}
                                    onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    placeholder="https://linkedin.com/in/username"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 font-mono transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1"><Code className="w-3 h-3" /> LeetCode URL</label>
                                <input
                                    type="url"
                                    value={formData.leetcode_url}
                                    onChange={e => setFormData({ ...formData, leetcode_url: e.target.value })}
                                    placeholder="https://leetcode.com/u/username"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 font-mono transition-all"
                                />
                            </div>
                        </div>

                        {/* Profile edit limit reminder */}
                        {profileExists && (
                            <div className={`p-3 rounded border text-xs font-mono ${profileEditsLeft > 0 ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                                ⚠ You have <strong>{profileEditsLeft}/2</strong> profile edits remaining this month. Your resume is auto-generated from this form — make your edits count.
                            </div>
                        )}
                    </section>

                    {/* ════════════════════════════════════════ */}
                    {/* SECTION 4: EXPERIENCE HISTORY            */}
                    {/* ════════════════════════════════════════ */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-yellow-500 pl-4">
                            <Briefcase className="w-5 h-5 text-zinc-500" /> Experience History
                        </h2>

                        {formData.experience_history.map((exp, index) => (
                            <div key={index} className="p-4 border border-zinc-800 bg-zinc-900/30 rounded space-y-3 relative">
                                <button type="button" onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input
                                        type="text" placeholder="Company"
                                        value={exp.company}
                                        onChange={e => updateExperience(index, 'company', e.target.value)}
                                        className="bg-black border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 focus:outline-none font-mono text-sm"
                                    />
                                    <input
                                        type="text" placeholder="Role / Title"
                                        value={exp.role}
                                        onChange={e => updateExperience(index, 'role', e.target.value)}
                                        className="bg-black border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 focus:outline-none font-mono text-sm"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input
                                        type="text" placeholder="From (e.g. Jan 2022)"
                                        value={exp.from}
                                        onChange={e => updateExperience(index, 'from', e.target.value)}
                                        className="bg-black border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 focus:outline-none font-mono text-sm"
                                    />
                                    <input
                                        type="text" placeholder="To (e.g. Present)"
                                        value={exp.to}
                                        onChange={e => updateExperience(index, 'to', e.target.value)}
                                        className="bg-black border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 focus:outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addExperience} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-yellow-500 font-mono transition-colors border border-dashed border-zinc-800 px-4 py-3 rounded hover:border-yellow-500/50 w-full justify-center">
                            <Plus className="w-4 h-4" /> Add Experience
                        </button>
                    </section>

                    {/* ════════════════════════════════════════ */}
                    {/* SECTION 5: PROJECTS                     */}
                    {/* ════════════════════════════════════════ */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-orange-500 pl-4">
                            <FolderGit2 className="w-5 h-5 text-zinc-500" /> Projects
                        </h2>

                        {formData.projects.map((proj, index) => (
                            <div key={index} className="p-4 border border-zinc-800 bg-zinc-900/30 rounded space-y-3 relative">
                                <button type="button" onClick={() => removeProject(index)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input
                                        type="text" placeholder="Project Title"
                                        value={proj.title}
                                        onChange={e => updateProject(index, 'title', e.target.value)}
                                        className="bg-black border border-zinc-700 text-white p-3 rounded focus:border-orange-500 focus:outline-none font-mono text-sm"
                                    />
                                    <input
                                        type="text" placeholder="Tech Stack (e.g. React, Node.js, PostgreSQL)"
                                        value={proj.tech_stack}
                                        onChange={e => updateProject(index, 'tech_stack', e.target.value)}
                                        className="bg-black border border-zinc-700 text-white p-3 rounded focus:border-orange-500 focus:outline-none font-mono text-sm"
                                    />
                                </div>
                                <textarea
                                    placeholder="Brief description of the project..."
                                    value={proj.description}
                                    onChange={e => updateProject(index, 'description', e.target.value)}
                                    rows={2}
                                    className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:border-orange-500 focus:outline-none font-mono text-sm resize-none"
                                />
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
                                    <input
                                        type="url" placeholder="Project URL (GitHub, live demo, etc.)"
                                        value={proj.url}
                                        onChange={e => updateProject(index, 'url', e.target.value)}
                                        className="flex-1 bg-black border border-zinc-700 text-white p-3 rounded focus:border-orange-500 focus:outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addProject} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 font-mono transition-colors border border-dashed border-zinc-800 px-4 py-3 rounded hover:border-orange-500/50 w-full justify-center">
                            <Plus className="w-4 h-4" /> Add Project
                        </button>
                    </section>

                    {/* ════════════════════════════════════════ */}
                    {/* SECTION 6: EMPLOYMENT STATUS             */}
                    {/* ════════════════════════════════════════ */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-blue-500 pl-4">
                            Employment Status
                        </h2>
                        <div className="flex gap-4">
                            {['AVAILABLE', 'HIRED'].map(status => (
                                <button
                                    key={status} type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, employment_status: status }))}
                                    className={`px-6 py-3 rounded border text-sm font-bold font-mono uppercase tracking-widest transition-all ${formData.employment_status === status
                                        ? status === 'AVAILABLE'
                                            ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                            : 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                        }`}
                                >
                                    {status === 'AVAILABLE' ? '🟢' : '🔴'} {status}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ════════════════════════════════════════ */}
                    {/* SECTION 7: JOB TARGET                   */}
                    {/* ════════════════════════════════════════ */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-teal-500 pl-4">
                            <Target className="w-5 h-5 text-zinc-500" /> Looking For
                        </h2>
                        <div className="flex gap-4">
                            {[
                                { value: 'internship', label: 'INTERNSHIP', emoji: '🎓' },
                                { value: 'full_time', label: 'FULL-TIME', emoji: '💼' }
                            ].map(option => (
                                <button
                                    key={option.value} type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, job_target: option.value as 'internship' | 'full_time' }))}
                                    className={`px-6 py-3 rounded border text-sm font-bold font-mono uppercase tracking-widest transition-all flex-1 ${formData.job_target === option.value
                                        ? 'bg-teal-500/20 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                        }`}
                                >
                                    {option.emoji} {option.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-zinc-600 font-mono">
                            This helps recruiters and AI agents filter candidates by job type preference.
                        </p>
                    </section>

                    {/* Error / Success Messages */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-200 text-sm rounded flex items-center gap-2">
                            ✓ {success}
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-8 border-t border-zinc-800 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-sm font-mono uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                        >
                            {saving ? (
                                <>Saving<Loader className="w-4 h-4 animate-spin" /></>
                            ) : (
                                <>Save Profile <Save className="w-4 h-4 group-hover:scale-110 transition-transform" /></>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
