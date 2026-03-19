import { motion } from 'framer-motion';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge } from '../ui';

export default function AlertsPanel({ alerts = [], onMarkAllRead }) {
  return (
    <Card className="h-full" hover={false}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-obsidian dark:text-white">Budget Alerts</h3>
          <p className="text-xs text-drift dark:text-zinc-400 mt-1">Latest budget warnings</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="sm" className="bg-(--color-accent)/15 text-(--color-accent)">
            {alerts.filter((a) => !a.read).length} new
          </Badge>
          {alerts.length > 0 && (
            <Button size="sm" variant="ghost" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="text-sm text-drift dark:text-zinc-500">
          No alerts yet. You are on track.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <motion.div
              key={alert._id || alert.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 p-3 rounded-xl border ${alert.read
                ? 'bg-white/40 dark:bg-zinc-900/30 border-white/30 dark:border-zinc-800'
                : 'bg-white/70 dark:bg-zinc-900/50 border-white/50 dark:border-zinc-700'
                }`}
            >
              <div className="w-9 h-9 rounded-xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center">
                {alert.read ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Bell className="w-4 h-4 text-char dark:text-zinc-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-obsidian dark:text-white">
                  {alert.title}
                </p>
                <p className="text-xs text-drift dark:text-zinc-400 mt-1">
                  {alert.message}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
