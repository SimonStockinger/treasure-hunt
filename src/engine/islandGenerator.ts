import type { DayData, TerrainType } from "../types";
import { terrColors, TERRAIN_NAMES } from "../types";

export function getIslandConfig(dayData?: DayData, isLastDay: boolean = false) {
    const eventCount = dayData?.events?.length || 0;
    const hasMainEvent = dayData?.events?.some((e) => e.isMainEvent) || false;

    let radius = calculateRadius(eventCount);
    let terrain: TerrainType = dayData?.terrain || pickTerrain();

    if (isLastDay) {
        terrain = "treasure";
    } else if (hasMainEvent) {
        radius *= 1.1;
    }

    const landColor = terrColors[terrain];
    const beachColor = "#c2a679";

    return { radius, landColor, beachColor, hasMainEvent, eventCount, terrain };
}

function calculateRadius(eventCount: number): number {
    const baseRadius = 35;
    const growth = 45;
    return baseRadius + growth * (1 - Math.pow(0.5, eventCount));
}

export function pickTerrain(): TerrainType {
    const randomIndex = Math.floor(Math.random() * TERRAIN_NAMES.length);
    return TERRAIN_NAMES[randomIndex];
}
