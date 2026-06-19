import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export const PhoneShell = ({ children, keyId }) => (
  <div className="w-full max-w-md mx-auto min-h-screen sm:min-h-[860px] sm:my-6 relative bg-[#FDFBF7] sm:rounded-[2.5rem] sm:border-[10px] sm:border-white sm:shadow-[0_30px_80px_-20px_rgba(124,58,237,0.35)] overflow-hidden">
    <AnimatePresence mode="wait">
      <motion.div
        key={keyId}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </div>
);

export const PageBackdrop = ({ children }) => (
  <div className="min-h-screen w-full bg-gradient-to-br from-[#FDF2F8] via-[#FDFBF7] to-[#EDE9FE] flex items-center justify-center p-0 sm:p-4">
    {children}
  </div>
);
