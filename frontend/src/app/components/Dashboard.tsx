// frontend/app/components/Dashboard.tsx

"use client";

import React, { useState } from 'react';
import { API_BASE_BACKEND, getCookie, User } from '../utils'; // Import from utils
import toast from 'react-hot-toast';

const Dashboard = ({ user, showCreateHouseView, showJoinHouseView, onLogout }: {
    user: User;
    showCreateHouseView: () => void;
    showJoinHouseView: () => void;
    onLogout: () => void;
}) => {
    const [confirmingLogout, setConfirmingLogout] = useState(false);

    const handleLogoutConfirm = async () => {
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/logout/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
            });
            if (response.ok) {
                onLogout();
            } else {
                toast.error("Logout failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            {confirmingLogout ? (
                <div>
                    <h2 className="mb-4 text-xl font-bold text-gray-800">Sign Out</h2>
                    <p className="mb-6 text-gray-600">Are you sure you want to sign out?</p>
                    <div className="flex justify-center space-x-4">
                        <button onClick={() => setConfirmingLogout(false)} className="w-full rounded-md bg-gray-200 px-6 py-2 font-semibold">Cancel</button>
                        <button onClick={handleLogoutConfirm} className="w-full rounded-md bg-gray-300 px-6 py-2 font-semibold text-white">Sign Out</button>
                    </div>
                </div>
            ) : (
                <div>
                    <h1 className="mb-4 text-3xl font-bold text-gray-800">Welcome, {user.username}!</h1>
                    <p className="mb-8 text-gray-600">You&apos;re not part of a house yet.</p>
                    <div className="space-y-4">
                        <button onClick={showCreateHouseView} className="w-full rounded-md bg-black px-6 py-3 font-semibold text-white">Create a House</button>
                        <button onClick={showJoinHouseView} className="w-full rounded-md bg-gray-200 px-6 py-3 font-semibold text-black">Join a House</button>
                    </div>
                    <button onClick={() => setConfirmingLogout(true)} className="mt-8 text-sm font-medium text-gray-500 hover:text-red-600">Sign Out</button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;