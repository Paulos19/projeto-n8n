"use client";
import { motion, AnimatePresence } from "framer-motion";
import { NavLinks } from "./NavLinks";
import { LoginButton } from "./LoginButton";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  navLinks: NavLink[];
  status: "authenticated" | "loading" | "unauthenticated";
  setIsOpen: (isOpen: boolean) => void;
}

const menuVariants = {
  hidden: { opacity: 0, height: 0, y: -20, transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.05, staggerDirection: -1 } },
  visible: { opacity: 1, height: "auto", y: 0, transition: { type: "spring", stiffness: 300, damping: 25, staggerChildren: 0.07, delayChildren: 0.1 } },
};


export function MobileMenu({ isOpen, navLinks, status, setIsOpen }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="md:hidden absolute top-full left-0 right-0 bg-background/95 dark:bg-background/95 backdrop-blur-md shadow-xl pb-4 border-t border-border/60 overflow-hidden"
          initial="hidden"
          animate="visible"
          exit="hidden" 
          variants={menuVariants}
        >
          <div className="px-4 pt-4 pb-2 space-y-3"> {}
            <NavLinks
              links={navLinks}
              onLinkClick={() => setIsOpen(false)}
              isMobile
              className="space-y-2" 
            />
            {status === "unauthenticated" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pt-3 border-t border-border/60 mt-3" 
              >
                <LoginButton isMobile onClick={() => setIsOpen(false)} />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}