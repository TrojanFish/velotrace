"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.98, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -8 }}
                transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 1
                }}
                className="w-full flex-1"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
