import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <div className="max-w-md mx-auto min-h-[100dvh] flex flex-col pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(80px+env(safe-area-inset-bottom,24px))] px-4 overflow-x-hidden transform-gpu">
                {children}
            </div>
            <Navigation />
        </>
    );
}
