// frontend/app/components/LoginPage.tsx

"use client";

import React from 'react';
import img from "next/image";
import { API_BASE_BACKEND } from '../utils';
const LoginPage = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-2xl">
                <img
                    src="/logo.png"
                    alt="Housify Logo"
                    width={200}
                    height={200}
                    className="mx-auto"
                />
                <h1 className="-mt-4 mb-2 text-3xl font-bold text-gray-900">
                    Welcome to <span className="text-green-600">Housify</span>
                </h1>
                <p className="mb-8 text-gray-600">Your shared home, simplified.</p>
                <a
                    href={`${API_BASE_BACKEND}/accounts/google/login/`}
                    className="group inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-3 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105"
                >
                    <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        {/* Google Icon SVG Paths */}
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.657-11.127-8.481l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.856 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
                    </svg>
                    Sign In with Google
                </a>
            </div>
        </main>
    );
};

export default LoginPage;