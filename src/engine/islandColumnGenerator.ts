import type { ColumnLayout } from "./columnLayout";

function pseudoRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

export function createIslandColumnPath(
    col: ColumnLayout,
    offset: number = 0,
    seed: number = 1,
): string {
    const x = col.x - offset;
    const y = col.y - offset;
    const w = col.width + offset * 2;
    const h = col.height + offset * 2;

    const r = 16;
    const v1 = (pseudoRandom(seed + 1) - 0.5) * 6;
    const v2 = (pseudoRandom(seed + 2) - 0.5) * 6;
    const v3 = (pseudoRandom(seed + 3) - 0.5) * 6;

    return `
    M ${x + r} ${y}
    H ${x + w - r + v1}
    Q ${x + w} ${y} ${x + w} ${y + r}
    V ${y + h - r + v2}
    Q ${x + w} ${y + h} ${x + w - r} ${y + h}
    H ${x + r + v3}
    Q ${x} ${y + h} ${x} ${y + h - r}
    V ${y + r}
    Q ${x} ${y} ${x + r} ${y}
    Z
  `;
}
