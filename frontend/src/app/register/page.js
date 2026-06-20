"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Mail, Lock, User, Briefcase, Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await register(formData);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] -z-10" />
        
        <div className="w-full max-w-md space-y-8 glass-panel p-8 animate-fade-in">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
              Create an account
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              Join the Lantrotech internal community
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  name="department"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="Department (e.g., Engineering)"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="Company Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-accent hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/30"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create account'}
            </button>
          </form>
          
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-accent hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
