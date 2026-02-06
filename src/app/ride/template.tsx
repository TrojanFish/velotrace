"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function RideTemplate({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.4,
                ease: "easeOut"
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}
