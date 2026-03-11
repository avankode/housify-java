"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_BACKEND, UserWithHouse } from '../utils';
import Link from 'next/link';
import {getCookie} from "@/src/app/utils";
import img from "next/image";

// --- Reusable UI Components ---

const Modal = ({ isOpen, children }: { isOpen: boolean; onClose?: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                {children}
            </div>
        </div>
    );
};

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
    return (
        <div className="relative group flex justify-center">
            {children}
            <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {text}
            </div>
        </div>
    );
};

// --- Main Settings Page Component ---

export default function SettingsPage() {
    const [user, setUser] = useState<UserWithHouse | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // State for modals and inputs
    const [modal, setModal] = useState<'leave' | 'delete' | 'admin' | null>(null);
    const [deleteInput, setDeleteInput] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [showGoodbye, setShowGoodbye] = useState(false);
    const [goodbyeStep, setGoodbyeStep] = useState(1);
    const [,setError] = useState<string | null>(null);
    const [showNewAdminAnim, setShowNewAdminAnim] = useState(false);
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminAnimStep, setNewAdminAnimStep] = useState(1);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_BASE_BACKEND}/api/user/`, { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch user data.');
                const data = await response.json();
                setUser(data);
            } catch (err : unknown) {
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
    }, [router]);

    useEffect(() => {
        if (showNewAdminAnim) {
            const step1Timer = setTimeout(() => setNewAdminAnimStep(2), 1500);
            const reloadTimer = setTimeout(() => window.location.reload(), 4000); // Reload after animation
            return () => {
                clearTimeout(step1Timer);
                clearTimeout(reloadTimer);
            };
        }
    }, [showNewAdminAnim]);


    if (loading || !user) {
        return <main className="flex min-h-screen items-center justify-center bg-green-50"><p>Loading settings...</p></main>;
    }

    if (showGoodbye) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-50">
                {/* First line: Fades in on step 1 and stays visible */}
                <h1 className={`text-5xl font-bold text-gray-800 text-center transition-opacity duration-700 ${goodbyeStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                    Au revoir, {user.display_name}
                </h1>
                {/* Second line: Fades in on step 2 below the first line */}
                <h1 className={`text-4xl font-semibold text-gray-600 text-center transition-opacity duration-700 mt-4 ${goodbyeStep === 2 ? 'opacity-100' : 'opacity-0'}`}>
                    {user.house?.name} will miss you
                </h1>
            </div>
        );
    }

    if (showNewAdminAnim) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-50">
                <div className="text-5xl font-bold text-gray-800 text-center">
                    <h1 className={`transition-opacity duration-500 ${newAdminAnimStep === 1 ? 'opacity-100' : 'opacity-0'}`}>
                        The new admin of the house is now
                    </h1>
                    <h1 className={`transition-opacity duration-500 ${newAdminAnimStep === 2 ? 'opacity-100' : 'opacity-0'}`}>
                        {newAdminName}
                    </h1>
                </div>
            </div>
        );
    }

    const isAdmin = user.house?.admin?.id === user.id;
    const isSoloAdmin = isAdmin && user.house?.members?.length === 1;

    // --- API Handlers ---

    const handleLeaveHouse = async () => {
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/houses/leave/`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
            });
            if (!response.ok) throw new Error('Failed to leave house.');

            setShowGoodbye(true);
            setTimeout(() => setGoodbyeStep(2), 1500);
            setTimeout(() => router.push('/'), 3500);

        } catch (err : unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    const handleDeleteHouse = async () => {
        if (deleteInput !== 'delete') {
            setDeleteError('Please type "delete" to confirm.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/houses/delete/`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
            });
            if (!response.ok) throw new Error('Failed to delete house.');
            router.push('/onboarding-house');
        } catch (err : unknown) {
            if (err instanceof Error) {
            setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }

        }
    };

    const handleTransferAdmin = async () => {
        if (!selectedMemberId) return;
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/houses/transfer-admin/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || ''
                },
                body: JSON.stringify({ new_admin_id: selectedMemberId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.err || 'Failed to transfer adminship.');

            const name = data.message.split(' ').pop().replace('.', '');
            setNewAdminName(name);
            setShowNewAdminAnim(true); // Trigger the animation

        } catch (err: unknown) {
                if (err instanceof Error) {
                setError(err.message);
                } else {
                    setError('An unexpected error occurred.');
                }
        }
    };

    return (
        <main className="min-h-screen w-full bg-green-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings</h1>
                <p className="text-lg text-gray-600 mb-8">Manage your household and account settings.</p>
                <div className="mb-8 p-4 bg-green-100 border border-green-200 rounded-lg flex items-center">
                    <svg className="h-6 w-6 mr-3 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-700">Current House Admin: <strong className="font-semibold">{user.house?.admin?.username || 'N/A'}</strong></span>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    {/* --- Leave House --- */}
                    <div>
                        <h2 className="text-xl font-semibold">Leave House</h2>
                        <p className="text-gray-500 mb-4">Disconnect from your current household.</p>
                        <Tooltip text="You cannot leave the house as an admin. Transfer adminship first.">
                            <button
                                onClick={() => !isAdmin && setModal('leave')}
                                disabled={isAdmin}
                                className="px-6 py-2 font-semibold rounded-md bg-gray-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Leave House
                            </button>
                        </Tooltip>
                    </div>

                    <hr />

                    {/* --- Delete House --- */}
                    <div>
                        <h2 className="text-xl font-semibold text-red-600">Delete House</h2>
                        <p className="text-gray-500 mb-4">Permanently delete this house and all its data. This action cannot be undone.</p>
                        <Tooltip text="Only the house admin can delete the house.">
                            <button
                                onClick={() => isAdmin && setModal('delete')}
                                disabled={!isAdmin}
                                className="px-6 py-2 font-semibold rounded-md bg-red-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Delete House
                            </button>
                        </Tooltip>
                    </div>

                    <hr />

                    {/* --- Change Admin --- */}
                    <div>
                        <h2 className="text-xl font-semibold">Transfer Adminship</h2>
                        <p className="text-gray-500 mb-4">Make another member the admin of this house.</p>
                        <Tooltip text={isSoloAdmin ? "You are the only member in the house." : "Only the house admin can transfer adminship."}>
                            <button
                                onClick={() => isAdmin && !isSoloAdmin && setModal('admin')}
                                disabled={!isAdmin || isSoloAdmin}
                                className="px-6 py-2 font-semibold rounded-md bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Change Admin
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <div className="text-center mt-8">
                    <Link href="/home" className="text-green-600 hover:text-green-800 font-semibold">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* --- Modals --- */}

            <Modal isOpen={modal === 'leave'} onClose={() => setModal(null)}>
                <h2 className="text-2xl font-bold mb-4">Are you sure?</h2>
                <p className="text-gray-600 mb-6">You will lose access to this house and its data. You can rejoin later if you receive a new invite.</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={() => setModal(null)} className="px-6 py-2 rounded-md bg-gray-200">Cancel</button>
                    <button onClick={handleLeaveHouse} className="px-6 py-2 rounded-md bg-gray-600 text-white">Leave House</button>
                </div>
            </Modal>

            <Modal isOpen={modal === 'delete'} onClose={() => setModal(null)}>
                <h2 className="text-2xl font-bold text-red-600 mb-4">WARNING: This is permanent</h2>
                <p className="text-gray-600 mb-4">Deleting this house will remove all members and erase all associated data. To proceed, please type <strong>delete</strong> below.</p>
                <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => { setDeleteInput(e.target.value); setDeleteError(''); }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 mb-2"
                />
                {deleteError && <p className="text-red-500 text-sm">{deleteError}</p>}
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={() => setModal(null)} className="px-6 py-2 rounded-md bg-gray-200">Cancel</button>
                    <button onClick={handleDeleteHouse} className="px-6 py-2 rounded-md bg-red-600 text-white">Delete</button>
                </div>
            </Modal>

            <Modal isOpen={modal === 'admin'} onClose={() => setModal(null)}>
                <h2 className="text-2xl font-bold mb-6">Transfer Adminship</h2>
                <div className="max-h-60 overflow-y-auto space-y-2 mb-6">
                    {user.house?.members.filter(member => member.id !== user.id).map(member => (
                        <div
                            key={member.id}
                            onClick={() => setSelectedMemberId(member.id)}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedMemberId === member.id ? 'bg-green-100 border-green-400 border' : 'hover:bg-gray-100'}`}
                        >
                            <img src={member.profile_photo_url} alt={member.display_name} className="w-10 h-10 rounded-full mr-4" />
                            <span className="font-semibold">{member.display_name}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-4">
                    <button onClick={() => setModal(null)} className="px-6 py-2 rounded-md bg-gray-200">Cancel</button>
                    <button
                        onClick={handleTransferAdmin}
                        disabled={!selectedMemberId}
                        className="px-6 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Make Admin
                    </button>
                </div>
            </Modal>
        </main>
    );
}