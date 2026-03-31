// Type definitions for furniture data

// General Furniture type
export interface Furniture {
    id: string;
    name: string;
    description?: string;
    price: number;
    material: string;
    dimensions: Dimensions;
    availability: boolean;
}

// Dimensions type for furniture
export interface Dimensions {
    width: number;
    height: number;
    depth: number;
}