import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment dark:bg-zinc-950 flex items-center justify-center px-4">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sand/30 dark:bg-zinc-800/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-linen/50 dark:bg-zinc-900/50 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-semibold text-obsidian dark:text-white tracking-tight">
            Ledger<span className="text-drift dark:text-zinc-500">.</span>
          </h1>
          <motion.p
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-drift dark:text-zinc-400 mt-3"
          >
            {isLogin ? 'Welcome back' : 'Create your account'}
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-linen dark:bg-zinc-900 border border-stone/20 dark:border-zinc-800 rounded-2xl shadow-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name (register only) */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-char dark:text-zinc-200 mb-1.5">Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-drift dark:text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-parchment dark:bg-zinc-950 border border-stone/30 dark:border-zinc-700 rounded-xl text-char dark:text-zinc-100 text-sm placeholder:text-drift/50 dark:placeholder:text-zinc-500 focus:outline-none focus:border-char/60 dark:focus:border-zinc-400 focus:ring-1 focus:ring-char/10 dark:focus:ring-zinc-500/10 transition-all duration-300"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-char dark:text-zinc-200 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-drift dark:text-zinc-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-parchment dark:bg-zinc-950 border border-stone/30 dark:border-zinc-700 rounded-xl text-char dark:text-zinc-100 text-sm placeholder:text-drift/50 dark:placeholder:text-zinc-500 focus:outline-none focus:border-char/60 dark:focus:border-zinc-400 focus:ring-1 focus:ring-char/10 dark:focus:ring-zinc-500/10 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-char dark:text-zinc-200 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-drift dark:text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-parchment dark:bg-zinc-950 border border-stone/30 dark:border-zinc-700 rounded-xl text-char dark:text-zinc-100 text-sm placeholder:text-drift/50 dark:placeholder:text-zinc-500 focus:outline-none focus:border-char/60 dark:focus:border-zinc-400 focus:ring-1 focus:ring-char/10 dark:focus:ring-zinc-500/10 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-sm text-red-700/60 dark:text-red-400 text-center bg-red-50/30 dark:bg-red-950/20 py-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(26, 23, 20, 0.12)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="
                w-full flex items-center justify-center gap-2
                py-3 bg-obsidian dark:bg-white text-parchment dark:text-zinc-900
                text-sm font-medium rounded-xl
                hover:opacity-90 transition-all duration-300
                disabled:opacity-40 cursor-pointer
              "
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-parchment dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-drift dark:text-zinc-400 mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-obsidian dark:text-white font-medium hover:underline underline-offset-4 cursor-pointer transition-all duration-200"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-drift dark:text-zinc-500 mt-8"
        >
          Simple, calm financial tracking.
        </motion.p>
      </motion.div>
    </div>
  );
}
