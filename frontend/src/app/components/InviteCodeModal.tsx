"use client";

import React, { useState, useEffect } from 'react';
import { API_BASE_BACKEND, getCookie } from '../utils';


// This component expects one prop: a function to call when it should close.
interface InviteCodeModalProps {
    onClose: () => void;
}

export default function InviteCodeModal({ onClose }: InviteCodeModalProps) {

    const [code, setCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Effect 1: Fetch the invite code when the modal opens
    useEffect(() => {
        const fetchInviteCode = async () => {
            setIsLoading(true);
            setError(null);


            try {
                const response = await fetch(`${API_BASE_BACKEND}/api/houses/create-invite/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
                body: JSON.stringify({ invite_type: 'OTP' }) // Tell backend we want an OTP
                });

                if (!response.ok) {
                    console.log("failed at fetching")
                    const data = await response.json();
                    if(response.status === 403 ) {
                        throw new Error("Only House admins can send invites")
                    }
                    throw new Error(data.error || 'Failed to generate code.');
                }

                const data = await response.json();
                setCode(data.code);
                // Convert the backend's ISO string into a real Date object
                setExpiresAt(new Date(data.expires_at)); 

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInviteCode();
    }, []); // Empty dependency array means this runs once when the component mounts

    // Effect 2: Manage the countdown timer
    useEffect(() => {
        if (!expiresAt) return; // Don't start if we don't have an expiry date

        // Set up an interval to tick every second
        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            const expiryTime = expiresAt.getTime();
            const distance = expiryTime - now;

            if (distance <= 0) {
                clearInterval(intervalId);
                setTimeLeft("Expired");
                setCode(null); // Clear the expired code
            } else {
                // Calculate minutes and seconds
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                // Format to "MM:SS"
                setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        }, 1000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);

    }, [expiresAt]); // This effect re-runs if 'expiresAt' changes

    return (
        // Modal Overlay (dimmed background)
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            onClick={onClose} // Close modal if clicking outside
        >
            {/* Modal Content */}
            <div 
                className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800"
                >
                    &times;
                </button>
                
                <h2 className="text-center text-2xl font-bold text-gray-800">House Invite Code</h2>
                
                {isLoading && (
                    <p className="mt-6 text-center text-gray-600">Generating your code...</p>
                )}
                
                {error && (
                    <div className="mt-6 text-center">
                        <p className="font-semibold text-red-600">Error</p>
                        <p className="text-gray-600">{error}</p>
                    </div>
                )}
                
                {code && (
                    <div className="mt-6 text-center">
                        <p className="text-lg text-gray-600">Share this code with a new member:</p>
                        {/* The 6-digit code, spaced out */}
                        <div className="my-4 text-6xl font-bold tracking-widest text-black">
                            {code}
                        </div>
                        <p className="text-lg font-semibold text-red-600">
                            Expires in: {timeLeft}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}