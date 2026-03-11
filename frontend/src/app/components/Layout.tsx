"use client";

// --- 1. Import your new modal component ---
import React, { useState } from 'react';
import Link from 'next/link';
import img from 'next/image'; // This import is unused, your code uses <img>
import InviteCodeModal from './InviteCodeModal'; // Assuming it's in the same /components folder
import { API_BASE_BACKEND, API_BASE_FRONTEND, getCookie } from '../utils';
import toast, { Toaster } from 'react-hot-toast';


const Layout = ({ children, houseName, onLogout }: {
    children: React.ReactNode;
    houseName: string;
    onLogout?: () => void;
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // --- 2. Add state for the new invite modal ---
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    // This new function handles closing the drawer AND opening the modal
    const handleInviteClick = () => {
        setIsDrawerOpen(false);
        setIsInviteModalOpen(true);
    };
    const handleCopyInviteLink = async() => {
        try{
                const response = await fetch(`${API_BASE_BACKEND}/api/houses/create-invite/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                body: JSON.stringify({ invite_type : 'LINK' }),
            });        
            if (!response.ok) throw new Error('Failed to generate link');

            const data = await response.json();
            const inviteCode = data.code;

            // 2. Build the full frontend URL
            const inviteUrl = `${API_BASE_FRONTEND}/join?invite_code=${inviteCode}`;
            console.log("this is the link ",inviteUrl);
            // 3. Copy to clipboard
            await navigator.clipboard.writeText(inviteUrl);
            toast.success("Invite link copied to clipboard!");
            setIsDrawerOpen(false);
        } catch (err) {
            console.error("Error copying invite link:", err);
            toast.error("Could not generate invite link. Are you the admin?");
        }
    };

    return (
        <div className="min-h-screen w-full bg-green-50">
            <Toaster position="top-center" />
            <header className="bg-white shadow-md">
                <nav className="container mx-auto px-4 py-2">
                    <div className="grid grid-cols-3 items-center">

                        {/* 1. Left Column: Logo */}
                        <div className="justify-self-start">
                            <Link href="/home">
                                <img
                                    src="/logo.png"
                                    alt="Housify Logo"
                                    className="h-16 w-15 cursor-pointer"
                                />
                            </Link>
                        </div>

                        {/* 2. Center Column: House Name */}
                        <div className="text-center">
                            <h1 className="text-xl font-semibold text-gray-800">
                                {houseName}
                            </h1>
                        </div>

                        {/* 3. Right Column: Drawer Button */}
                        <div className="justify-self-end">
                            <button
                                onClick={() => setIsDrawerOpen(true)}
                                className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                aria-label="Open menu"
                            >
                                <svg className="h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                    </div>
                </nav>
            </header>

            <main >
                {children}
            </main>

            {/* Backdrop for Drawer */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsDrawerOpen(false)}
            ></div>

            {/* Drawer Content */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Menu</h2>
                    <nav className="flex flex-col space-y-4">
                        <Link href="/profile" onClick={() => setIsDrawerOpen(false)} className="flex items-center text-lg text-gray-700 hover:text-green-600 py-2 rounded-md hover:bg-gray-100">
                            {/* ... (Profile icon) ... */}
                            Profile
                        </Link>

                        <Link href="/settings" onClick={() => setIsDrawerOpen(false)} className="flex items-center text-lg text-gray-700 hover:text-green-600 py-2 rounded-md hover:bg-gray-100">
                            {/* ... (Settings icon) ... */}
                            Settings
                        </Link>

                        {/* --- 3. Add the "Invite Code" button here --- */}
                        <button
                            onClick={handleInviteClick}
                            className="flex items-center text-lg text-gray-700 hover:text-green-600 w-full text-left py-2 rounded-md hover:bg-gray-100"
                        >
                            <svg className="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Invite Code
                        </button>
                        <button
                            onClick={handleCopyInviteLink}
                            className="flex items-center text-lg text-gray-700 hover:text-green-600 w-full text-left py-2 rounded-md hover:bg-gray-100"
                        >
                            {/* (Link Icon) */}
                            <svg className="h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                            </svg>
                            Copy Invite Link
                        </button>                        
                        {/* --- End of new button --- */}

                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="flex items-center text-lg text-gray-700 hover:text-green-600 w-full text-left py-2 rounded-md hover:bg-gray-100"
                            >
                                {/* ... (Sign Out icon) ... */}
                                Sign Out
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* --- 4. Render the modal (it's invisible until state is true) --- */}
            {isInviteModalOpen && (
                <InviteCodeModal onClose={() => setIsInviteModalOpen(false)} />
            )}
        </div>
    );
};

export default Layout;