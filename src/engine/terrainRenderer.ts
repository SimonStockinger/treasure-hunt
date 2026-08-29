import type { Point, TerrainType } from "../types";

export function renderCompassRose(center: Point = { x: 1080, y: 120 }): string {
    const size = 55;
    return `
    <g class="compass-rose" transform="translate(${center.x}, ${center.y})" opacity="0.85">
      <!-- Äußere Ringe -->
      <circle r="${size}" fill="none" stroke="#6b4423" stroke-width="1.5" stroke-dasharray="2,3" />
      <circle r="${size - 8}" fill="none" stroke="#6b4423" stroke-width="2" />

      <!-- Stern-Spitzen (Nord, Ost, Süd, West) -->
      <!-- Nord-Nadel (Hauptrichtung) -->
      <polygon points="0,-${size + 5} 7,-6 0,0" fill="#b71c1c" />
      <polygon points="0,-${size + 5} -7,-6 0,0" fill="#8b261b" />

      <!-- Süd-Nadel -->
      <polygon points="0,${size} 6,6 0,0" fill="#5c4033" />
      <polygon points="0,${size} -6,6 0,0" fill="#3e2723" />

      <!-- Ost-Nadel -->
      <polygon points="${size},0 6,6 0,0" fill="#5c4033" />
      <polygon points="${size},0 6,-6 0,0" fill="#3e2723" />

      <!-- West-Nadel -->
      <polygon points="-${size},0 -6,6 0,0" fill="#5c4033" />
      <polygon points="-${size},0 -6,-6 0,0" fill="#3e2723" />

      <!-- Nord-Beschriftung -->
      <text x="0" y="-${size + 10}" text-anchor="middle" font-family="'Cinzel Decorative', Georgia, serif" font-weight="900" font-size="14" fill="#8b261b">N</text>
      <circle r="4" fill="#3e2723" />
    </g>
  `;
}

export function renderSeaWaves(points: Point[]): string {
    return points
        .map(
            (p) => `
    <path d="M ${p.x - 15} ${p.y} Q ${p.x - 7.5} ${p.y - 4} ${p.x} ${p.y} Q ${p.x + 7.5} ${p.y - 4} ${p.x + 15} ${p.y}"
          fill="none" stroke="#8d6e63" stroke-width="1.2" opacity="0.45" stroke-linecap="round" />
  `,
        )
        .join("");
}

export function renderSeaMonster(position: Point = { x: 800, y: 220 }): string {
    return `
    <g class="sea-monster" transform="translate(${position.x}, ${position.y})" opacity="0.65">
      <!-- Schlängelnder Höcker -->
      <path d="M -30 10 Q -20 -15 -10 10 Q 0 -20 10 10 Q 20 -10 30 10" fill="none" stroke="#3e2723" stroke-width="2.5" stroke-linecap="round" />
      <!-- Kopf / Tentakel -->
      <path d="M 30 10 Q 42 0 38 -15 Q 32 -18 30 -10" fill="none" stroke="#3e2723" stroke-width="2.5" stroke-linecap="round" />
      <text x="0" y="24" text-anchor="middle" font-size="9" font-style="italic" fill="#5c4033">Hic sunt dracones</text>
    </g>
  `;
}

export function renderShip(position: Point = { x: 300, y: 300 }): string {
    return `
    <g class="ship" transform="translate(${position.x}, ${position.y}) scale(0.85)" opacity="0.75">
      <path d="M -20 5 L 20 5 Q 16 16 -5 16 L -16 16 Z" fill="#4a2e18" stroke="#2b1704" stroke-width="1.5" />
      <!-- Mast & Rah -->
      <line x1="0" y1="5" x2="0" y2="-22" stroke="#2b1704" stroke-width="2" />
      <path d="M 0 -20 Q 12 -13 0 -5 Z" fill="#fdfbf7" stroke="#2b1704" stroke-width="1.2" />
      <!-- Piratenflagge (Jolly Roger) -->
      <polygon points="0,-22 -7,-18 0,-15" fill="#1a1a1a" />
    </g>
  `;
}

