import type { DynamicIsland } from "../layout/archipelagoLayout";
import type { Point } from "../../types";

export function generateSeamlessMasterRoute(islands: DynamicIsland[]): string {
    if (islands.length === 0) return "";

    const segments: string[] = [];

    for (let i = 0; i < islands.length; i++) {
        const current = islands[i];

        // Island Path
        const inlandPoints: Point[] = [current.entryPoint];
        if (current.eventPoints.length > 0) {
            inlandPoints.push(...current.eventPoints);
        } else {
            inlandPoints.push(current.center);
        }
        inlandPoints.push(current.exitPoint);

        if (i === 0) {
            segments.push(
                `M ${inlandPoints[0].x.toFixed(1)} ${inlandPoints[0].y.toFixed(1)}`,
            );
        }
        segments.push(generateInlandSubPath(inlandPoints));

        // Sea Path to next island
        if (i < islands.length - 1) {
            const next = islands[i + 1];
            const seaCurve = createSlopedSeaRoute(
                current.exitPoint,
                next.entryPoint,
                islands,
                i,
                i + 1,
            );
            segments.push(seaCurve);
        }
    }

    return segments.join(" ");
}

function generateInlandSubPath(pts: Point[]): string {
    let d = "";
    for (let j = 0; j < pts.length - 1; j++) {
        const p1 = pts[j];
        const p2 = pts[j + 1];
        const midX = (p1.x + p2.x) / 2 + (j % 2 === 0 ? 1 : -1) * 10;
        const midY = (p1.y + p2.y) / 2;
        d += ` Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
}

function createSlopedSeaRoute(
    start: Point,
    end: Point,
    allIslands: DynamicIsland[],
    fromIdx: number,
    toIdx: number,
): string {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 1) return `L ${end.x} ${end.y}`;

    const nx = -dy / dist;
    const ny = dx / dist;

    const curveSign = fromIdx % 2 === 0 ? 1 : -1;
    const maxBulge = Math.min(dist * 0.65, 140) * curveSign;

    let wp1: Point = {
        x: start.x + dx * 0.3 + nx * maxBulge,
        y: start.y + dy * 0.3 + ny * maxBulge,
    };

    let wp2: Point = {
        x: start.x + dx * 0.7 + nx * (maxBulge * 0.5),
        y: start.y + dy * 0.7 + ny * (maxBulge * 0.5),
    };

    // Collision checking
    [wp1, wp2].forEach((wp) => {
        allIslands.forEach((island, idx) => {
            if (idx !== fromIdx && idx !== toIdx) {
                const safeRadius =
                    Math.max(island.radiusX, island.radiusY) + 45;
                const dToIsland = Math.hypot(
                    wp.x - island.center.x,
                    wp.y - island.center.y,
                );

                if (dToIsland < safeRadius) {
                    const pushFactor = (safeRadius - dToIsland) * 1.5;
                    wp.x +=
                        ((wp.x - island.center.x) / (dToIsland || 1)) *
                        pushFactor;
                    wp.y +=
                        ((wp.y - island.center.y) / (dToIsland || 1)) *
                        pushFactor;
                }
            }
        });
    });

    // Return combined curve
    return ` C ${wp1.x.toFixed(1)} ${wp1.y.toFixed(1)}, ${wp2.x.toFixed(1)} ${wp2.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}
