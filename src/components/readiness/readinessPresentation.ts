export function getProgressColor(percent: number): string {
  if (percent >= 80) return 'from-emerald-500 to-teal-500';
  if (percent >= 60) return 'from-yellow-400 to-amber-500';
  if (percent >= 40) return 'from-amber-500 to-orange-500';
  return 'from-rose-500 to-red-600';
}

export function getProgressBadge(percent: number): { label: string; color: string } {
  if (percent >= 85)
    return {
      label: 'Audit Ready',
      color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300',
    };
  if (percent >= 70)
    return {
      label: 'Substantially Ready',
      color: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300',
    };
  if (percent >= 50)
    return {
      label: 'In Progress',
      color: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-300',
    };
  return {
    label: 'Critical Gap',
    color: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300',
  };
}
