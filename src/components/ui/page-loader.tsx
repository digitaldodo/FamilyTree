"use client";

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4 mx-auto" />
      </motion.div>
    </div>
  );
}
