export interface NotificationTone {
  accent: string;
  badge: string;
  chipLabel: string;
  iconColor: string;
}

export type NotificationDeliveryMode = 'browser' | 'panel';

export interface NotificationDeliveryOptions {
  supportsBrowserNotifications: boolean;
  permission?: NotificationPermission | string;
}

export const resolveNotificationBehavior = ({ supportsBrowserNotifications, permission = 'default' }: NotificationDeliveryOptions): NotificationDeliveryMode => {
  if (supportsBrowserNotifications && permission === 'granted') {
    return 'browser';
  }

  return 'panel';
};

export const getNotificationTone = (type: string, read: boolean): NotificationTone => {
  const base = read ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white border-slate-200 shadow-sm';

  switch (type) {
    case 'booking_confirmed':
      return {
        accent: `${base} border-emerald-200`,
        badge: 'bg-emerald-100 text-emerald-700',
        chipLabel: 'Booking',
        iconColor: 'text-emerald-600'
      };
    case 'booking_cancelled':
      return {
        accent: `${base} border-rose-200`,
        badge: 'bg-rose-100 text-rose-700',
        chipLabel: 'Cancelled',
        iconColor: 'text-rose-600'
      };
    case 'promotion':
      return {
        accent: `${base} border-amber-200`,
        badge: 'bg-amber-100 text-amber-700',
        chipLabel: 'Offer',
        iconColor: 'text-amber-600'
      };
    case 'invitation':
      return {
        accent: `${base} border-blue-200`,
        badge: 'bg-blue-100 text-blue-700',
        chipLabel: 'Invite',
        iconColor: 'text-blue-600'
      };
    default:
      return {
        accent: `${base} border-slate-200`,
        badge: 'bg-slate-100 text-slate-700',
        chipLabel: 'Update',
        iconColor: 'text-slate-600'
      };
  }
};

export const formatNotificationTime = (value: string) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Just now';

  const diffMinutes = Math.round((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};
