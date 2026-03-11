"use client";

import React, { useState, useEffect, useRef } from 'react';
import QueueItemTile from './QueueItemTile';
import { QueueItem } from "./../../types"
// --- Type Definitions ---


// --- End Type Definitions ---

interface Props {
    queue: QueueItem[];
    onDeleteItem: (itemId: number) => void; // We use the string 'itemId'
    googleChatWebhook: string | null ;
    onClearQueue: () => void; // Prop to clear the queue
    onPurchaseQueue: (provider: string) => void;
}


const calculateTotals = (queue: QueueItem[]) => {
    const totals = { Blinkit: 0, Swiggy: 0, Zepto: 0, overall: 0 };


    queue.forEach(item => {
        // Access nested price directly
        const price = parseFloat(item.inventory_item.price);
        const itemTotal = price * item.quantity;

        totals.overall += itemTotal;
        if (item.provider === 'Blinkit') totals.Blinkit += itemTotal;
        if (item.provider === 'Swiggy') totals.Swiggy += itemTotal;
        if (item.provider === 'Zepto') totals.Zepto += itemTotal;
    });

    return totals;
};


// --- Main Component ---
export default function QueueSection({ queue, onDeleteItem, googleChatWebhook,onPurchaseQueue }: Props) {
    const [buttonState, setButtonState] = useState({ text: 'Queue Ready', color: 'bg-gray-400', disabled: true });
    const [readyProviders, setReadyProviders] = useState<string[]>([]);
    const totals = calculateTotals(queue); // Pass inventory to helper
    const notifiedProvidersRef = useRef<string[]>([]);
    const previousQueueStateRef = useRef<string>('');

    useEffect(() => {
    const storedQueue = localStorage.getItem("lastQueueState");
    if (storedQueue) previousQueueStateRef.current = storedQueue;

    const storedProviders = localStorage.getItem("notifiedProviders");
    if (storedProviders) {
        try {
            notifiedProvidersRef.current = JSON.parse(storedProviders);
        } catch (e) {
            console.error("Failed to parse notifiedProviders:", e);
        }
    }
    }, []);
        useEffect(() => {
        if (queue.length === 0) {
            localStorage.removeItem("lastQueueState");
            localStorage.removeItem("notifiedProviders");

            previousQueueStateRef.current = "";
            notifiedProvidersRef.current = [];
        }
    }, [queue.length]);

    useEffect(() => {
        const newReadyProviders: string[] = [];
        if (totals.Blinkit > 150) newReadyProviders.push('Blinkit');
        if (totals.Swiggy > 150) newReadyProviders.push('Swiggy');
        if (totals.Zepto > 150) newReadyProviders.push('Zepto');

        setReadyProviders(newReadyProviders); // Set the state for the GChat effect

        if (newReadyProviders.length === 0) {
            setButtonState({ text: 'Queue Ready', color: 'bg-gray-400', disabled: true });
        } else if (newReadyProviders.length === 1) {
            const provider = newReadyProviders[0];
            if (provider === 'Blinkit') setButtonState({ text: 'BLINKIT IT!', color: 'bg-yellow-500 hover:bg-yellow-600', disabled: false });
            if (provider === 'Swiggy') setButtonState({ text: 'SWIGGY IT!', color: 'bg-orange-500 hover:bg-orange-600', disabled: false });
            if (provider === 'Zepto') setButtonState({ text: 'ZEPTO IT!', color: 'bg-purple-600 hover:bg-purple-700', disabled: false });
        } else {
            setButtonState({ text: 'READY', color: 'bg-black hover:bg-gray-800', disabled: false });
        }
    }, [queue, totals.Blinkit, totals.Swiggy, totals.Zepto]); 

    
useEffect(() => {
    if (buttonState.disabled) return;
    if (!googleChatWebhook) return;

    // Prepare a simplified snapshot of current queue
    const currentSnapshot = JSON.stringify(
        queue
            .sort((a, b) => a.id - b.id)
            .map(item => ({
                id: item.id,
                provider: item.provider,
                quantity: item.quantity,
                name: item.inventory_item.name
            }))
    );

    const previousSnapshot = previousQueueStateRef.current;

    // If no change → do nothing
    if (currentSnapshot === previousSnapshot) {
        console.log("No change in queue; no notifications sent.");
        return;
    }

    // Queue HAS changed — allow notifications again
    notifiedProvidersRef.current = [];

    // Store cleared providers list
    localStorage.setItem("notifiedProviders", "[]");

    // Determine which providers should notify
    const providersToNotify = readyProviders;

    if (providersToNotify.length === 0) return;

    console.log("Queue changed → sending notifications...");

    providersToNotify.forEach(provider => {
        const itemsForProvider = queue
            .filter(item => item.provider === provider)
            .map(item => ({
                name: item.inventory_item.name,
                quantity: item.quantity
            }));
        console.log("total list right before sending" , itemsForProvider);
        const message = {
            "cardsV2": [
                {
                    "cardId": "queue-ready-card",
                    "card": {
                        "header": {
                            "title": `${provider.toUpperCase()} IT NOW!`,
                            "subtitle": "Your Housify order is ready to be placed.",
                            "imageUrl": "https://i.imgur.com/x0R4sPz.png",
                            "imageType": "CIRCLE"
                        },
                        "sections": [
                            {
                                "widgets": itemsForProvider.map(item => ({
                                    "textParagraph": {
                                        "text": `<b>${item.name}</b> (x${item.quantity})`
                                    }
                                }))
                            }
                        ]
                    }
                }
            ]
        };
if(itemsForProvider.length>0)
{        fetch(googleChatWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify(message)
        })
            .then(() => {
                console.log(`✔ Notification sent for ${provider}`);
            })
            .catch(err => console.error(`Failed to notify ${provider}:`, err));}
    });

    // After all notifications done → store new queue state
    previousQueueStateRef.current = currentSnapshot;
    localStorage.setItem("lastQueueState", currentSnapshot);

}, [queue, readyProviders, buttonState.disabled, googleChatWebhook]); // Re-run if these change


    const handleCheckoutClick = () => {
        if (readyProviders.length === 0) return;
        
        if (readyProviders.length === 1) {
            // This is the "BLINKIT IT!" state.
            // Call the purchase function from the parent.
            onPurchaseQueue(readyProviders[0]);
        } else {
            // This is the "READY" state (multiple providers)
            onPurchaseQueue("Blinkit+Swiggy+Zepto Combined")
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 & 2: The Queue List */}
            <div className="md:col-span-2 p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Current Queue</h2>
                <div className="max-h-[500px] overflow-y-auto pr-2">
                    {queue.length === 0 ? (
                        <p className="text-gray-500 text-center">Your queue is empty. Add items from the list above!</p>
                    ) : (
                        queue.map(item => (
                            <QueueItemTile
                                key={item.id}
                                item={item}
                                onDelete={onDeleteItem}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Column 3: The Checkout Section */}
            <div className="p-4 bg-white rounded-lg shadow self-start">
                <h2 className="text-xl font-semibold mb-4">Total</h2>
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Blinkit:</span>
                        <span className="font-medium">₹{totals.Blinkit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Swiggy:</span>
                        <span className="font-medium">₹{totals.Swiggy.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Zepto:</span>
                        <span className="font-medium">₹{totals.Zepto.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                        <span>Overall Total:</span>
                        <span>₹{totals.overall.toFixed(2)}</span>
                    </div>
                </div>
                <button
                    onClick={handleCheckoutClick} // <-- The new onClick handler
                    disabled={buttonState.disabled}
                    className={`w-full p-4 rounded-lg text-white font-bold text-xl transition-all duration-300 ${
                        buttonState.color
                    } ${buttonState.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {buttonState.text}
                </button>
            </div>
        </div>
    );
}