
export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    readTime: string;
    image: string;
    tags: string[];
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        slug: 'why-resume-spam-is-a-ddos-attack',
        title: 'Why Resume Spam is a DDoS Attack on Tech Hiring',
        excerpt: 'Traditional hiring is broken. Recruiters are drowning in AI-generated resumes. Here is how we are fixing it.',
        author: 'Sanskar Agrawal',
        date: 'Feb 13, 2026',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000',
        tags: ['Hiring', 'Tech', 'AI'],
        content: `
## The Problem: Resume Inflation

In 2024, a single job posting for a "Junior React Developer" receives an average of 400+ applications. 

Here is the scary part: **85% of them are unqualified spam.**

With tools like ChatGPT, candidates can generate perfect-looking resumes and cover letters in seconds. They use bots to apply to thousands of jobs automatically. For recruiters, this feels like a **DDoS attack** on their inbox.

### The Impact
1.  **Recruiter Burnout:** Humans cannot filter 1000 resumes a day.
2.  **Missed Talent:** Great engineers get buried under a pile of keyword-stuffed PDFs.
3.  **Ghosting:** Companies stop responding because they physically can't.

## The Solution: Proof of Work

At **HireAHuman**, we believe resumes are obsolete. They are just claims. Code is proof.

We verify engineers based on their **GitHub activity**:
-   Actual code commits
-   Pull request history
-   Contribution graphs
-   Real project complexity

If you don't commit code, you don't get matched. It's that simple.

### Why This Works
-   **No more spam:** Bots can't fake a 3-year contribution graph.
-   **Instant filtering:** We know who is actually coding vs. who is just watching tutorials.
-   **High intent:** Only serious engineers maintain active repositories.

Stop hiring paper tigers. Start hiring builders.
        `
    },
    {
        id: '2',
        slug: 'github-verification-vs-resumes',
        title: 'How GitHub Verification Works Better Than Resumes',
        excerpt: 'Your commit history tells a story that a PDF never could. Learn how our Reality Score ranks engineers.',
        author: 'Team HireAHuman',
        date: 'Feb 12, 2026',
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=1000',
        tags: ['GitHub', 'Verification', 'Engineering'],
        content: `
## The "Reality Score"

Resumes are marketing documents. GitHub is a ledger of truth.

When you sign up for HireAHuman, our AI analyzes your public GitHub profile to calculate a **Reality Score**. 

### What We Look For
1.  **Consistency:** Do you code every week, or just once a year?
2.  **Complexity:** Are you changing variable names, or architecting systems?
3.  **Collaboration:** Do you merge PRs? Do you review code?
4.  **Impact:** Are people using your libraries?

### Case Study: The "Senior" Developer

We recently saw a candidate with a "Senior Developer" resume apply. 
-   **Resume:** 5 years exp, Expert in React, Node, AWS.
-   **GitHub:** 0 contributions in 2023. 1 fork of a "Hello World" app.

**Verdict:** Rejected immediately.

### Case Study: The "Newbie"
-   **Resume:** Bootcamp grad, no job history.
-   **GitHub:** 1,200 commits in the last year. Built a full-stack e-commerce clone with Redux and Stripe.

**Verdict:** Verified and matched with 3 startups.

## Conclusion

Degrees don't ship code. Certifications don't fix bugs. **Commits do.**
        `
    },
    {
        id: '3',
        slug: '1000-rupee-deposit-stops-fake-recruiters',
        title: 'The ₹1000 Deposit That Stops Fake Recruiters',
        excerpt: 'Why we charge companies to join. It is not about profit—it is about quality control.',
        author: 'Sanskar Agrawal',
        date: 'Feb 10, 2026',
        readTime: '3 min read',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000',
        tags: ['Business', 'Trust', 'Safety'],
        content: `
## The "Consultancy" Trap

Engineers hate it. You get a call for a "great opportunity," only to realize it's a third-party consultancy trying to harvest your data or sell you a course.

We wanted to build a **safe haven** for engineers. A place where every job is real, and every recruiter is verified.

### The Barrier to Entry

To hire on HireAHuman, companies must:
1.  Verify their business email.
2.  Link a professional LinkedIn profile.
3.  **Pay a fully refundable ₹1,000 security deposit.**

### Why ₹1,000?

It's a small amount for a real company, but a massive friction point for spammers.

-   **Scammers** operate at high volume. Paying for every account breaks their model.
-   **Real Companies** care about reputation. They have no issue putting skin in the game.
-   **Refundable:** Establish trust, match with a candidate, and get your money back.

This simple filter eliminates 99% of fake job postings.

### The Result
-   **Zero** "generic" consultancies.
-   **High response rates** from engineers (because they know you're real).
-   **Better matches** for everyone.
        `
    },
    {
        id: '4',
        slug: 'ai-native-hiring-mcp-revolution',
        title: 'AI-Native Hiring: The MCP Revolution',
        excerpt: 'How we use the Model Context Protocol (MCP) to connect AI agents directly to our database.',
        author: 'Engineering Team',
        date: 'Feb 08, 2026',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
        tags: ['AI', 'MCP', 'Tech'],
        content: `
## What is MCP?

The **Model Context Protocol (MCP)** is a standard that allows AI models (like Claude or Gemini) to securely connect to external data sources.

Most hiring platforms are "dumb" databases. You search keywords, you get results.

**HireAHuman is AI-Native.** We built our entire backend to be accessible via MCP.

### How It Works

When you use our **AI Recruiter Chatbot**, it's not just summarizing text. It is actually:
1.  **Querying the Database:** "Find me engineers with Rust experience who have committed in the last 7 days."
2.  **Analyzing Code:** Reading the actual diffs of their top repositories.
3.  **Ranking Matches:** Using logic, not just keyword matching.

### For Developers

This means you can be discovered for *what you built*, not just *what you said*.

If you wrote a complex migration script in Python, our AI can understand that context and match you with a company needing backend migration help—even if your resume doesn't explicitly say "Migration Specialist."

### The Future

We are moving towards a world where **AI Agents hire AI Agents**. 
-   Your "Agent" (your profile + verified code) negotiates with...
-   The Company's "Agent" (hiring criteria + budget).

HireAHuman is the infrastructure layer for this future.
        `
    },
    {
        id: '5',
        slug: 'ai-agents-are-now-hiring-engineers',
        title: 'AI Agents Are Now Hiring Engineers: Here Is How To Prepare',
        excerpt: 'The recruiter of 2026 is not a person. It is an autonomous agent scanning your code. Here is how to optimize your career for the age of machine evaluation.',
        author: 'Sanskar Agrawal',
        date: 'Feb 15, 2026',
        readTime: '12 min read',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000',
        tags: ['AI Agents', 'Future of Work', 'Career'],
        content: `
## The Recruiter Is dead. Long Live The Agent.

It started slowly. First, Applicant Tracking Systems (ATS) scanned for keywords. Then, LLMs summarized resumes. 

**Now, in 2026, the shift is complete: AI Agents are the gatekeepers.**

If you are an engineer today, your "customer" isn't the CTO or the HR manager. It is their **Hiring Agent**. This agent runs 24/7, doesn't care about your font choice, and cannot be charmed by a witty cover letter. It cares about one thing: **Proof of Work.**

At HireAHuman, we are building the infrastructure for this new world. Our Model Context Protocol (MCP) servers allow recruitment agents to query our database of verified engineers directly. 

Here is what you need to know about how AI agents hire, and how to survive the transition.

---

### 1. Agents Don't Read Resumes. They Read Code.

A human recruiter spends 6 seconds on a resume. An AI agent spends 600 milliseconds, but in that time, it doesn't just skim—it **verifies**.

When an agent like the ones built on HireAHuman scans a profile, it performs a Deep Repository Analysis. It clones your featured repos (cached versions) and runs static analysis tools.

**What they look for:**
*   **Cyclomatic Complexity:** Is your code a nested hell of \`if-else\` statements?
*   **Test Coverage:** Do you write tests? Do they actually pass?
*   **Commit Granularity:** Are you pushing "fixed bug" every 3 weeks, or atomic commits every 3 hours?
*   **Dependency Hygiene:** Are you using packages that have been deprecated for 2 years?

**The "Seniority" Signal:**
We've found that Agents use "Code Smell" as a primary filter. A Senior Engineer's code looks different. Ideally, it's boring. It's readable. It handles errors gracefully. Agents are trained to recognize these patterns.

### 2. The Logic of Agentic Evaluation

Unlike LLMs which just predict the next token, **Agents have goals.**

A company might deploy an agent with this prompt:
> "Find me a backend engineer who has meaningful experience with Rust, has contributed to open source, and understands distributed systems constraints. Budget: $180k. Do not show me bootcamp projects."

The Agent executes a multi-step workflow:
1.  **Search:** Query verified databases (like ours).
2.  **Filter:** Remove anyone whose "Rust" experience is just a fork of a tutorial.
3.  **Evaluate:** Look at the *architecture* of your personal projects. Did you use a message queue? Did you handle concurrency correctly?
4.  **Rank:** Score candidates based on the similarity of their *proven* work to the *actual* job requirements.

**This kills the "Fake it 'til you make it" strategy.** You cannot keyword-stuff logical competence.

### 3. How to Optimize Your Profile for AI Agents

If the consumer of your profile is a machine, you need to optimize for machine readability. We call this **Agentic SEO**.

#### A. Structured Documentation
Agents value **README.md** files highly. But they don't want marketing fluff. They want:
*   **Architecture Diagrams:** Mermaid.js charts are gold. Agents can parse these to understand your system design.
*   **Setup Instructions:** If an agent can spin up your project in a sandbox container effortlessly, your "Replicability Score" goes through the roof.
*   **Decision Logs (ADRs):** Document *why* you chose PostgreSQL over Mongo. Agents looking for "Senior" traits weigh these heavily.

#### B. The "Green Graph" Myth
Don't just write a script to paint your GitHub contribution graph green. Agents look at **entropy**. Random noise commits look different from structural changes.
*   **Low Impact:** "Update README" (1 line change).
*   **High Impact:** "Refactor auth middleware to support JWT rotation" (12 files, +400/-350 lines).

Agents seek High Impact density.

#### C. Test-Driven Development (TDD) as a Signal
The strongest signal of professional-grade code is a robust test suite. If an agent sees a Repo with 90% coverage and CI/CD pipelines configured, it infers reliability. It assumes you treat your code as a product, not a toy.

### 4. The Future: Agent-to-Agent Negotiation

We are moving toward a protocol where **your** Personal Agent negotiates with the **Company's** Hiring Agent.

**The Scenario:**
1.  **Your Agent:** "My user wants a remote role, minimum $160k, specifically in HealthTech. He refuses to work with PHP."
2.  **Company Agent:** "I have a role matching 90% of criteria, but it requires one day a week in-office. Salary is $175k."
3.  **Your Agent:** "Calculating trade-off... User values salary high. Tentatively accepting interview request."

This negotiation happens in milliseconds. You only get a push notification: *"Interview scheduled with MedTech inc for Tuesday. Context: They offer $175k."*

**HireAHuman is the trust layer for this transaction.** We verify the Company Agent is real (preventing spam) and the Candidate Agent represents a real human (preventing bots).

### 5. Why "Rent a Human" is the Wrong Model

There is a growing trend of "Rent a Human" services where AI hires humans for physical, low-context tasks (like "go stand in line").

**Do not confuse this with the future of engineering.**

*   **Rent a Human:** Commoditized, low-skill, task-based. You are a pair of hands.
*   **Hire a Human (Our Model):** Specialized, high-skill, career-based. You are a Verified Brain.

In the "Rent" model, AI replaces the manager and treats you like a robot.
In the "Hire" model, AI acts as the *connector* to help you find work where your human creativity and architectural thinking are valued most.

### Conclusion

The "resume" was an artifact of the paper age. The "LinkedIn profile" was an artifact of the social media age.
**The Verified Git Profile is the artifact of the AI Age.**

Adapt your public work. Show your logic. Build for the machine to read, so the human can hire.

*Welcome to the protocol.*
        `
    }
];
