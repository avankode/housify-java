"use client";

import React, { useState, useEffect ,useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';
import AddItemModal from './components/AddItemModal';
import InventoryCarousel from "./components/InventoryCarousel";
import QueueSection from './components/QueueSection';
import { API_BASE_BACKEND, getCookie } from '../utils';
import { InventoryItem, QueueItem } from "./../types"
import toast from 'react-hot-toast';


const GCHAT_WEBHOOK_URL = process.env.NEXT_PUBLIC_GCHAT_WEBHOOK_URL;
export default function QueuesPage(){
    const { user, isLoading: isUserLoading } = useUser()
    const router = useRouter();

    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const fetchQueue = useCallback(async () => {
        if (!user || !user.house) return; // Don't fetch if no user/house
        try {
            const queueRes = await fetch(`${API_BASE_BACKEND}/api/queues/`, { credentials: 'include' });
            if (!queueRes.ok) throw new Error('Failed to fetch queue');
            const queueData = await queueRes.json();
            setQueue(queueData);
        } catch (error) {
            console.error("Error fetching queue:", error);
        }
    }, [user]); // It depends on the 'user' object

    useEffect(() => {
        if (!isUserLoading && user && user.house) {
            const fetchData = async () => {
                setIsDataLoading(true);
                try {
                    // Fetch inventory only once
                    const inventoryRes = await fetch(`${API_BASE_BACKEND}/api/inventory/`, { credentials: 'include' });
                    if (!inventoryRes.ok) throw new Error('Failed to fetch inventory');
                    const inventoryData = await inventoryRes.json();
                    setInventory(inventoryData);

                    // Fetch the initial queue
                    await fetchQueue();

                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setIsDataLoading(false);
                }
            };
            fetchData();
        }
    }, [isUserLoading, user, fetchQueue]); // fetchQueue is now a dependency

    useEffect(() => {
        // Start polling only after the initial load is done
        if (!isDataLoading && user && user.house) {
            console.log("Starting 30-second poll for queue...");
            const intervalId = setInterval(() => {
                console.log("Polling for queue updates...");

                fetchQueue();
            }, 30000); // 30,000 milliseconds = 30 seconds

            // Cleanup function to stop polling when the user leaves the page
            return () => {
                console.log("Stopping poll.");
                clearInterval(intervalId);
            };
        }
    }, [isDataLoading, user, fetchQueue]);

    if (isUserLoading || isDataLoading) {
        return <main className="flex min-h-screen items-center justify-center bg-green-50"><p>Loading Queues...</p></main>;
    }
    if (!user) {
        router.push('/error-session');
        return null;
    }
    if (!user.house) {
        router.push('/error-session');
        return null;
    }
    const handleItemClick = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleAddItemToQueue = async (item: InventoryItem, quantity: number, provider: string) => {
        console.log("Adding item via API:", item.name, quantity, provider);
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/queues/add/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                body: JSON.stringify({
                    inventory_item_id: item.id, // Backend expects 'inventory_item_id'
                    quantity: quantity,
                    provider: provider
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to add item');
            }
            // SUCCESS: Immediately re-fetch the queue to show the update
            await fetchQueue();
        } catch (error) {
            console.error("Error adding item:", error);
            toast.error("Failed to add item. Please try again.");
        }
    };

    // --- UPDATED: handleDeleteItem now uses fetch DELETE ---
    const handleDeleteItem = async (id: number) => { // The ID is now a number
        console.log("Deleting item via API:", id);
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/queues/${id}/delete/`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete item');
            }
            // SUCCESS: Immediately re-fetch the queue to show the update
            await fetchQueue();
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Failed to delete item. Please try again.");
        }
    };
    const handleClearQueue = async () => {
        console.log("Clearing queue via API...");
        try {
            const response = await fetch(`${API_BASE_BACKEND}/api/queues/clear/`, {
                method: 'POST', // Or 'DELETE' if you prefer, backend handles POST
                credentials: 'include',
                headers: {
                    // No Content-Type needed for empty body, but CSRF is crucial
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                // No body is needed for this request
            });

            if (!response.ok && response.status !== 204) { // 204 is success (No Content)
                throw new Error(`Failed to clear queue, status: ${response.status}`);
            }

            // SUCCESS: Immediately re-fetch the queue to show the empty list
            console.log("Queue cleared successfully, fetching updated list.");
            await fetchQueue();
        }catch (error) {
            console.error("Error clearing queue:", error);
            toast.error("Failed to clear the queue. Please try again.");
        }
    };

    const handlePurchaseQueue = async (provider: string) => {
        console.log(`Purchasing all items for provider: ${provider}`);
        
        const itemsToPurchase = queue.filter(item => item.provider === provider);
        if (itemsToPurchase.length === 0) {
            toast.error("No items to purchase for this provider.");
            return;
        }

        const totalAmount = itemsToPurchase.reduce((sum, item) => {
            return sum + (parseFloat(item.inventory_item.price) * item.quantity);
        }, 0);

        const details = itemsToPurchase.map(item => ({
            name: item.inventory_item.name,
            quantity: item.quantity
        }));
        
        const dateString = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const expenseName = `${provider} - ${dateString}`;

        const expensePayload = {
            name: expenseName,
            amount: totalAmount,
            category: "GROCERIES",
            date: new Date().toISOString(),
            details: details,
            is_recurring: false,
        };

        const csrftoken = getCookie('csrftoken') || '';

        try {
            // --- STEP 1: CREATE THE EXPENSE ---
            const expenseRes = await fetch(`${API_BASE_BACKEND}/api/expenses/`, {
                method: 'POST',
                credentials : 'include',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-CSRFToken': csrftoken 
                },
                body: JSON.stringify(expensePayload)
            });

            if (!expenseRes.ok) {
                const errData = await expenseRes.json();
                throw new Error(`Failed to create expense: ${JSON.stringify(errData)}`);
            }
            
            console.log("Expense created successfully!");

            // --- STEP 2: CLEAR THE PURCHASED ITEMS ---
            await Promise.all(
                itemsToPurchase.map(item => handleDeleteItem(item.id))
            );
            
            console.log("Purchased items cleared from queue.");
           toast.success("Purchase successful! Expense created.");
            if(GCHAT_WEBHOOK_URL){
                        const message = {
            "cardsV2": [
                {
                    "cardId": "queue-ready-card",
                    "card": {
                        "header": {
                            "title": `SOMEONE PLACED THE ORDER`,
                            "subtitle": "CHECK WITH YOUR GANG",
                            "imageUrl": "https://unsplash.com/photos/a-bunch-of-balloons-that-are-shaped-like-email-7NT4EDSI5Ok",
                            "imageType": "CIRCLE"
                        },
                    }
                }
            ]
        };
            fetch(GCHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify(message),
        })
            .then(() => {
                console.log(`✔ Notification sent for SOMEONE ORDERING`);
            })
            .catch(err => console.error(`Failed to notify THAT SOMEONE ORDERED`, err));}
        } catch (err: unknown) {
            console.error("Failed during purchase process:", err);
            if (err instanceof Error) {
                toast.error(`Error: ${err.message}`);
            } else {
                toast.error("An unknown error occurred.");
            }
        }
    };
    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    const isCarouselPaused = isModalOpen || searchTerm.length > 0;

    return (
        <Layout houseName={"Queify"}>
            <div className="w-full h-full p-4">
                {/* Page Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Queues</h1>
                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search for items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {/* Inventory Carousel */}
                <div className="mb-8 p-4 bg-white rounded-lg shadow">
                    <InventoryCarousel
                        inventory={filteredInventory}
                        onItemClick={handleItemClick}
                        isPaused={isCarouselPaused}
                    />
                </div>
                {/* Placeholder for Queue List */}
                <QueueSection
                    queue={queue}
                    onDeleteItem={handleDeleteItem}
                    googleChatWebhook={GCHAT_WEBHOOK_URL||null}
                    onClearQueue={handleClearQueue}
                    onPurchaseQueue={handlePurchaseQueue}
                />

                <AddItemModal
                    item={selectedItem}
                    onClose={handleCloseModal}
                    onAddItem={handleAddItemToQueue}
                />

            </div>
        </Layout>
    )

}