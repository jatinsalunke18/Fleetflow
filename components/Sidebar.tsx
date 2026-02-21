"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, Truck, MapPin, Wrench, BarChart3, Users, PanelLeftClose, PanelLeftOpen, Fuel } from "lucide-react"
import { useSession } from "next-auth/react"

const navigation = [
    { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Vehicle Registry', href: '/vehicles', icon: Truck, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { name: 'Trip Dispatcher', href: '/trips', icon: MapPin, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
    { name: 'Driver Safety', href: '/drivers', icon: Users, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer'] },
    { name: 'Fuel & Expenses', href: '/fuel', icon: Fuel, roles: ['Fleet Manager', 'Financial Analyst'] },
    { name: 'Reports & ROI', href: '/analytics', icon: BarChart3, roles: ['Fleet Manager', 'Financial Analyst'] },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const [collapsed, setCollapsed] = useState(false)

    const userRole = session?.user?.role || (status === "loading" ? "" : "Dispatcher")
    const filteredNav = status === "loading" ? [] : navigation.filter(item => item.roles.includes(userRole))

    return (
        <motion.div
            animate={{ width: collapsed ? 80 : 280 }}
            className="h-screen bg-[#030303] border-r border-white/5 flex flex-col relative z-20 shrink-0 select-none overflow-hidden"
        >
            <div className="p-6 flex items-center justify-between">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Truck className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white tracking-tight">FleetFlow</span>
                    </motion.div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>

            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {!collapsed && "Platform Tracking"}
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto hidden-scrollbar">
                {filteredNav.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative ${isActive
                                ? 'text-white bg-indigo-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent border-l-2 border-indigo-500 rounded-xl rounded-l-sm pointer-events-none"
                                />
                            )}
                            <item.icon className="w-5 h-5 shrink-0 z-10" />
                            {!collapsed && (
                                <span className="text-sm font-medium z-10">{item.name}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 mt-auto">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5"
                >
                    {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                    {!collapsed && <span className="text-sm font-medium">Collapse</span>}
                </button>
            </div>
        </motion.div>
    )
}
