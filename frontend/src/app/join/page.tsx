"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../context/UserContext';
// import { API_BASE } from '@/utils/apiBase';
import Link from 'next/link';
import { API_BASE_BACKEND, API_BASE_FRONTEND, getCookie } from '../utils';

// A client component that does all the work
function JoinPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading } = useUser();
    
    // Get the invite code from the URL
    // const inviteCode = searchParams.get('invite_code');

    const [status, setStatus] = useState<'LOADING' | 'ALREADY_IN_HOUSE' | 'READY_TO_JOIN' | 'ERROR'>('LOADING');
    const [error, setError] = useState('');
    const [inviteCode, setInviteCode] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('invite_code');
        if (code) {
            setInviteCode(code);
            localStorage.setItem('pendingInviteCode', code);
        } else {
            setError('No invite code provided.');
            setStatus('ERROR');
        }
    }, [searchParams]);

    useEffect(() => {
        if (isLoading || !inviteCode) {
            return; // Wait for the UserContext to load
        }

        if (!user) {
            // If user is not logged in, send them to login
            // We can pass the invite code along so they come back here
            router.push(`${API_BASE_FRONTEND}/login?next=/join?invite_code=${inviteCode}`);
            return;
        }

        if (user.house) {
            // --- THIS IS YOUR FEATURE ---
            // User is logged in AND already in a house
            setStatus('ALREADY_IN_HOUSE');
            localStorage.removeItem('pendingInviteCode');
            return;

        } else {
            // User is logged in and NOT in a house
            setStatus('READY_TO_JOIN');
        }

    }, [user, isLoading, inviteCode, router]);

    const handleJoin = async () => {
        setStatus('LOADING');
        
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/houses/use-invite/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                body: JSON.stringify({ code: inviteCode }),
            });

            if (response.ok) {

                localStorage.removeItem('pendingInviteCode');
                router.push('/home?new=true');
            } else {
                const data = await response.json();
                setError(data.error || 'This invite code is invalid or has expired.');
                setStatus('ERROR');
            }
        } catch (err) {
            console.log("Error in handleJoin " , err);
            setError('An unknown error occurred.');
            setStatus('ERROR');
        }
    };

    // Render different UI based on the status
    if (status === 'LOADING') {
        return <p>Loading...</p>;
    }

    if (status === 'ALREADY_IN_HOUSE') {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Youre already in a house!</h1>
                <p className="mt-2 text-gray-600">You must leave your current house to join a new one.</p>
                <Link href="/home">
                    <button className="mt-6 w-full rounded-md bg-black px-6 py-3 font-semibold text-white">
                        Continue to Home Page
                    </button>
                </Link>
            </div>
        );
    }

    if (status === 'READY_TO_JOIN') {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Join House?</h1>
                <p className="mt-2 text-gray-600">Youve been invited to join a house. Ready to move in?</p>
                <button 
                    onClick={handleJoin} 
                    className="mt-6 w-full rounded-md bg-green-600 px-6 py-3 font-semibold text-white">
                    Accept Invite
                </button>
            </div>
        );
    }
    
    if (status === 'ERROR') {
         return (
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600">Invite Error</h1>
                <p className="mt-2 text-gray-600">{error}</p>
                 <Link href="/home">
                    <button className="mt-6 w-full rounded-md bg-black px-6 py-3 font-semibold text-white">
                        Back to Home
                    </button>
                </Link>
            </div>
        );
    }

    return null;
}

// The main page component wraps the client component in Suspense
export default function JoinPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-8">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <Suspense fallback={<p>Loading invite...</p>}>
                    <JoinPageClient />
                </Suspense>
            </div>
        </main>
    );
}