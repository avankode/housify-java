"use client";

import React from 'react';
import { QueueItem } from './../../types'; //
import img from "next/image";

interface Props {
    item: QueueItem;
    onDelete: (id: number) => void;
}

export default function QueueItemTile({ item, onDelete }: Props) {
    const inventoryItem = item.inventory_item;
    // Show a loading/error state if the item isn't found (shouldn't happen)
    if (!inventoryItem) {
        return <div className="p-3 bg-red-100 text-red-700 rounded-lg">Error: Item not found.</div>;
    }

    const itemTotal = (parseFloat(inventoryItem.price) * item.quantity).toFixed(2);

    return (
        <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm mb-3">
            <img
                src={inventoryItem.image_url}
                alt={inventoryItem.name}
                className="w-16 h-16 object-contain rounded-md"
            />
            <div className="flex-1 mx-4">
                <h3 className="text-lg font-bold">{inventoryItem.name}</h3>
                <p className="text-sm text-gray-600">
                    {item.quantity} x ₹{inventoryItem.price} = <span className="font-semibold">₹{itemTotal}</span>
                </p>
                <p className="text-xs text-gray-500">
                    {/* We'll just show 'a user' for now. 'addedBy' is a connection ID. */}
                    Added by: a user | Provider: {item.provider}
                </p>
            </div>
            <button
                onClick={() => onDelete(item.id)} // Pass the unique 'itemId' string
                className="text-red-500 hover:text-red-700 font-medium"
            >
                Delete
            </button>
        </div>
    );
}