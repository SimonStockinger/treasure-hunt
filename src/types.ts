export type WeekDay = "Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So";

export const TERRAIN_NAMES = [
    "sandbank",
    "jungle",
    "skull_rock",
    "fortress",
    "volcano",
    "treasure",
] as const;

export type TerrainType = (typeof TERRAIN_NAMES)[number];
export type TerrMap = Record<TerrainType, string>;
export const terrColors: TerrMap = {
    sandbank: "#d8c59d",
    jungle: "#8da37d",
    skull_rock: "#91897e",
    fortress: "#b48b71",
    volcano: "#7a5c58",
    treasure: "#c9a85c",
};

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

export interface DynamicIsland {
    dayData: DayData;
    index: number;
    center: Point;
    radiusX: number;
    radiusY: number;
    entryPoint: Point;
    exitPoint: Point;
    eventPoints: Point[];
}

export interface ArchipelagoResult {
    islands: DynamicIsland[];
    totalWidth: number;
    totalHeight: number;
    orientation: MapOrientation;
}
