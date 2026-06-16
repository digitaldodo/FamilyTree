"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Heart, UserPlus, FileText, Star } from "lucide-react";

export type TimelineEventType = "BIRTH" | "MARRIAGE" | "DEATH" | "CUSTOM";

export interface TimelineEventProps {
  event: {
    id: string;
    type: TimelineEventType;
    title: string;
    description?: string;
    date: Date;
    members: { id: string; name: string; avatar?: string | null }[];
  };
  index: number;
}

const getEventIcon = (type: TimelineEventType) => {
  switch (type) {
    case "BIRTH": return <UserPlus className="w-5 h-5 text-blue-500" />;
    case "MARRIAGE": return <Heart className="w-5 h-5 text-pink-500" />;
    case "DEATH": return <FileText className="w-5 h-5 text-gray-500" />;
    case "CUSTOM": return <Star className="w-5 h-5 text-amber-500" />;
  }
};

const getEventBg = (type: TimelineEventType) => {
  switch (type) {
    case "BIRTH": return "bg-blue-500/10 ring-blue-500/20";
    case "MARRIAGE": return "bg-pink-500/10 ring-pink-500/20";
    case "DEATH": return "bg-gray-500/10 ring-gray-500/20";
    case "CUSTOM": return "bg-amber-500/10 ring-amber-500/20";
  }
};

export function TimelineEvent({ event, index }: TimelineEventProps) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`relative flex items-center justify-between md:justify-normal w-full mb-12 ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* Center timeline dot */}
      <div className="absolute left-4 md:left-1/2 w-10 h-10 -translate-x-1/2 rounded-full ring-4 ring-card bg-background flex items-center justify-center z-10 shadow-sm">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventBg(event.type)}`}>
          {getEventIcon(event.type)}
        </div>
      </div>

      {/* Content */}
      <div className={`w-full md:w-5/12 ml-14 md:ml-0 ${isEven ? 'md:pr-14 md:text-right' : 'md:pl-14'}`}>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
          {/* Connector line from box to center dot for desktop */}
          <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-14 border-t-2 border-border/50 border-dashed ${isEven ? '-right-14' : '-left-14'}`} />
          
          <div className="flex flex-col gap-1 mb-3">
            <span className="text-sm font-semibold text-primary">
              {format(new Date(event.date), "MMMM d, yyyy")}
            </span>
            <h3 className="text-xl font-bold">{event.title}</h3>
          </div>
          
          {event.description && (
            <p className="text-muted-foreground mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
              {event.description}
            </p>
          )}

          <div className={`flex items-center gap-2 mt-4 ${isEven ? 'md:justify-end' : ''}`}>
            <div className="flex -space-x-2">
              {event.members.map((member) => (
                <div key={member.id} className="w-8 h-8 rounded-full ring-2 ring-card bg-muted flex items-center justify-center overflow-hidden" title={member.name}>
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium">{member.name[0]}</span>
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              {event.members.length} {event.members.length === 1 ? 'member' : 'members'} involved
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