export function renderTerrainFeature(
    center: Point,
    terrain: TerrainType,
): string {
    switch (terrain) {
        case "skull_rock":
            return `
        <g transform="translate(${center.x}, ${center.y - 8}) scale(0.9)">
          <path d="M -10 -8 C -10 -18 10 -18 10 -8 C 10 -2 8 2 6 6 L -6 6 C -8 2 -10 -2 -10 -8 Z" fill="#4a3728" />
          <circle cx="-4" cy="-7" r="2.5" fill="#e8d5b5" />
          <circle cx="4" cy="-7" r="2.5" fill="#e8d5b5" />
          <line x1="-3" y1="2" x2="-3" y2="5" stroke="#e8d5b5" stroke-width="1" />
          <line x1="0" y1="2" x2="0" y2="5" stroke="#e8d5b5" stroke-width="1" />
          <line x1="3" y1="2" x2="3" y2="5" stroke="#e8d5b5" stroke-width="1" />
        </g>
      `;

        case "volcano":
            return `
        <g transform="translate(${center.x}, ${center.y - 5})">
          <polygon points="-16,10 0,-12 16,10" fill="#4e342e" stroke="#2b1704" stroke-width="1.5" />
          <polygon points="-4,-12 0,-8 4,-12" fill="#bf360c" />
          <!-- Rauchschwaden -->
          <path d="M 0 -12 Q -6 -20 0 -26 Q 6 -32 2 -38" fill="none" stroke="#8d6e63" stroke-width="1.5" stroke-dasharray="2,3" opacity="0.7" />
        </g>
      `;

        case "fortress":
            return `
        <g transform="translate(${center.x}, ${center.y - 5})">
          <rect x="-12" y="-4" width="24" height="14" fill="#5d4037" stroke="#2b1704" stroke-width="1.5" />
          <!-- Zinnen -->
          <rect x="-12" y="-9" width="6" height="5" fill="#5d4037" stroke="#2b1704" stroke-width="1" />
          <rect x="-3" y="-9" width="6" height="5" fill="#5d4037" stroke="#2b1704" stroke-width="1" />
          <rect x="6" y="-9" width="6" height="5" fill="#5d4037" stroke="#2b1704" stroke-width="1" />
          <path d="M -3 10 L -3 4 Q 0 1 3 4 L 3 10 Z" fill="#2b1704" />
        </g>
      `;

        case "jungle":
        case "sandbank":
        default:
            return `
        <g transform="translate(${center.x}, ${center.y - 4})">
          <!-- Stamm -->
          <path d="M -3 10 Q -1 0 4 -8" fill="none" stroke="#4e342e" stroke-width="2.5" stroke-linecap="round" />
          <!-- Palmblätter -->
          <path d="M 4 -8 Q -4 -16 -8 -10" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" />
          <path d="M 4 -8 Q 6 -18 14 -12" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" />
          <path d="M 4 -8 Q 12 -4 12 2" fill="none" stroke="#2e7d32" stroke-width="1.8" stroke-linecap="round" />
        </g>
      `;
    }
}

export function renderDockedShip(
    pos: Point,
    shipSvgUrl: string = "/public/assets/pirate-ship-svgrepo-com.svg",
    size: { width: number; height: number } = { width: 64, height: 64 },
): string {
    const offsetX = -(size.width / 2);
    const offsetY = -(size.height * 0.75);

    return `
    <g transform="translate(${pos.x}, ${pos.y})">
      <g class="docked-flagship-bob">
        <!-- Wellengischt unter dem Rumpf -->
        <path d="M -20 10 Q 0 16 20 10 Q 35 15 45 10" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.65" />

        <image
          href="${shipSvgUrl}"
          x="${offsetX}"
          y="${offsetY}"
          width="${size.width}"
          height="${size.height}"
          preserveAspectRatio="xMidYMid meet"
        />
        <line x1="-12" y1="6" x2="-22" y2="20" stroke="#2b1704" stroke-width="1.5" stroke-dasharray="2,2" />
        <text x="-28" y="28" font-size="14" fill="#1f140e">⚓</text>
      </g>
    </g>
  `;
}
