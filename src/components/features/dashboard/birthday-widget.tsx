"use client";

import { motion } from "framer-motion";
import { Cake, Calendar } from "lucide-react";

interface BirthdayWidgetProps {
  birthdays: {
    id: string;
    name: string;
    date: Date;
    ageTurning: number;
    daysRemaining: number;
    avatar?: string | null;
  }[];
}

export function BirthdayWidget({ birthdays }: BirthdayWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full"
    >
      <div className="flex items-center gap-2 mb-6">
        <Cake className="w-5 h-5 text-amber-500" />
        <h3 className="text-xl font-semibold">Upcoming Birthdays</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {birthdays.length > 0 ? (
          birthdays.map((birthday, i) => (
            <motion.div
              key={birthday.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {birthday.avatar ? (
                  <img src={birthday.avatar} alt={birthday.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-primary">{birthday.name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{birthday.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Turning {birthday.ageTurning}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="inline-block px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full">
                  {birthday.daysRemaining === 0 
                    ? "Today!" 
                    : birthday.daysRemaining === 1 
                      ? "Tomorrow" 
                      : `In ${birthday.daysRemaining} days`}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Cake className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No upcoming birthdays this month</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
