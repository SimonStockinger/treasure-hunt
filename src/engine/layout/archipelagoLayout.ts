import type {
    DayData,
    Point,
    MapOrientation,
    DynamicIsland,
    ArchipelagoResult,
} from "../../types";
import { posPseudoRandom } from "../util/random";

const WEEK_KEYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

interface OrientationConfig {
    canvasWidth: number | null;
    canvasHeight: number | null;
    overlapFactor: number;
    endPadding: number;
    startCoord: number;
    computeRadii: (
        eventCount: number,
        hasMain: boolean,
    ) => { radiusX: number; radiusY: number };
    computeCrossCoord: (isEven: boolean) => number;
    computeDefaultPoints: (
        center: Point,
        radiusX: number,
        radiusY: number,
        isEven: boolean,
    ) => {
        entryPoint: Point;
        exitPoint: Point;
    };
}

const VERTICAL_CONFIG: OrientationConfig = {
    canvasWidth: 1000,
    canvasHeight: null,
    overlapFactor: 0.88,
    endPadding: 120,
    startCoord: 160,
    computeRadii: (eventCount, hasMain) => ({
        radiusX: 175 + (hasMain ? 20 : 0),
        radiusY: 80 + eventCount * 36 + (hasMain ? 20 : 0),
    }),
    computeCrossCoord: (isLeft) => (isLeft ? 280 : 720),
    computeDefaultPoints: (center, radiusX, radiusY, isLeft) => {
        const offsetX = (isLeft ? 1 : -1) * radiusX * 0.65;
        return {
            entryPoint: { x: center.x + offsetX, y: center.y - radiusY * 0.6 },
            exitPoint: { x: center.x + offsetX, y: center.y + radiusY * 0.6 },
        };
    },
};

const HORIZONTAL_CONFIG: OrientationConfig = {
    canvasWidth: null,
    canvasHeight: 900,
    overlapFactor: 0.9,
    endPadding: 160,
    startCoord: 180,
    computeRadii: (eventCount, hasMain) => ({
        radiusX: 100 + eventCount * 12 + (hasMain ? 20 : 0),
        radiusY: 140 + eventCount * 18 + (hasMain ? 20 : 0),
    }),
    computeCrossCoord: (isTop) => (isTop ? 270 : 630),
    computeDefaultPoints: (center, radiusX, radiusY, isTop) => {
        const offsetY = (isTop ? 1 : -1) * radiusY * 0.6;
        return {
            entryPoint: { x: center.x - radiusX * 0.6, y: center.y + offsetY },
            exitPoint: { x: center.x + radiusX * 0.6, y: center.y + offsetY },
        };
    },
};

export function layoutArchipelago(
    days: DayData[],
    orientation: MapOrientation = "vertical",
): ArchipelagoResult {
    const isVertical = orientation === "vertical";
    const config = isVertical ? VERTICAL_CONFIG : HORIZONTAL_CONFIG;
    const islands: DynamicIsland[] = [];

    let currentMainCoord = config.startCoord;
    let prevRadiusMain = 0;

    WEEK_KEYS.forEach((key, index) => {
        const dayData = days.find((d) => d.day === key) ?? {
            day: key as any,
            label: key,
            events: [],
        };

        const eventCount = Math.max(dayData.events.length, 1);
        const hasMain = dayData.events.some((e) => e.isMainEvent);
        const { radiusX, radiusY } = config.computeRadii(eventCount, hasMain);

        const radiusMain = isVertical ? radiusY : radiusX;
        const isEven = index % 2 === 0;
        const crossCoord = config.computeCrossCoord(isEven);

        if (index === 0) {
            currentMainCoord = config.startCoord + radiusMain;
        } else {
            currentMainCoord +=
                (prevRadiusMain + radiusMain) * config.overlapFactor;
        }
        prevRadiusMain = radiusMain;

        const center: Point = isVertical
            ? { x: crossCoord, y: currentMainCoord }
            : { x: currentMainCoord, y: crossCoord };

        const eventPoints = createEventPoints(
            dayData,
            center,
            radiusY,
            orientation,
            index,
        );
        const { entryPoint, exitPoint } = resolveBoundaryPoints(
            eventPoints,
            config.computeDefaultPoints(center, radiusX, radiusY, isEven),
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

    const totalDimension =
        currentMainCoord + prevRadiusMain + config.endPadding;

    return {
        islands,
        totalWidth: isVertical
            ? (config.canvasWidth as number)
            : totalDimension,
        totalHeight: isVertical
            ? totalDimension
            : (config.canvasHeight as number),
        orientation,
    };
}

function resolveBoundaryPoints(
    eventPoints: Point[],
    defaultPoints: { entryPoint: Point; exitPoint: Point },
): { entryPoint: Point; exitPoint: Point } {
    if (eventPoints.length === 0) {
        return defaultPoints;
    }

    const first = eventPoints[0];
    const last = eventPoints[eventPoints.length - 1];

    return {
        entryPoint: { x: first.x, y: first.y },
        exitPoint: { x: last.x, y: last.y },
    };
}

function createEventPoints(
    dayData: DayData,
    center: Point,
    radiusY: number,
    orientation: MapOrientation,
    dayIndex: number,
): Point[] {
    const count = dayData.events.length;
    if (count === 0) return [];

    const stepY = (radiusY * 2 - 80) / count;
    const topOffset = center.y - radiusY + 50;
    const amplitude = orientation === "vertical" ? 32 : 16;

    return dayData.events.map((_, idx) => {
        const seed = dayIndex * 42 + idx;
        const sign = posPseudoRandom(seed) < 0.5 ? -1 : 1;
        const waveX = Math.sin(idx * 1.5) * amplitude * sign;

        return {
            x: center.x + waveX,
            y: topOffset + (idx + 0.5) * stepY,
        };
    });
}
