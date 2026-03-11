"use client";

import React from 'react';
import Link from 'next/link';

export default function UserHouseDeletedPage() {
    console.log("HOW DID THIS HAPPEN TO ME");
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-8 text-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <svg className="w-16 h-16 mx-auto text-yellow-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h1 className="mb-4 text-3xl font-bold text-gray-800">You&apos;re no longer in a house</h1>
                <p className="mb-8 text-gray-600">
                    It looks like the house you were a member of has been deleted by the admin, or you have been removed.
                </p>
                <Link
                    href="/onboarding-house"
                    className="inline-block w-full rounded-md bg-black px-6 py-3 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105"
                >
                    Create or Join a New House
                </Link>
            </div>
        </main>
    );
}