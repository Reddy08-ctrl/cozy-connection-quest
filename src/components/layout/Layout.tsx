
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <motion.div
      className="min-h-screen w-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        {children}
      </main>
    </motion.div>
  );
};

export default Layout;
