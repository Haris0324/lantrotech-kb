"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Eye, CheckCircle, Search, PlusCircle, Filter } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('recent'); // recent, popular
  const socket = useSocket();

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  useEffect(() => {
    if (socket) {
      socket.on('newQuestion', (question) => {
        setQuestions((prev) => [question, ...prev]);
      });
      return () => socket.off('newQuestion');
    }
  }, [socket]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/questions?sort=${filter}`);
      setQuestions(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Questions Feed</h1>
            <p className="text-slate-400 mt-1">Discover, learn, and share knowledge.</p>
          </div>
          <Link 
            href="/ask" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 hover-glow"
          >
            <PlusCircle size={20} />
            Ask Question
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 glass-panel text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Search by title or #tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-fit">
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'recent' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Recent
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'popular' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Popular
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-20 glass-panel">
                <Search className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-white">No questions found</h3>
                <p className="text-slate-400 mt-1">Try adjusting your search or ask a new question.</p>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div key={q._id} className="glass-panel p-6 hover-glow animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-start gap-2 pt-1 min-w-[60px]">
                      <div className="text-center">
                        <span className="block text-lg font-bold text-slate-300">{q.views}</span>
                        <span className="text-xs text-slate-500 font-medium">views</span>
                      </div>
                      {q.status === 'resolved' && (
                        <div className="mt-2 text-green-400" title="Resolved">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/questions/${q._id}`} className="block">
                        <h2 className="text-xl font-semibold text-blue-400 hover:text-blue-300 truncate mb-2 transition-colors">
                          {q.title}
                        </h2>
                      </Link>
                      <p className="text-slate-300 line-clamp-2 text-sm mb-4">
                        {q.content}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                        <div className="flex gap-2">
                          {q.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span className="font-medium text-slate-300">{q.author?.name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(q.createdAt))} ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}
