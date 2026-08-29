export type WeekDay = "Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So";

export type TerrainType =
    "sandbank" | "jungle" | "skull_rock" | "fortress" | "volcano";

export interface MapEvent {
    id: string;
    title: string;
    time?: string;
    location?: string;
    description?: string;
    isMainEvent?: boolean;
}

export interface DayData {
    day: WeekDay;
    label: string;
    events: MapEvent[];
    terrain?: TerrainType;
}

export interface Point {
    x: number;
    y: number;
}

export interface MapOptions {
    width: number;
    height: number;
    theme?: "parchment" | "night" | "treasure";
}

export type MapOrientation = "horizontal" | "vertical";
