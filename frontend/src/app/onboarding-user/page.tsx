"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import img from "next/image";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { API_BASE_BACKEND } from '../utils';
import toast from 'react-hot-toast';

// Helper function to get the CSRF token
const getCookie = (name: string) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

export default function OnboardingUserPage() {
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
    const router = useRouter();
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/profile/update/`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                body: JSON.stringify({
                    display_name: displayName,
                    phone_number: phoneNumber,
                }),
            });

            if (response.ok) {
                // router.push('/onboarding-house');
                console.log("successful profuile update from onboaring-user");
            } else {
                const errorData = await response.json();
                toast.error(`Error: ${JSON.stringify(errorData)}`);
            }
            console.log("got the code boss",localStorage.getItem('pendingInviteCode'));
            const pendingCode = localStorage.getItem('pendingInviteCode');

            if (pendingCode) {
                // AN INVITE CODE EXISTS! Let's use it.
                const inviteResponse = await fetch(`${API_BASE_BACKEND}/api/houses/use-invite/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') || '' },
                    body: JSON.stringify({ code: pendingCode })
                });

                if (inviteResponse.ok) {
                    // Success! Remove the code and go to home
                    localStorage.removeItem('pendingInviteCode');
                    router.push('/home?new=true'); // <-- SKIP /onboarding-house
                    return; // We are done here
                } else {
                    // Code was bad or expired.
                    localStorage.removeItem('pendingInviteCode');
                    toast.error("Your invite was invalid or expired. Please join a house manually.");
                    // Fall through to the default redirect
                }
                
            } 
            
            // NO PENDING INVITE: Go to the normal next step
            console.log("no invite route");
            router.push('/onboarding-house');
        } catch (error) {
            console.error("An error occurred during profile update:", error);
            toast.error("An unexpected error occurred.");
        }
    };
    

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-8">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
                <img src="/logo.png" alt="Housify Logo" width={160} height={220} className="mx-auto mb-1" />
                <h1 className="mb-2 text-3xl font-bold text-gray-800">Welcome to Housify!</h1>
                <p className="mb-8 text-gray-600">Let&apos;s get your profile set up.</p>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="How you'll appear to others"
                            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 text-lg"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1 flex items-center rounded-md border border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                            <PhoneInput
                                id="phoneNumber"
                                international
                                countryCallingCodeEditable={false}
                                defaultCountry="IN"
                                value={phoneNumber}
                                onChange={(value) => setPhoneNumber(value)}
                                className="PhoneInput"
                            />
                        </div>
                        <style jsx global>{`
                            .PhoneInput {
                                display: flex;
                                align-items: center;
                                width: 100%;
                            }
                            .PhoneInputCountry {
                                padding: 0.75rem;
                                border-right: 1px solid #D1D5DB;
                            }
                            .PhoneInputInput {
                                border: none;
                                outline: none;
                                padding: 0.75rem;
                                font-size: 1.125rem;
                                flex-grow: 1;
                                background-color: transparent;
                            }
                            .PhoneInputCountrySelect-arrow {
                                margin-left: 0.5rem;
                            }
                        `}</style>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full rounded-md bg-black px-6 py-3 font-semibold text-white transition-transform duration-200 hover:scale-105"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

