"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";

interface GenerationChartProps {
  data: {
    generation: string;
    members: number;
  }[];
}

export function GenerationChart({ data }: GenerationChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const strokeColor = isDark ? "#8b5cf6" : "#6d28d9";
  const fillColor = isDark ? "#8b5cf6" : "#6d28d9";

  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm w-full h-[400px] flex flex-col"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Generational Distribution</h3>
        <p className="text-sm text-muted-foreground">Number of members across generations</p>
      </div>
      
      <div ref={containerRef} className="flex-1 w-full min-h-[300px]">
        {mounted && dimensions.width > 0 && dimensions.height > 0 && (
            <AreaChart data={data} width={dimensions.width} height={dimensions.height} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#e5e7eb"} />
              <XAxis 
                dataKey="generation" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  borderColor: isDark ? "#374151" : "#e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
                itemStyle={{ color: isDark ? "#e5e7eb" : "#111827" }}
              />
              <Area 
                type="monotone" 
                dataKey="members" 
                stroke={strokeColor} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorMembers)" 
              />
            </AreaChart>
        )}
      </div>
    </motion.div>
  );
}
