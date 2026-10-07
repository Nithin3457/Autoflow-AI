export function formatRelativeTime(dateString) {
  if (!dateString) return 'N/A';
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now.getTime() - past.getTime();
  const isFuture = diffInMs < 0;
  const absDiff = Math.abs(diffInMs);

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (isFuture) {
    if (minutes < 1) return 'in a few seconds';
    if (minutes < 60) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h ${minutes % 60}m`;
    return `in ${days}d`;
  } else {
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function calculateSLA(deadlineString, taskStatus, completedAt) {
  if (!deadlineString) return { status: 'SAFE', label: 'No SLA', diffHours: 0 };

  const now = new Date().getTime();
  const deadline = new Date(deadlineString).getTime();
  const diffHours = (deadline - now) / 3600000;

  if (taskStatus === 'COMPLETED') {
    const completedTime = new Date(completedAt || now).getTime();
    const met = completedTime <= deadline;
    return {
      status: met ? 'MET' : 'BREACHED',
      label: met ? 'SLA Met' : 'SLA Breached',
      diffHours: 0,
      badgeClass: met
        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
        : 'bg-rose-950/70 text-rose-300 border-rose-700/50'
    };
  }

  if (diffHours < 0) {
    const overdueHours = Math.abs(diffHours).toFixed(1);
    return {
      status: 'BREACHED',
      label: `Breached (${overdueHours}h overdue)`,
      diffHours,
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-600/70 animate-pulse'
    };
  } else if (diffHours < 2) {
    const remainingMinutes = Math.round(diffHours * 60);
    return {
      status: 'WARNING',
      label: `Expiring Soon (${remainingMinutes}m left)`,
      diffHours,
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-600/70'
    };
  } else {
    const hoursLeft = Math.round(diffHours);
    return {
      status: 'SAFE',
      label: `${hoursLeft}h remaining`,
      diffHours,
      badgeClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
    };
  }
}
