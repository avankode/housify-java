"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function SessionErrorPage() {
    const router = useRouter();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
                <h1 className="text-3xl font-bold text-red-600">Session Timed Out</h1>
                <p className="mt-4 mb-8 text-gray-600">
                    Your session has expired. Please log in again to continue.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="w-full rounded-md bg-black px-6 py-3 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105"
                >
                    Return to Login
                </button>
            </div>
        </main>
    );
}