import {useEffect, useState} from "react";
import img from "next/image";
interface InventoryItem  {
    id: number;
    name: string;
    price: string;
    image_url: string;
}

interface Props {
    inventory: InventoryItem[];
    onItemClick: (item: InventoryItem) => void;
    isPaused: boolean; // Tells the carousel to stop rotating
}

export default function InventoryCarousel({ inventory, onItemClick, isPaused }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isPaused) {
            console.log("ive paused roation")
            return; // Don't rotate if the modal is open or search is active
        }

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % inventory.length);
        }, 3000);

        return () => clearInterval(interval); // clean up the interval

    },[isPaused, inventory.length])

    const itemsToShow = 5;
    const middleIndex = Math.floor(itemsToShow / 2);

    const getDisplayedItems = () => {
        const items : InventoryItem[] = [];
        if (inventory.length === 0) return items;
        const seen = new Set(items); // start with existing ones, if any
        for (let i = 0; i < itemsToShow; i++) {
            const itemIndex = (currentIndex + i - middleIndex + inventory.length) % inventory.length;
            const item = inventory[itemIndex];
            if (!seen.has(item)) {
                seen.add(item);
                items.push(item);
            }
        }
        return items;
    };

    const displayedItems = getDisplayedItems();

    if (inventory.length === 0) {
        return <div className="text-center text-gray-500">No inventory items found.</div>;
    }

    return (
        <div className="flex items-center justify-center w-full h-48 overflow-hidden">
            {displayedItems.map((item, index) => {
                const isCenter = index === middleIndex;
                return (
                    <div
                        key={item.id}
                        className={`flex-shrink-0 flex flex-col items-center justify-center p-2 mx-2 transition-all duration-300 cursor-pointer ${
                            isCenter
                                ? 'scale-110' // Enlarge center item
                                : 'scale-90 opacity-60' // Shrink and fade other items
                        }`}
                        onClick={() => onItemClick(item)}
                    >
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-24 h-24 object-contain"
                        />
                        <span className="mt-1 text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                );
            })}
        </div>
    );

}