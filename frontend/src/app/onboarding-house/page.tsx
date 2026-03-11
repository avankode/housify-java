"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_BACKEND, getCookie } from '../utils';
import img from "next/image";
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

// --- Child Component: CreateHouse ---
// This is the component you provided, with a few modifications.

const CreateHouse = ({ showChoiceView }: { showChoiceView: () => void; }) => {
    const [houseName, setHouseName] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        // ... (The AI suggestion logic remains unchanged)
        if (houseName.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsSuggesting(true);
        setSuggestionError(false);
        const handler = setTimeout(() => {
            fetch(`${API_BASE_BACKEND}/api/houses/suggest-name/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
                body: JSON.stringify({ name: houseName }),
            })
                .then(res => {
                    if (!res.ok) throw new Error('Backend responded with an error');
                    return res.json();
                })
                .then(data => setSuggestions(data.suggestions || []))
                .catch(error => {
                    console.error("Error fetching suggestions:", error);
                    setSuggestions([]);
                    setSuggestionError(true);
                })
                .finally(() => setIsSuggesting(false));
        }, 700);
        return () => clearTimeout(handler);
    }, [houseName]);

    const handleSuggestionClick = (suggestion: string) => {
        setHouseName(suggestion);
        setSuggestions([]);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/houses/create/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
                body: JSON.stringify({ name: houseName }),
            });
            const data = await response.json();
            if (response.ok) {
                // UPDATED: The component now handles its own redirect.
                router.push('/home?new=true');
            } else {
                toast.error(`Error: ${data.name || 'Could not create house.'}`);
            }
        } catch (error) {
            console.error("An error occurred during house creation:", error);
            toast.error("An unexpected error occurred.");
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <h1 className="mb-4 text-3xl font-bold text-gray-800">Create a New House</h1>
            <p className="mb-6 text-gray-600">Give your new home a name.</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="relative">
                    <input type="text" value={houseName} onChange={(e) => setHouseName(e.target.value)} placeholder="e.g., The Burrow" className="w-full rounded-md border border-gray-300 px-4 py-3 text-lg" required autoComplete="off" />
                    {houseName.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                            {suggestionError ? (<p className="px-4 py-2 text-sm text-red-500">No suggestions at the moment</p>) : houseName.length < 3 ? (<p className="px-4 py-2 text-sm text-gray-500">No suggestions</p>) : isSuggesting ? (<p className="px-4 py-2 text-sm text-gray-500">Getting AI suggestions...</p>) : (suggestions.map((s, index) => (<div key={index} onClick={() => handleSuggestionClick(s)} className="cursor-pointer px-4 py-2 hover:bg-gray-100">{s}</div>)))}
                        </div>
                    )}
                </div>
                <div className="flex space-x-4 pt-2">
                    {/* UPDATED: The "Cancel" button now calls showChoiceView */}
                    <button type="button" onClick={showChoiceView} className="w-full rounded-md bg-gray-200 px-6 py-3 font-semibold">Cancel</button>
                    <button type="submit" className="w-full rounded-md bg-black px-6 py-3 font-semibold text-white">Create</button>
                </div>
            </form>
        </div>
    );
};

// --- Child Component: JoinHouse ---
// This is the component you provided, with similar modifications.
const JoinHouse = ({ showChoiceView }: { showChoiceView: () => void; }) => {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    const handleChange = (element: HTMLInputElement, index: number) => {
        // ... (This function remains unchanged)
        if (isNaN(Number(element.value))) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        // ... (This function remains unchanged)
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            toast.error('Please enter a complete 6-digit code.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/houses/use-invite/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
                body: JSON.stringify({ code: fullOtp }),
            });
            const data = await response.json();
            if (response.ok) {
                // UPDATED: The component now handles its own redirect.
                router.push('/home?new=true');
            } else {
                toast.error(`Error: ${data.error || 'Failed to join house'}`);
            }
        } catch (error) {
            console.error("Error joining house:", error);
            toast.error("An error occurred.");
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl bg-black p-8 text-center shadow-xl text-white">
            <div className="flex justify-center mb-6">
                <img src="/lock_icon.png" alt="Lock Icon" className="w-16 h-16" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">Enter your Verification Code</h1>
            <p className="mb-8 text-gray-400">Ask your House admin for the code!</p>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-center space-x-2">
                    {otp.map((digit, index) => (
                        <input key={index} type="text" maxLength={1} value={digit} onChange={(e) => handleChange(e.target, index)} onKeyDown={(e) => handleKeyDown(e, index)}
                               ref={el => {inputRefs.current[index] = el}}
                               className="w-12 h-14 text-3xl text-center rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 caret-transparent"
                               inputMode="numeric" />
                    ))}
                </div>
                <div className="flex space-x-4 pt-2">
                    {/* UPDATED: The "Cancel" button now calls showChoiceView */}
                    <button type="button" onClick={showChoiceView} className="w-full rounded-md bg-gray-700 px-6 py-3 font-semibold text-white">Cancel</button>
                    <button type="submit" className="w-full rounded-md bg-green-600 px-6 py-3 font-semibold text-white">Verify</button>
                </div>
            </form>
        </div>
    );
};

// --- The Main Controller for this Page ---
export default function OnboardingHousePage() {
    // NEW: This state variable controls which view is shown on this page
    const [view, setView] = useState<'CHOICE' | 'CREATE' | 'JOIN' | 'AUTO_JOINING'>('CHOICE');
    const router = useRouter();
    const { fetchUser  } = useUser(); // 4. Get the fetchUser function
// --- 5. ADD THIS ENTIRE useEffect BLOCK ---
    useEffect(() => {
        const pendingCode = localStorage.getItem('pendingInviteCode');
        
        if (pendingCode) {
            // A pending invite exists! Try to use it.
            setView('AUTO_JOINING');
            
            const joinWithCode = async () => {
                const token = getCookie('csrftoken');
                if (!token) {
                    // This should not happen if they just logged in
                    toast.error("Authentication error. Please log in again.");
                    localStorage.removeItem('pendingInviteCode');
                    setView('CHOICE');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_BACKEND}/api/houses/use-invite/`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken') || '',
                        },
                        body: JSON.stringify({ code: pendingCode })
                    });
                    
                    if (response.ok) {
                        localStorage.removeItem('pendingInviteCode'); // Success!
                        await fetchUser(); // Re-fetch user data to update context
                        router.push('/home?new=true'); // Go to home!
                    } else {
                        // The code was bad or expired (This is where Scenario 3 fails)
                        const data = await response.json();
                        localStorage.removeItem('pendingInviteCode');
                        setView('CHOICE'); // Show them the normal page
                        toast.error(`Invite Error: ${data.error || "Invalid or expired."}`);
                    }
                } catch (err) {
                    console.log("join with code gave an error",err);
                    setView('CHOICE');
                    toast.error("An error occurred while joining.");
                }
            };
            
            joinWithCode();
        }
    }, [router, fetchUser]); // Runs once on page load
    // --- END OF NEW BLOCK ---


    const renderContent = () => {
        switch(view) {
            case 'AUTO_JOINING':
                {
            return (
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                    <h1 className="text-2xl font-bold">Joining house...</h1>
                    <p className="mt-4 text-gray-600">Your invite is being processed. Please wait.</p>
                </div>
            );
        }
            case 'CREATE':
                return <CreateHouse showChoiceView={() => setView('CHOICE')} />;
            case 'JOIN':
                return <JoinHouse showChoiceView={() => setView('CHOICE')} />;
            case 'CHOICE':
            default:
                return (
                    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                        <img src="/logo.png" alt="Housify Logo" width={160} height={220} className="mx-auto mb-1" />
                        <h1 className="mb-4 text-3xl font-bold text-gray-800">Welcome to Housify!</h1>
                        <p className="mb-8 text-gray-600">You&apos;re not part of a house yet. Get started by creating or joining one.</p>
                        <div className="space-y-4">
                            <button onClick={() => setView('CREATE')} className="w-full rounded-md bg-black px-6 py-3 text-lg font-semibold text-white transition-transform duration-200 hover:scale-105">
                                Create a House
                            </button>
                            <button onClick={() => setView('JOIN')} className="w-full rounded-md bg-gray-200 px-6 py-3 text-lg font-semibold text-black transition-transform duration-200 hover:scale-105">
                                Join a House
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-8">
            {renderContent()}
        </main>
    );
}
