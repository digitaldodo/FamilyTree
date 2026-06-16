"use client";

import { motion } from "framer-motion";
import { Activity, Plus, Edit2, Trash2, Eye, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type ActivityType = "CREATE" | "UPDATE" | "DELETE" | "VIEW";

interface ActivityFeedProps {
  activities: {
    id: string;
    type: ActivityType;
    entityType: string;
    entityName: string;
    userName: string;
    createdAt: Date;
  }[];
}

const ActivityIcon = ({ type }: { type: ActivityType }) => {
  switch (type) {
    case "CREATE": return <Plus className="w-4 h-4 text-green-500" />;
    case "UPDATE": return <Edit2 className="w-4 h-4 text-blue-500" />;
    case "DELETE": return <Trash2 className="w-4 h-4 text-red-500" />;
    case "VIEW": return <Eye className="w-4 h-4 text-purple-500" />;
    default: return <Activity className="w-4 h-4 text-muted-foreground" />;
  }
};

const ActivityBackground = (type: ActivityType) => {
  switch (type) {
    case "CREATE": return "bg-green-500/10";
    case "UPDATE": return "bg-blue-500/10";
    case "DELETE": return "bg-red-500/10";
    case "VIEW": return "bg-purple-500/10";
    default: return "bg-muted";
  }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold">Recent Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {activities.length > 0 ? (
          <div className="relative border-l border-border ml-3 pl-6 space-y-6">
            {activities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="relative"
              >
                <div className={`absolute -left-[35px] w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-card ${ActivityBackground(activity.type)}`}>
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="bg-muted/30 rounded-xl p-3 text-sm">
                  <p className="mb-1">
                    <span className="font-semibold text-foreground">{activity.userName}</span>
                    {" "}
                    {activity.type === "CREATE" ? "added a new" 
                      : activity.type === "UPDATE" ? "updated" 
                      : activity.type === "DELETE" ? "removed" 
                      : "viewed"}
                    {" "}
                    {activity.entityType.toLowerCase()}{" "}
                    <span className="font-medium text-foreground">"{activity.entityName}"</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground pb-8">
            <UserIcon className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No recent activity</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
