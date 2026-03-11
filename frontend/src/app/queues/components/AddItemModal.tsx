"use client";

import React, { useState } from 'react';
import img from "next/image";

interface InventoryItem {
    id: number;
    name: string;
    price: string;
    image_url: string;
}

interface Props {
    item: InventoryItem | null;
    onClose: () => void;
    onAddItem: (item: InventoryItem, quantity: number, provider: string) => void;
}

export default function AddItemModal({item , onClose , onAddItem} : Props) {
    const [quantity, setQuantity] = useState(1);
    const [provider, setProvider] = useState('Blinkit');

    if(!item) return null;

    const handleAdd = () => {
        onAddItem(item,quantity,provider);
        onClose();
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{item.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>

                <img src={item.image_url} alt={item.name} className="w-full h-48 object-contain mb-4 rounded" />

                <p className="text-xl font-semibold text-gray-800 mb-4">Price: ₹{item.price}</p>

                {/* Quantity Selector */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                    <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-10 bg-gray-200 rounded-full text-lg font-bold"
                    >
                        -
                    </button>
                    <span className="text-2xl font-bold">{quantity}</span>
                    <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-10 h-10 bg-gray-200 rounded-full text-lg font-bold"
                    >
                        +
                    </button>
                </div>

                {/* Provider Selector */}
                <div className="mb-6">
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                        Provider
                    </label>
                    <select
                        id="provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="Blinkit">Blinkit</option>
                        <option value="Swiggy">Swiggy</option>
                        <option value="Zepto">Zepto</option>
                    </select>
                </div>

                {/* Add to Queue Button */}
                <button
                    onClick={handleAdd}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700"
                >
                    Add to Queue
                </button>
            </div>
        </div>
    );
}