// Define the basic inventory item structure
export interface InventoryItem {
    id: number;
    name: string;
    price: string;
    image_url: string;
}

// Define the full queue item structure returned by Django
export interface QueueItem {
    id: number; // PK of the QueueItem entry
    inventory_item: InventoryItem; // Nested object with full details
    added_by: string; // User identifier (e.g., email)
    quantity: number;
    provider: string;
    added_at: string; // ISO timestamp string
}