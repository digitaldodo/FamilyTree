'use client';

import { useState } from 'react';
import { useNotificationStore } from '@/store/use-notification-store';
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'ERROR':
        return <XCircle className="w-3.5 h-3.5 text-destructive" />;
      default:
        return <Info className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-foreground rounded-full" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-1.5 w-80 sm:w-88 bg-popover border border-border rounded-md shadow-md z-50 overflow-hidden animate-in fade-in-0 zoom-in-95"
          >
            <div className="px-3.5 py-2.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-foreground">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="muted" className="text-[10px] px-1.5 py-0">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-3 flex gap-2.5 hover:bg-muted/50 transition-colors cursor-pointer text-xs ${
                      !notif.read ? 'bg-muted/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium ${
                          !notif.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                        {formatDistanceToNow(notif.createdAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-1" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground flex flex-col items-center">
                  <Bell className="w-5 h-5 mb-2 opacity-30" />
                  <p className="text-xs">No new notifications</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-t border-border bg-muted/20 text-center">
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1.5 w-full cursor-pointer py-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
