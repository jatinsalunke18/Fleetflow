"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const generateTitle = () => {
        if (pathname.includes('/dashboard')) return "Command Center Overview"
        if (pathname.includes('/vehicles')) return "Vehicle Asset Registry"
        if (pathname.includes('/trips')) return "Trip & Dispatch Control"
        if (pathname.includes('/maintenance')) return "Maintenance Tracking"
        if (pathname.includes('/fuel')) return "Fuel & Operational Spend"
        if (pathname.includes('/analytics')) return "Financial & Operations Analytics"
        if (pathname.includes('/drivers')) return "Driver Compliance & Safety"
        return "FleetFlow Control Center"
    }

    return (
        <header className="h-20 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-tight">{generateTitle()}</h1>
                <p className="text-xs text-gray-400 font-medium">Real-time Synchronization Active</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search assets, trips, drivers..."
                        className="w-64 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 border-l border-white/5 pl-6">
                    <button className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#09090b]"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-2">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-white">{session?.user?.name || "System User"}</span>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">{session?.user?.role || "Operator"}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20" />
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all ml-2"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    )
}
