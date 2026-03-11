// src/app/page.tsx

"use client";

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import img from "next/image";

// You can get these icons from a library like lucide-react, or use them as is.
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

const FeatureIcon1 = () => ( // Chore Chart Icon
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const FeatureIcon2 = () => ( // Expense Tracker Icon
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const FeatureIcon3 = () => ( // Shared Calendar Icon
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);


export default function LandingPage() {
    const features = [
        {
            icon: <FeatureIcon1 />,
            title: "Organized Chores",
            description: "Create, assign, and track household chores with a simple, shared task list.",
        },
        {
            icon: <FeatureIcon2 />,
            title: "Transparent Expenses",
            description: "Split bills and track shared expenses easily. No more awkward money conversations.",
        },
        {
            icon: <FeatureIcon3 />,
            title: "Synced Schedules",
            description: "A shared calendar for house events, guest visits, or maintenance appointments.",
        },
    ];

    // Apply the 'Variants' type here to fix the TypeScript error
    const FADE_IN_ANIMATION_VARIANTS: Variants = {
        hidden: { opacity: 0, y: -10 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' } },
    };

    return (
        <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white antialiased">
            {/* The logo no longer needs its own div, it's part of the motion.div flow */}

            {/* Use our clean custom classes for the aurora effect */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 h-full w-full bg-aurora-green"></div>
                <div className="absolute bottom-0 left-0 h-full w-full bg-aurora-blue"></div>
            </div>

            <motion.div
                initial="hidden"
                animate="show"
                viewport={{ once: true }}
                variants={{
                    hidden: {},
                    show: {
                        transition: {
                            staggerChildren: 0.15,
                        },
                    },
                }}
                className="flex flex-col items-center justify-center space-y-8 px-4 text-center"
            >
                <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
                    <img
                        src="/logo.png"
                        alt="Housify Logo"
                        width={200}
                        height={200}
                        className="mx-auto"
                    />
                </motion.div>

                {/* Main Hero Section */}
                <motion.div variants={FADE_IN_ANIMATION_VARIANTS} className="mb-4 rounded-full border border-gray-300 bg-white/50 px-4 py-1.5 text-sm text-gray-600 shadow-sm backdrop-blur-md">
                    Your Shared Home, Simplified.
                </motion.div>
                <motion.h1
                    variants={FADE_IN_ANIMATION_VARIANTS}
                    className="max-w-4xl bg-gradient-to-br from-black to-gray-600 bg-clip-text text-5xl font-bold text-transparent md:text-7xl -mt-4"
                >
                    Housify
                </motion.h1>
                <motion.p
                    variants={FADE_IN_ANIMATION_VARIANTS}
                    className="max-w-xl text-lg text-gray-700 md:text-xl"
                >
                    From chores to expenses, Housify is the central hub that keeps your shared living space organized and stress-free.
                </motion.p>
                <motion.div variants={FADE_IN_ANIMATION_VARIANTS}>
                    <Link
                        href="/login"
                        className="group inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-800 hover:shadow-xl hover:scale-105"
                    >
                        Get Started for Free
                        <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </motion.div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="grid w-full max-w-5xl grid-cols-1 gap-6 pt-16 md:grid-cols-3"
                >
                    {features.map((feature, i) => (
                        <div key={i} className="rounded-xl border border-gray-200/80 bg-white/40 p-6 text-left shadow-md backdrop-blur-lg">
                            <div className="mb-4 text-green-700">{feature.icon}</div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </main>
    );
}