export const GUEST_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const guestFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const guestFadeUpViewport = {
  once: true,
  margin: "-8% 0px -6% 0px" as const,
  amount: 0.35 as const,
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
