import type { Point, TerrainType } from "../types";

/**
 * Zeichnet eine klassische Kompassrose (oben rechts).
 */
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

/**
 * Rendert kleine Meeres-Wellenlinien zur Dekoration.
 */
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

/**
 * Rendert das Seeungeheuer (Tentakel / Schlange).
 */
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

/**
 * Rendert ein kleines Piratenschiff auf offener See.
 */
export function renderShip(position: Point = { x: 300, y: 300 }): string {
    return `
    <g class="ship" transform="translate(${position.x}, ${position.y}) scale(0.85)" opacity="0.75">
      <!-- Schiffsrumpf -->
      <path d="M -20 5 L 20 5 Q 16 16 -5 16 L -16 16 Z" fill="#4a2e18" stroke="#2b1704" stroke-width="1.5" />
      <!-- Mast & Rah -->
      <line x1="0" y1="5" x2="0" y2="-22" stroke="#2b1704" stroke-width="2" />
      <!-- Segel -->
      <path d="M 0 -20 Q 12 -13 0 -5 Z" fill="#fdfbf7" stroke="#2b1704" stroke-width="1.2" />
      <!-- Piratenflagge (Jolly Roger) -->
      <polygon points="0,-22 -7,-18 0,-15" fill="#1a1a1a" />
    </g>
  `;
}

/**
 * Rendert spezifische Terrain-Features auf den Inseln (Palmen, Berge, Totenkopf, Vulkan).
 */
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
            // Zwei kleine Palmen
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

export function renderDockedShip(pos: Point): string {
    return `
    <!-- Äußere Gruppe: Feste Position auf der Karte -->
    <g transform="translate(${pos.x - 25}, ${pos.y + 15})">
      <!-- Innere Gruppe: Bekommt die CSS-Animation -->
      <g class="docked-flagship-bob" scale(1.1)>
        <!-- Wellen-Gischt am Rumpf -->
        <path d="M -15 14 Q 0 18 15 14 Q 30 18 45 14" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.65" />

        <!-- Schiffsrumpf -->
        <path d="M -8 2 L 36 2 Q 30 16 10 16 L -4 16 Z" fill="#3e2723" stroke="#1f140e" stroke-width="2" />

        <!-- Mast & Rah -->
        <line x1="14" y1="2" x2="14" y2="-28" stroke="#1f140e" stroke-width="2.5" />
        <line x1="2" y1="-14" x2="26" y2="-14" stroke="#1f140e" stroke-width="1.5" />

        <!-- Gebauschtes Rah-Segel -->
        <path d="M 3 -25 Q 14 -18 3 -12 L 25 -12 Q 14 -18 25 -25 Z" fill="#f5f0dc" stroke="#2b1704" stroke-width="1.2" />

        <!-- Piratenflagge (Jolly Roger) -->
        <polygon points="14,-28 2,-23 14,-18" fill="#1a1a1a" />
        <circle cx="9" cy="-23" r="1.5" fill="#fdfbf7" />

        <!-- Ankerkette ins Wasser -->
        <line x1="-6" y1="12" x2="-16" y2="24" stroke="#2b1704" stroke-width="1.5" stroke-dasharray="2,2" />
        <!-- Anker-Icon -->
        <text x="-22" y="32" font-size="14" fill="#1f140e">⚓</text>
      </g>
    </g>
  `;
}
