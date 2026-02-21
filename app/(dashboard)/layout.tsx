"use client"

import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="flex h-screen bg-[#030303] text-white selection:bg-indigo-500/30 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Dynamic Matrix Background Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black pointer-events-none" />

                <Header />

                <main className="flex-1 overflow-y-auto px-8 relative scroll-smooth bg-[#0a0a0c]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, scale: 0.99, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="py-8 pb-20"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
