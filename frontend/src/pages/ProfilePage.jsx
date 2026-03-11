import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Camera } from 'lucide-react';
import { PageWrapper, Card, Button, Input } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast('Profile updated', 'success');
    } catch (err) {
      toast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper title="Profile" subtitle="Manage your personal information">
      <div className="max-w-2xl space-y-8">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-sand dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-3xl font-semibold text-obsidian dark:text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toast('Avatar upload coming soon', 'info')}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-card">
                <Camera className="w-3.5 h-3.5 text-white" />
              </motion.button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-obsidian dark:text-white">{user?.name || 'User'}</h2>
              <p className="text-sm text-drift dark:text-zinc-400">{user?.email || ''}</p>
              <p className="text-xs text-drift dark:text-zinc-500 mt-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <h3 className="text-base font-semibold text-obsidian dark:text-white mb-6">Personal Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                icon={User}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <Input
                label="Email Address"
                icon={Mail}
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
              <div className="pt-2">
                <Button type="submit" loading={saving}>Save Changes</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
