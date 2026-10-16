'use client';

// RareUI AnimatedTab, restyled to the Alldrive palette (primary pill instead of black/white)
// and given a per instance layout id so several tab bars can live on one page.

import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const layoutId = useId();

  return (
    <div
      role="tablist"
      className={cn(
        'flex flex-row flex-nowrap items-center gap-1 rounded-full p-1',
        'bg-card/80 backdrop-blur-xl',
        'border border-border',
        'shadow-sm',
        'max-w-full overflow-x-auto [scrollbar-width:none]',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isHovered = hoveredTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'relative z-10 cursor-pointer rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4',
              isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId={`${layoutId}-active`}
                className="absolute inset-0 z-[-1] rounded-full bg-primary shadow-md shadow-primary/25"
                transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
              />
            )}

            {isHovered && !isActive && (
              <motion.div
                layoutId={`${layoutId}-hover`}
                className="absolute inset-0 z-[-1] rounded-full bg-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            )}

            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default AnimatedTabs;
