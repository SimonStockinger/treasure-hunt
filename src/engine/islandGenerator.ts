import type { DayData, TerrainType } from "../types";
import { terrColors, TERRAIN_NAMES } from "../types";

export function getIslandConfig(dayData?: DayData, isLastDay: boolean = false) {
    const eventCount = dayData?.events?.length || 0;
    const hasMainEvent = dayData?.events?.some((e) => e.isMainEvent) || false;

    let terrain: TerrainType = dayData?.terrain || pickTerrain();

    if (isLastDay) {
        terrain = "treasure";
    }
    const landColor = terrColors[terrain];
    const beachColor = "#c2a679";

    return { landColor, beachColor, hasMainEvent, eventCount, terrain };
}

export function pickTerrain(): TerrainType {
    const randomIndex = Math.floor(Math.random() * TERRAIN_NAMES.length);
    return TERRAIN_NAMES[randomIndex];
}
