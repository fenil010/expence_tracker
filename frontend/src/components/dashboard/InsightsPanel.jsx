import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { Card, Badge } from '../ui';
import { formatCurrency } from '../../utils/currencies';

const iconMap = {
  trend: TrendingUp,
  budget: AlertTriangle,
  category: Sparkles,
  merchant: Sparkles,
  transaction: Sparkles,
  info: Lightbulb,
};

const severityStyles = {
  info: 'bg-sand/50 dark:bg-zinc-800 text-drift dark:text-zinc-400',
  warning: 'bg-amber-50/60 dark:bg-amber-950/40 text-amber-800/70 dark:text-amber-400',
  critical: 'bg-red-50/60 dark:bg-red-950/40 text-red-800/70 dark:text-red-400',
};

export default function InsightsPanel({ insights = [] }) {
  return (
    <Card className="h-full" hover={false}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-obsidian dark:text-white">AI Insights</h3>
          <p className="text-xs text-drift dark:text-zinc-400 mt-1">Smart highlights from your spending</p>
        </div>
        <Lightbulb className="w-4 h-4 text-drift dark:text-zinc-400" />
      </div>

      {insights.length === 0 ? (
        <div className="text-sm text-drift dark:text-zinc-500">
          Add more transactions to unlock insights.
        </div>
      ) : (
        <div className="space-y-3">
          {insights.slice(0, 4).map((insight) => {
            const Icon = iconMap[insight.type] || Lightbulb;
            const badgeClass = severityStyles[insight.severity] || severityStyles.info;
            const amount = insight?.data?.amountInBaseCurrency;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-zinc-900/40 border border-white/40 dark:border-zinc-800"
              >
                <div className="w-9 h-9 rounded-xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-char dark:text-zinc-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-obsidian dark:text-white truncate">
                      {insight.title}
                    </p>
                    <Badge size="sm" className={badgeClass}>
                      {insight.severity || 'info'}
                    </Badge>
                  </div>
                  <p className="text-xs text-drift dark:text-zinc-400 mt-1">
                    {insight.description}
                  </p>
                  {typeof amount === 'number' && (
                    <p className="text-xs text-char dark:text-zinc-300 mt-2">
                      Amount: {formatCurrency(amount)}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
