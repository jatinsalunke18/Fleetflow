"use client"

import { useActionState } from "react"
import { authenticate } from "@/lib/actions"
import { motion } from "framer-motion"
import { Truck, Shield, Lock, Mail } from "lucide-react"

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative selection:bg-indigo-500/30">

            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 w-full h-full bg-[#030303] flex items-center justify-center">
                <div className="absolute w-[800px] h-[800px] border border-white/5 rounded-full animate-spin-slow" style={{ animationDuration: '40s' }} />
                <div className="absolute w-[600px] h-[600px] border border-white/[0.08] rounded-full animate-spin-slow" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-indigo-900/10 mix-blend-screen pointer-events-none" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/[0.03] border border-white/[0.08] p-10 rounded-3xl shadow-2xl backdrop-blur-3xl overflow-hidden relative">

                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                    <div className="flex flex-col items-center justify-center mb-10">
                        <motion.div
                            initial={{ rotate: -15, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20"
                        >
                            <Truck className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight">
                            FleetFlow
                        </h1>
                        <p className="text-sm text-gray-400 mt-2 font-medium">Control Center Authentication</p>
                    </div>

                    <form action={dispatch} className="flex flex-col gap-5">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors group-hover:text-indigo-400" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="system@fleetflow.com"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors group-hover:text-indigo-400" />
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                min={6}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <p className="text-right text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors cursor-pointer">
                            Forgot authorization key?
                        </p>

                        <button
                            disabled={isPending}
                            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                        >
                            {isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    Authenticate System
                                </>
                            )}
                        </button>

                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl flex items-center justify-center"
                            >
                                {errorMessage}
                            </motion.div>
                        )}
                    </form>
                </div>

                <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-gray-600 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    System Operational • v2.0.4
                </div>
            </motion.div>
        </div>
    )
}
