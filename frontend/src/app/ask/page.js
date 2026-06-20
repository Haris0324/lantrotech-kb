"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Send, HelpCircle, Loader2 } from 'lucide-react';

export default function AskQuestion() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to ask a question.");
      router.push('/login');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
      const res = await api.post('/questions', {
        title,
        content,
        tags: tagArray
      });
      router.push(`/questions/${res.data._id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to post question');
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 h-12 w-12" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <HelpCircle size={28} />
            <h1 className="text-3xl font-bold text-white">Ask a Question</h1>
          </div>
          <p className="text-slate-400">Be specific and imagine you're asking a question to another person.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="glass-panel p-6">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Body
            </label>
            <p className="text-xs text-slate-400 mb-3">Include all the information someone would need to answer your question.</p>
            <textarea
              required
              rows={8}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="glass-panel p-6">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Tags
            </label>
            <p className="text-xs text-slate-400 mb-3">Add up to 5 tags to describe what your question is about (comma separated).</p>
            <input
              type="text"
              placeholder="e.g. react, docker, frontend"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 hover-glow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Post Your Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
