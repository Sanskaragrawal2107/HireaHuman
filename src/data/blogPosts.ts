
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
    }
];
