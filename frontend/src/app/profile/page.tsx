"use client";

import React, { useState, useEffect } from 'react';
import { API_BASE_BACKEND, UserWithHouse } from '../utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import the router hook
import img from "next/image";

export default function ProfilePage() {
    const [user, setUser] = useState<UserWithHouse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // Initialize the router

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_BASE_BACKEND}/api/user/`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data.');
                }
                const data = await response.json();
                setUser(data);
            } catch (err: unknown) {
                    if (err instanceof Error) {
                    setError(err.message);
                    } else {
                    setError('An unexpected error occurred.');
                    }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // NEW: useEffect to handle redirection on error or if user is not found
    useEffect(() => {
        if (!loading && (!user || error)) {
            router.push('/error-session');
        }
    }, [loading, user, error, router]);

    // While loading or preparing to redirect, show a loading message
    if (loading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-green-50">
                <p className="text-lg text-gray-600">Loading profile...</p>
            </main>
        );
    }

    // Display the profile card once data is loaded successfully
    return (
        <main className="min-h-screen w-full bg-green-50 p-8">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center">
                        <img
                            src={`${API_BASE_BACKEND}${user.profile.profile_photo}`}
                            alt="Profile"
                            className="w-32 h-32 rounded-full mx-auto border-4 border-green-200"
                        />
                        <h1 className="text-3xl font-bold text-gray-800 mt-4">
                            {user.profile.display_name}
                        </h1>
                        <p className="text-gray-500">@{user.username}</p>
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-center text-gray-700">
                                <svg className="h-6 w-6 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <svg className="h-6 w-6 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{user.profile.phone_number}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Household</h2>
                        <div className="flex items-center text-gray-700">
                            <svg className="h-6 w-6 mr-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>{user.house?.name || 'Not in a house'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-8">
                <Link href="/home" className="text-green-600 hover:text-green-800 font-semibold">
                    &larr; Back to Dashboard
                </Link>
            </div>
        </main>
    );
}