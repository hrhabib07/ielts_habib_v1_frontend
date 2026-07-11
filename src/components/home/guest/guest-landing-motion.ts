export const GUEST_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const guestFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const guestFadeUpViewport = {
  once: true,
  amount: 0.2 as const,
};

export const guestStaggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

export const guestStaggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: GUEST_EASE },
  },
};

export const guestHiwLineReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: GUEST_EASE },
  },
};
