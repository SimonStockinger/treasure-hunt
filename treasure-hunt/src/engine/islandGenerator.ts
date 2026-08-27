import type { DayData, TerrainType } from "../types";

export function getIslandConfig(dayData?: DayData, isLastDay: boolean = false) {
    const eventCount = dayData?.events?.length || 0;
    const hasMainEvent = dayData?.events?.some((e) => e.isMainEvent) || false;

    let radius = 45;
    let landColor = "#d2b48c"; // Sandbank-Gelb
    let beachColor = "#c2a679";
    let terrain: TerrainType = dayData?.terrain || "sandbank";

    if (hasMainEvent || isLastDay) {
        radius = 70;
        landColor = "#8a9a5b"; // Dschungel/Berg-Grün
        terrain = dayData?.terrain || (isLastDay ? "volcano" : "skull_rock");
    } else if (eventCount > 1) {
        radius = 60;
        landColor = "#97a97c";
        terrain = dayData?.terrain || "fortress";
    } else if (eventCount === 1) {
        radius = 52;
        landColor = "#a3b18a";
        terrain = dayData?.terrain || "jungle";
    }

    return { radius, landColor, beachColor, hasMainEvent, eventCount, terrain };
}
