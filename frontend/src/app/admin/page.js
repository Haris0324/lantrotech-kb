"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Activity, Bot, Users, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
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
      const res = await api.get('/admin/insights');
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 h-12 w-12 mb-4" />
      <p className="text-slate-400">Loading Admin Dashboard...</p>
    </div>
  );

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <div className="bg-purple-500/20 p-4 rounded-xl">
              <Bot className="text-purple-400" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">AI Analyzed Threads</p>
              <h3 className="text-3xl font-bold text-white">{data?.totalQuestions || 0}</h3>
            </div>
          </div>

          <div className="glass-panel p-6 flex items-center gap-4 hover-glow">
            <div className="bg-green-500/20 p-4 rounded-xl">
              <Users className="text-green-400" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Contributors</p>
              <h3 className="text-3xl font-bold text-white">--</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Bot size={24} className="text-purple-400" />
              AI Knowledge Gap Analysis & Auto-FAQ
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
        </div>
      </main>
    </>
  );
}
