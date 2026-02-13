
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { blogPosts } from '../data/blogPosts';
import { ArrowLeft, Calendar, User, Clock, Share2, MessageCircle } from 'lucide-react';
import { NotFoundPage } from './NotFound';

export const BlogPostPage = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return <NotFoundPage />;
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">

                {/* Back Button */}
                <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Insights
                </Link>

                {/* Hero Section */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl mb-12">
                    <div className="h-64 sm:h-96 relative">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-indigo-600/90 text-white text-xs font-bold rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm mt-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {post.author}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {post.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {post.readTime}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200">
                    <article className="prose prose-lg prose-indigo max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600 prose-img:rounded-xl">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    </article>

                    <div className="border-t border-slate-100 mt-12 pt-8 flex items-center justify-between">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
                                <Share2 className="w-5 h-5" /> Share
                            </button>
                            <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
                                <MessageCircle className="w-5 h-5" /> Discuss on X
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related / Next Post CTA (Optional) */}
                <div className="mt-12 text-center bg-indigo-50 rounded-2xl p-8 border border-indigo-100">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-2">Ready to hire verified engineers?</h3>
                    <p className="text-indigo-700 mb-6">Skip the resume spam. Start scouting talent with real code proof.</p>
                    <Link to="/join" className="inline-block px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                        Start Free Trial
                    </Link>
                </div>

            </div>
        </div>
    );
};
