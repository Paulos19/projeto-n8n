export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: i * 0.05, duration: 0.6, ease: "easeOut" },
  }),
};

export const cardItemAnimation = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const cardContainerAnimation = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const interactiveElementHover = {
  rest: { scale: 1, boxShadow: "0px 4px 10px rgba(0,0,0,0.05)" },
  hover: {
    scale: 1.03,
    boxShadow: "0px 6px 20px rgba(59, 130, 246, 0.25), 0 0 15px rgba(45, 212, 191, 0.15)",
    transition: { duration: 0.2, type: "spring", stiffness: 400, damping: 15 }
  }
};

export const buttonHoverEffect = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    // O boxShadow pode ser aplicado diretamente no componente Button do shadcn/ui
    transition: { type: "spring", stiffness: 300, damping: 10 }
  },
  tap: { scale: 0.95 }
};