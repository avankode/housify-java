"use client";

import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { UserWithHouse } from '../utils';

const MainApp = ({ userData, onLogout, showAnimation }: {
    userData: UserWithHouse;
    onLogout: () => void;
    showAnimation: boolean;
}) => {
    const [animationPhase, setAnimationPhase] = useState('hidden');

    useEffect(() => {
        let visibleTimer: NodeJS.Timeout;
        let fadeTimer: NodeJS.Timeout;

        if (showAnimation) {
            visibleTimer = setTimeout(() => setAnimationPhase('visible'), 100);
            fadeTimer = setTimeout(() => setAnimationPhase('fading'), 3000);
            return () => {
                clearTimeout(visibleTimer);
                clearTimeout(fadeTimer);
            };
        }
    }, [showAnimation]);

    return (
        <Layout houseName={userData.house?.name || ''} onLogout={onLogout}>
            {showAnimation && (
                <div className="fixed inset-0 z-20 flex items-center justify-center bg-green-50 bg-opacity-90 backdrop-blur-sm">
                    <h1 className={`text-5xl font-bold text-gray-800 transition-all duration-1000 ${
                        animationPhase === 'visible' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
                    }`}
                    >
                        Hey {userData.username}, Welcome to {userData.house?.name}!
                    </h1>
                </div>
            )}

            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">
                    Main Dashboard
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                    This is where we will build the tabs for Queues, Laundry, and Expenses.
                </p>
            </div>
        </Layout>
    );
};

export default MainApp;