import { PirateMapElement } from "./PirateMapElement";

if (!customElements.get("pirate-week-map")) {
    customElements.define("pirate-week-map", PirateMapElement);
}

export { PirateMapElement };
