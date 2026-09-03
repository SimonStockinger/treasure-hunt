export function pseudoRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

export function posPseudoRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    const frac = x - Math.floor(x);
    return frac === 0 ? Number.EPSILON : Math.abs(frac);
}
