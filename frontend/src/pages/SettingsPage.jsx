import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Trash2 } from 'lucide-react';
import { PageWrapper, Card, Button, Input, Toggle } from '../components/ui';
import { toast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [currencyFormat, setCurrencyFormat] = useState('USD');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast('Password updated', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast(err.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action is permanent and cannot be undone.')) return;
    try {
      await authApi.updateProfile({ deleted: true });
      logout();
    } catch (err) {
      toast('Failed to delete account', 'error');
    }
  };

  const sections = [
    { icon: User, label: 'Account' },
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Security' },
    { icon: Palette, label: 'Preferences' },
  ];

  return (
    <PageWrapper title="Settings" subtitle="Manage your account preferences">
      <div className="max-w-2xl space-y-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-sand/60 dark:bg-zinc-800 flex items-center justify-center">
                <User className="w-4 h-4 text-char dark:text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold text-obsidian dark:text-white">Account</h3>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone/20 dark:border-zinc-800">
              <div className="w-14 h-14 rounded-2xl bg-sand dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-xl font-semibold text-obsidian dark:text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-obsidian dark:text-white">{user?.name || 'User'}</p>
                <p className="text-sm text-drift dark:text-zinc-400">{user?.email || ''}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" value={user?.name || ''} readOnly />
              <Input label="Email" value={user?.email || ''} readOnly />
            </div>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-sand/60 dark:bg-zinc-800 flex items-center justify-center">
                <Bell className="w-4 h-4 text-char dark:text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold text-obsidian dark:text-white">Notifications</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-char dark:text-zinc-200">Budget Alerts</p>
                  <p className="text-xs text-drift dark:text-zinc-500">Get notified when close to budget limit</p>
                </div>
                <Toggle checked={notifications} onChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-char dark:text-zinc-200">Weekly Summary</p>
                  <p className="text-xs text-drift dark:text-zinc-500">Receive weekly spending report</p>
                </div>
                <Toggle checked={false} onChange={() => {}} />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-sand/60 dark:bg-zinc-800 flex items-center justify-center">
                <Shield className="w-4 h-4 text-char dark:text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold text-obsidian dark:text-white">Security</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" loading={saving}>Update Password</Button>
            </form>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-red-200/30 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-50/40 dark:bg-red-950/30 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-700/50 dark:text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-obsidian dark:text-white">Danger Zone</h3>
            </div>
            <p className="text-sm text-drift dark:text-zinc-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
