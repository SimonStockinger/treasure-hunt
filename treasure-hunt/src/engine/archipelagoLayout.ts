import type { DayData, Point, MapOrientation } from "../types";

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

export function layoutArchipelago(
    days: DayData[],
    orientation: MapOrientation = "vertical",
): ArchipelagoResult {
    return orientation === "horizontal"
        ? layoutHorizontal(days)
        : layoutVertical(days);
}

/**
 * VERTIKAL-MODUS (Mobile / Hochformat 2-Spalten Reißverschluss)
 */
function layoutVertical(days: DayData[]): ArchipelagoResult {
    const weekKeys = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const islands: DynamicIsland[] = [];
    const canvasWidth = 1000;
    const colLeftX = 280;
    const colRightX = 720;
    const startY = 160;

    let currentY = startY;
    let prevRadiusY = 0;

    weekKeys.forEach((key, index) => {
        const dayData = days.find((d) => d.day === key) || {
            day: key as any,
            label: key,
            events: [],
        };
        const eventCount = Math.max(dayData.events.length, 1);
        const hasMain = dayData.events.some((e) => e.isMainEvent);

        const radiusX = 175 + (hasMain ? 20 : 0);
        const radiusY = 80 + eventCount * 36 + (hasMain ? 20 : 0);

        const isLeft = index % 2 === 0;
        const centerX = isLeft ? colLeftX : colRightX;

        if (index === 0) {
            currentY = startY + radiusY;
        } else {
            currentY += (prevRadiusY + radiusY) * 0.88;
        }
        prevRadiusY = radiusY;

        const center: Point = { x: centerX, y: currentY };

        const entryPoint: Point = {
            x: isLeft ? center.x + radiusX * 0.65 : center.x - radiusX * 0.65,
            y: center.y - radiusY * 0.6,
        };
        const exitPoint: Point = {
            x: isLeft ? center.x + radiusX * 0.65 : center.x - radiusX * 0.65,
            y: center.y + radiusY * 0.6,
        };

        const eventPoints = createEventPoints(
            dayData,
            center,
            radiusY,
            "vertical",
        );

        islands.push({
            dayData,
            index,
            center,
            radiusX,
            radiusY,
            entryPoint,
            exitPoint,
            eventPoints,
        });
    });

    return {
        islands,
        totalWidth: canvasWidth,
        totalHeight: currentY + prevRadiusY + 120,
        orientation: "vertical",
    };
}

/**
 * HORIZONTAL-MODUS (Desktop / Querformat 2-Reihen Zick-Zack)
 */
function layoutHorizontal(days: DayData[]): ArchipelagoResult {
    const weekKeys = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const islands: DynamicIsland[] = [];
    const canvasHeight = 900;
    const rowTopY = 270;
    const rowBottomY = 630;
    const startX = 180;

    let currentX = startX;
    let prevRadiusX = 0;

    weekKeys.forEach((key, index) => {
        const dayData = days.find((d) => d.day === key) || {
            day: key as any,
            label: key,
            events: [],
        };
        const eventCount = Math.max(dayData.events.length, 1);
        const hasMain = dayData.events.some((e) => e.isMainEvent);

        const radiusX = 100 + eventCount * 12 + (hasMain ? 20 : 0);
        const radiusY = 140 + eventCount * 18 + (hasMain ? 20 : 0);

        const isTop = index % 2 === 0;
        const centerY = isTop ? rowTopY : rowBottomY;

        if (index === 0) {
            currentX = startX + radiusX;
        } else {
            // Horizontales Aneinander-Schmiegen
            currentX += (prevRadiusX + radiusX) * 0.9;
        }
        prevRadiusX = radiusX;

        const center: Point = { x: currentX, y: centerY };

        const entryPoint: Point = {
            x: center.x - radiusX * 0.6,
            y: isTop ? center.y + radiusY * 0.6 : center.y - radiusY * 0.6,
        };
        const exitPoint: Point = {
            x: center.x + radiusX * 0.6,
            y: isTop ? center.y + radiusY * 0.6 : center.y - radiusY * 0.6,
        };

        const eventPoints = createEventPoints(
            dayData,
            center,
            radiusY,
            "horizontal",
        );

        islands.push({
            dayData,
            index,
            center,
            radiusX,
            radiusY,
            entryPoint,
            exitPoint,
            eventPoints,
        });
    });

    return {
        islands,
        totalWidth: currentX + prevRadiusX + 160,
        totalHeight: canvasHeight,
        orientation: "horizontal",
    };
}

function createEventPoints(
    dayData: DayData,
    center: Point,
    radiusY: number,
    orientation: MapOrientation,
): Point[] {
    const points: Point[] = [];
    if (dayData.events.length > 0) {
        const stepY = (radiusY * 2 - 80) / dayData.events.length;
        const topOffset = center.y - radiusY + 50;

        dayData.events.forEach((_, idx) => {
            const waveX =
                Math.sin(idx * 1.5) * (orientation === "vertical" ? 16 : 8);
            points.push({
                x: center.x + waveX,
                y: topOffset + (idx + 0.5) * stepY,
            });
        });
    }
    return points;
}
