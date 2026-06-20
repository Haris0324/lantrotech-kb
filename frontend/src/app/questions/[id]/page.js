"use client";
import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, CheckCircle, Bot, Loader2, Send, Pin, ShieldCheck } from 'lucide-react';

export default function QuestionDetail({ params }) {
  const { id } = use(params);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.emit('joinQuestion', id);
      
      socket.on('newAnswer', (answer) => {
        setAnswers(prev => [...prev, answer]);
      });

      socket.on('answerVoted', ({ answerId, upvotes, downvotes }) => {
        setAnswers(prev => prev.map(a => 
          a._id === answerId ? { ...a, upvotes, downvotes } : a
        ));
      });

      socket.on('answerAccepted', ({ answerId }) => {
        setAnswers(prev => prev.map(a => 
          a._id === answerId ? { ...a, isAccepted: true } : a
        ));
        setQuestion(prev => ({ ...prev, status: 'resolved' }));
      });

      socket.on('answerAIUpdated', ({ answerId, aiFeedback }) => {
        setAnswers(prev => prev.map(a => 
          a._id === answerId ? { ...a, aiFeedback } : a
        ));
      });

      socket.on('answerPinned', ({ answerId, isPinned }) => {
        setAnswers(prev => {
          const updated = prev.map(a => a._id === answerId ? { ...a, isPinned } : a);
          return updated.sort((a, b) => (b.isPinned === a.isPinned) ? (b.isAccepted - a.isAccepted) : (b.isPinned ? 1 : -1));
        });
      });

      socket.on('answerOfficial', ({ answerId, isOfficial }) => {
        setAnswers(prev => prev.map(a => 
          a._id === answerId ? { ...a, isOfficial } : a
        ));
      });

      return () => {
        socket.emit('leaveQuestion', id);
        socket.off('newAnswer');
        socket.off('answerVoted');
        socket.off('answerAccepted');
        socket.off('answerAIUpdated');
        socket.off('answerPinned');
        socket.off('answerOfficial');
      };
    }
  }, [socket, id]);

  const fetchQuestionAndAnswers = async () => {
    setLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        api.get(`/questions/${id}`),
        api.get(`/answers/${id}`)
      ]);
      setQuestion(qRes.data);
      setAnswers(aRes.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/answers', { questionId: id, content: newAnswer });
      setAnswers(prev => {
        if (!prev.find(a => a._id === res.data._id)) {
          return [...prev, res.data];
        }
        return prev;
      });
      setNewAnswer('');
    } catch (error) {
      console.error(error);
    }
    setSubmitting(false);
  };

  const handleVote = async (answerId, type) => {
    try {
      const res = await api.put(`/answers/${answerId}/vote`, { type });
      setAnswers(prev => prev.map(a => 
        a._id === res.data._id ? { ...a, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : a
      ));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (answerId) => {
    try {
      const res = await api.put(`/answers/${answerId}/accept`);
      setAnswers(prev => prev.map(a => 
        a._id === res.data._id ? { ...a, isAccepted: true } : a
      ));
      setQuestion(prev => ({ ...prev, status: 'resolved' }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleTogglePin = async (answerId) => {
    try {
      await api.put(`/answers/${answerId}/pin`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleOfficial = async (answerId) => {
    try {
      await api.put(`/answers/${answerId}/official`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 h-12 w-12" />
    </div>
  );

  if (!question) return <div className="p-8 text-center text-white">Question not found.</div>;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="glass-panel p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <h1 className="text-3xl font-bold text-white mb-4">{question.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-400 border-b border-slate-700/50 pb-4 mb-6">
            <span>Asked {formatDistanceToNow(new Date(question.createdAt))} ago</span>
            <span>By {question.author?.name}</span>
            <span>Viewed {question.views} times</span>
            {question.status === 'resolved' && (
              <span className="flex items-center gap-1 text-green-400 font-medium">
                <CheckCircle size={16} /> Resolved
              </span>
            )}
          </div>
          
          <div className="text-slate-200 whitespace-pre-wrap mb-6 font-mono text-sm leading-relaxed bg-slate-900/50 p-4 rounded-lg">
            {question.content}
          </div>
          
          <div className="flex gap-2">
            {question.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">{answers.length} Answers</h2>
          <div className="space-y-6">
            {answers.map(answer => {
              const isHighlyUpvoted = answer.upvotes >= 10;
              return (
              <div key={answer._id} className={`glass-panel p-6 flex gap-6 ${answer.isAccepted ? 'ring-2 ring-green-500/50 bg-green-900/10' : isHighlyUpvoted ? 'ring-1 ring-blue-500/30' : ''}`}>
                <div className="flex flex-col items-center gap-3 min-w-[50px]">
                  <button onClick={() => handleVote(answer._id, 'upvote')} className="text-slate-400 hover:text-blue-400 transition-colors p-2 hover:bg-slate-800 rounded-full">
                    <ThumbsUp size={24} />
                  </button>
                  <span className="text-xl font-bold text-slate-300">{answer.upvotes - answer.downvotes}</span>
                  <button onClick={() => handleVote(answer._id, 'downvote')} className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-slate-800 rounded-full">
                    <ThumbsDown size={24} />
                  </button>
                  {answer.isAccepted && (
                    <div className="text-green-400 mt-2" title="Accepted Answer">
                      <CheckCircle size={28} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex gap-2 mb-3">
                    {answer.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    {answer.isOfficial && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ShieldCheck size={12} /> Official Answer
                      </span>
                    )}
                  </div>
                  <div className="text-slate-200 whitespace-pre-wrap mb-4 font-mono text-sm leading-relaxed bg-slate-900/30 p-4 rounded-lg">
                    {answer.content}
                  </div>
                  
                  {/* AI Feedback Section */}
                  {answer.aiFeedback && answer.aiFeedback.status !== 'pending' && (
                    <div className={`mt-4 p-4 rounded-lg border flex gap-3 ${
                      answer.aiFeedback.status === 'verified' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                      answer.aiFeedback.status === 'corrected' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                      'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}>
                      <Bot size={20} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm mb-1 uppercase tracking-wider">
                          AI Analysis: {answer.aiFeedback.status}
                        </p>
                        {answer.aiFeedback.suggestion && (
                          <p className="text-sm opacity-90">{answer.aiFeedback.suggestion}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {answer.aiFeedback && answer.aiFeedback.status === 'pending' && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                      <Loader2 size={16} className="animate-spin" />
                      AI is verifying this answer...
                    </div>
                  )}

                  <div className="flex justify-between items-end mt-6">
                    <div className="flex gap-2">
                      {user && (user.role === 'admin' || user.role === 'hr') && (
                        <>
                          {!answer.isAccepted && (
                            <button 
                              onClick={() => handleAccept(answer._id)}
                              className="text-sm text-green-400 hover:text-green-300 border border-green-500/30 hover:bg-green-500/10 px-3 py-1.5 rounded transition-all"
                            >
                              Mark as Accepted
                            </button>
                          )}
                          <button 
                            onClick={() => handleTogglePin(answer._id)}
                            className={`text-sm ${answer.isPinned ? 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10' : 'text-slate-400 border-slate-600 hover:text-yellow-400'} border px-3 py-1.5 rounded transition-all flex items-center gap-1`}
                          >
                            <Pin size={14} /> {answer.isPinned ? 'Unpin' : 'Pin'}
                          </button>
                          <button 
                            onClick={() => handleToggleOfficial(answer._id)}
                            className={`text-sm ${answer.isOfficial ? 'text-blue-400 border-blue-500/50 bg-blue-500/10' : 'text-slate-400 border-slate-600 hover:text-blue-400'} border px-3 py-1.5 rounded transition-all flex items-center gap-1`}
                          >
                            <ShieldCheck size={14} /> {answer.isOfficial ? 'Remove Official' : 'Make Official'}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-slate-400 mb-1">
                        Answered {formatDistanceToNow(new Date(answer.createdAt))} ago
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">
                          {answer.author?.role?.toUpperCase()}
                        </div>
                        <span className="text-blue-300 font-medium">{answer.author?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {user && user._id !== question.author?._id ? (
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4">Your Answer</h3>
            <form onSubmit={handlePostAnswer}>
              <textarea
                required
                rows={6}
                placeholder="Write your detailed answer here..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4 font-mono text-sm"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Post Answer
                </button>
              </div>
            </form>
          </div>
        ) : user && user._id === question.author?._id ? (
          <div className="glass-panel p-6 text-center text-slate-400">
            You cannot answer your own question. Please wait for other employees to share their knowledge.
          </div>
        ) : (
          <div className="glass-panel p-6 text-center text-slate-400">
            Please log in to answer this question.
          </div>
        )}
      </main>
    </>
  );
}
