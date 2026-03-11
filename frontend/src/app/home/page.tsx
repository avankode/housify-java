

"use client";

import React, { useState, useEffect , Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import {API_BASE_BACKEND, getCookie} from "@/src/app/utils";
import Link from 'next/link';

const DashboardTile = ({ title, color, href, children }: {
    title: string;
    color: string;
    href: string;
    children: React.ReactNode;
}) => (
    <Link href={href} className="flex-1">
        <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-lg p-8 transform transition-transform duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer">
            <div className={`w-32 h-32 ${color}`}>
                {children}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">{title}</h2>
        </div>
    </Link>
);
// Interface definitions remain the same
interface House {
    id: number;
    name: string;
}
interface UserWithHouse {
    username: string;
    email: string;
    house: House | null;
}

function HomeContent() {
    const [userData, setUserData] = useState<UserWithHouse | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAnimation, setShowAnimation] = useState(false);
    const [animationPhase, setAnimationPhase] = useState('hidden');

    const searchParams = useSearchParams();
    const router = useRouter();

    // The login bug from your original code is also fixed here.
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_BASE_BACKEND}/api/user/`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    if (searchParams.get('new') === 'true') {
                        setShowAnimation(true);
                    }
                } else {
                    // This correctly redirects only if the user isn't logged in
                    router.push('/');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [router, searchParams]);


    // Animation effect remains the same
    useEffect(() => {
        if (showAnimation) {
            const visibleTimer = setTimeout(() => setAnimationPhase('visible'), 100);
            const fadeTimer = setTimeout(() => setAnimationPhase('fading'), 3000);
            const hideTimer = setTimeout(() => setShowAnimation(false), 4000);

            return () => {
                clearTimeout(visibleTimer);
                clearTimeout(fadeTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [showAnimation]);

    // Redirect effect remains the same
    useEffect(() => {
        if (!loading && userData && !userData.house) {
            router.push('/error-session');
        }
    }, [loading, userData, router]);

    // NEW: Function to handle user sign-out
    const handleLogout = async () => {
        try {
            // Call your backend logout endpoint. Adjust the URL if it's different.
            await fetch(`${API_BASE_BACKEND}/api/logout/`, {
                method: 'POST',
                credentials: 'include', // Important to send the session cookie
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            router.push('/login');
        }
    };

    if (loading) {
        return <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100"><p>Loading...</p></main>;
    }

    // Guard clause to prevent rendering while redirecting
    if (!userData || !userData.house) {
        return null;
    }

    return (
        <Layout houseName={userData.house.name} onLogout={handleLogout}>
            {showAnimation && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-gray-100 bg-opacity-100">
                    <h1 className={`text-4xl font-bold text-gray-800 transition-all duration-1000 ${
                        animationPhase === 'visible' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
                    }`}
                    >
                        Hey, {userData.username}! Welcome to {userData.house.name}!
                    </h1>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0 h-[calc(100vh-200px)]">

                {/* Tile 1: Laundry */}
                <DashboardTile title="Laundrify" color="text-blue-800" href="/laundry">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3H20.25M3.75 3h16.5M3.75 8.25h16.5M3.75 12h16.5m-16.5 4.5h16.5M3.75 3a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 003.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0020.25 3" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12a.75.75 0 000-1.5H12a.75.75 0 000 1.5h2.25z" />
                    </svg>
                </DashboardTile>

                {/* Tile 2: Queues */}
                <DashboardTile title="Queify" color="text-purple-800" href="/queues">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-.668-.287-1.265-.77-1.684l-4.5-4.5a2.25 2.25 0 00-1.683-.77H6.108c-.668 0-1.265.287-1.684.77l-4.5 4.5A2.25 2.25 0 00.75 6.108v11.142c0 .668.287 1.265.77 1.684l4.5 4.5a2.25 2.25 0 001.683.77h3.75" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75V9h5.25V3.75" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12h.008v.008H5.25V12zm0 3h.008v.008H5.25v-3zm0 3h.008v.008H5.25v-3z" />
                    </svg>
                </DashboardTile>

                {/* Tile 3: Expenses */}
                <DashboardTile title="Expensify" color="text-yellow-500" href="/expenses">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-1.571 4.006-.713l.879.659" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
                    </svg>
                </DashboardTile>

            </div>
        </Layout>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <HomeContent />
        </Suspense>
    );
}