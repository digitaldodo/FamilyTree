"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "@/store/use-notification-store";
import { Bell, Check, Info, AlertTriangle, XCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <Check className="w-4 h-4 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <button onClick={markAllAsRead} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Mark all read
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 flex gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-2">
                            {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-border bg-muted/30 text-center">
                  <button 
                    onClick={clearAll}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center justify-center gap-1 w-full"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
