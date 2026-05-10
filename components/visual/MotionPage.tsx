"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type MotionPageProps = {
  children: ReactNode;
  className?: string;
  /** Fade-Dauer in Sekunden (default 0.45) */
  duration?: number;
};

/**
 * Wrapper für sanfte Page-/Section-Transitions.
 * Respektiert prefers-reduced-motion vollständig: bei reduce wird einfach gerendert.
 */
export function MotionPage({ children, className, duration = 0.45 }: MotionPageProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerChildren?: number;
};

/**
 * Container, der Children gestaffelt einblendet.
 * Verwendet zusammen mit MotionItem als direkte Kinder.
 */
export function MotionStagger({
  children,
  className,
  delay = 0.1,
  staggerChildren = 0.08,
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 1 },
        show: {
          opacity: 1,
          transition: { delayChildren: delay, staggerChildren },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type ItemProps = {
  children: ReactNode;
  className?: string;
};

export function MotionItem({ children, className }: ItemProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
