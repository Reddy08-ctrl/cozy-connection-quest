
import { AnimationProps } from 'framer-motion';

export const fadeIn: AnimationProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 }
};

export const slideUp: AnimationProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
};

export const slideDown: AnimationProps = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.5 }
};

export const slideLeft: AnimationProps = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.5 }
};

export const slideRight: AnimationProps = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.5 }
};

export const scaleIn: AnimationProps = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 },
  transition: { duration: 0.4 }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const mobileNavVariants = {
  closed: {
    opacity: 0,
    y: "-100%",
    transition: {
      y: { stiffness: 1000 }
    }
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  }
};

export const pageTransitions = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -8,
  },
  transition: {
    duration: 0.5,
  },
};

export const buttonHoverAnimation = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 }
};
