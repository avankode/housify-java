"use client";

import React from 'react';

interface Props {
    buttonText: string;
    isButtonDisabled: boolean;
    providers: string[]; // e.g., ['Blinkit', 'Zepto']
    totals: { [key: string]: number }; // e.g., { Blinkit: 105.50, Zepto: 20.00 }
    onClearQueue: () => void;
    onPurchaseQueue: (provider: string) => void;
}

const QueueControls: React.FC<Props> = ({
    buttonText,
    isButtonDisabled,
    providers,
    totals,
    onClearQueue,
    onPurchaseQueue
}) => {

    // This calculates the grand total from all provider totals
    const overallTotal = React.useMemo(() => {
        return Object.values(totals).reduce((sum, total) => sum + total, 0);
    }, [totals]);

    const handleCheckoutClick = () => {
        if (isButtonDisabled) return;

        // In this new logic, the button text is "Purchase Blinkit, Zepto"
        // We just purchase for every provider that is "ready"
        // The parent component (`QueuesPage`) will handle the purchase logic
        Object.keys(totals).forEach(provider => {
            if (totals[provider] > 0) { // Or a specific threshold if needed
                onPurchaseQueue(provider);
            }
        });
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg self-start">
            <h2 className="text-xl font-semibold mb-4">Total</h2>
            
            {/* Dynamically list totals for all providers */}
            <div className="space-y-2 mb-6">
                {providers.length > 0 ? (
                    providers.map(provider => (
                        <div key={provider} className="flex justify-between">
                            <span className="text-gray-600">{provider}:</span>
                            <span className="font-medium">₹{(totals[provider] || 0).toFixed(2)}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No items in queue.</p>
                )}

                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                    <span>Overall Total:</span>
                <span>₹{overallTotal.toFixed(2)}</span>
                </div>
            </div>

            {/* Purchase Button */}
            <button
                onClick={handleCheckoutClick}
                disabled={isButtonDisabled}
                className={`w-full p-4 rounded-lg text-white font-bold text-xl transition-all duration-300 ${
                    isButtonDisabled ? 'bg-gray-400 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
            >
                {buttonText}
            </button>

            {/* Clear Queue Button */}
            <button
                onClick={onClearQueue}
                className="w-full mt-2 text-center text-sm text-red-500 hover:text-red-700"
            >
                Clear Queue
            </button>
        </div>
    );
};

export default QueueControls;