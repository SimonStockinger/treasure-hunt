import type { DayData, TerrainType } from "../types";

export function getIslandConfig(dayData?: DayData, isLastDay: boolean = false) {
    const eventCount = dayData?.events?.length || 0;
    const hasMainEvent = dayData?.events?.some((e) => e.isMainEvent) || false;

    let radius = 45;
    let landColor = "#d2b48c";
    let beachColor = "#c2a679";
    let terrain: TerrainType = dayData?.terrain || "sandbank";

    /*
    if (hasMainEvent || isLastDay) {
        radius = 70;
        landColor = "#8a9a5b";
        terrain = dayData?.terrain || (isLastDay ? "volcano" : "skull_rock");
    } else if (eventCount > 1) {
        radius = 60;
        landColor = "#97a97c";
        terrain = dayData?.terrain || "fortress";
    } else if (eventCount === 1) {
        radius = 42;
        landColor = "#a3b18a";
        terrain = dayData?.terrain || "jungle";
    }
    */

    // TODO: Randomize island generation.
    radius = calculateRadius(eventCount);

    if (hasMainEvent || isLastDay) {
        radius = calculateRadius(eventCount);
        landColor = "#8a9a5b";
        terrain = dayData?.terrain || (isLastDay ? "volcano" : "skull_rock");
    } else if (eventCount > 1) {
        radius = calculateRadius(eventCount);
        landColor = "#97a97c";
        terrain = dayData?.terrain || "fortress";
    } else if (eventCount === 1) {
        radius = calculateRadius(eventCount);
        landColor = "#a3b18a";
        terrain = dayData?.terrain || "jungle";
    }

    return { radius, landColor, beachColor, hasMainEvent, eventCount, terrain };
}

function calculateRadius(eventCount: number): number {
    const maxRadius = 80;
    return maxRadius * (1 - Math.pow(0.5, eventCount));
}

// Alternativ mit Math.exp:
function calculateRadiusExp(eventCount: number): number {
    const maxRadius = 80;
    return maxRadius * (1 - Math.exp(-Math.LN2 * eventCount));
}
