"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Activity, Bot, Users, HelpCircle, AlertCircle, Trash2, Plus, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'hr'))) {
      router.push('/');
      return;
    }

    if (user && (user.role === 'admin' || user.role === 'hr')) {
      fetchInsights();
    }
  }, [user, authLoading, router]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const [insightsRes, tagsRes] = await Promise.all([
        api.get('/admin/insights'),
        api.get('/admin/tags')
      ]);
      setData(insightsRes.data);
      setTags(tagsRes.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      const res = await api.post('/admin/tags', { name: newTag.trim() });
      setTags([...tags, res.data]);
      setNewTag('');
    } catch (error) {
      console.error(error);
      alert('Failed to add tag. It might already exist.');
    }
  };

  const handleDeleteTag = async (id) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      await api.delete(`/admin/tags/${id}`);
      setTags(tags.filter(t => t._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 h-12 w-12 mb-4" />
      <p className="text-slate-400">Loading Admin Dashboard...</p>
    </div>
  );

  if (!user || (user.role !== 'admin' && user.role !== 'hr')) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-blue-500" size={32} />
            HR & Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Monitor platform health, view AI insights, and manage knowledge base.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6 flex items-center gap-4 hover-glow">
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <HelpCircle className="text-blue-400" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Questions (30d)</p>
              <h3 className="text-3xl font-bold text-white">{data?.totalQuestions || 0}</h3>
            </div>
          </div>
          
          <div className="glass-panel p-6 flex items-center gap-4 hover-glow">
            <div className="bg-red-500/20 p-4 rounded-xl">
              <AlertCircle className="text-red-400" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Unresolved Threads</p>
              <h3 className="text-3xl font-bold text-white">{data?.unresolvedCount || 0}</h3>
            </div>
          </div>

          <div className="glass-panel p-6 flex items-center gap-4 hover-glow">
            <div className="bg-purple-500/20 p-4 rounded-xl">
              <Bot className="text-purple-400" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">AI Insights Run</p>
              <h3 className={`text-3xl font-bold ${data?.insights?.startsWith('Failed') || data?.insights?.startsWith('AI Service') ? 'text-red-400' : 'text-white'}`}>
                {data?.insights?.startsWith('Failed') || data?.insights?.startsWith('AI Service') ? 'Failed' : 'Yes'}
              </h3>
            </div>
          </div>

          <div className="glass-panel p-6 flex items-center gap-4 hover-glow">
            <div className="bg-green-500/20 p-4 rounded-xl">
              <Users className="text-green-400" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Contributors</p>
              <h3 className="text-3xl font-bold text-white">{data?.activeContributors || 0}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Bot size={24} className="text-purple-400" />
              AI Insights
            </h2>
            
            <div className="prose prose-invert max-w-none text-slate-300">
              {data?.insights ? (
                <ReactMarkdown>{data.insights}</ReactMarkdown>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Bot size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Not enough data to generate insights or AI service unavailable.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Tag size={20} className="text-blue-400" />
                Manage Tags
              </h2>
              <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New tag name"
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors">
                  <Plus size={20} />
                </button>
              </form>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {tags.map(tag => (
                  <div key={tag._id} className="flex justify-between items-center bg-slate-800/30 border border-slate-700/50 p-2 rounded-lg text-sm">
                    <span className="text-slate-300">#{tag.name}</span>
                    <button onClick={() => handleDeleteTag(tag._id)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {tags.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No tags created yet.</p>}
              </div>
            </div>

            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <h2 className="text-lg font-bold text-white mb-4">Unresolved Threads</h2>
              <div className="space-y-3">
                {data?.unresolvedQuestionsList?.length > 0 ? (
                  data.unresolvedQuestionsList.map(q => (
                    <Link key={q._id} href={`/questions/${q._id}`} className="block group">
                      <h4 className="text-sm font-medium text-slate-300 group-hover:text-blue-400 truncate transition-colors">{q.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No unresolved threads!</p>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <h2 className="text-lg font-bold text-white mb-4">Frequent Questions</h2>
              <div className="space-y-3">
                {data?.frequentQuestions?.length > 0 ? (
                  data.frequentQuestions.map(q => (
                    <Link key={q._id} href={`/questions/${q._id}`} className="block group flex justify-between items-center">
                      <h4 className="text-sm font-medium text-slate-300 group-hover:text-blue-400 truncate transition-colors mr-2">{q.title}</h4>
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 shrink-0">{q.views} views</span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No frequent questions yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
