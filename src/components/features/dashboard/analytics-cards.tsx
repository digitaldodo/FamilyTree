"use client";

import { motion } from "framer-motion";
import { Users, UserPlus, Heart, Cake } from "lucide-react";

interface AnalyticsCardsProps {
  metrics: {
    totalMembers: number;
    totalGenerations: number;
    relationshipsCount: number;
    birthdaysThisMonth: number;
  };
}

export function AnalyticsCards({ metrics }: AnalyticsCardsProps) {
  const cards = [
    {
      title: "Total Members",
      value: metrics.totalMembers,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      delay: 0.1,
    },
    {
      title: "Generations",
      value: metrics.totalGenerations,
      icon: UserPlus,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      delay: 0.2,
    },
    {
      title: "Relationships",
      value: metrics.relationshipsCount,
      icon: Heart,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      delay: 0.3,
    },
    {
      title: "Upcoming Birthdays",
      value: metrics.birthdaysThisMonth,
      icon: Cake,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: card.delay }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold">{card.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
