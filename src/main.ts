import { PirateMapElement } from "./PirateMapElement";

if (!customElements.get("treasure-hunt")) {
    customElements.define("treasure-hunt", PirateMapElement);
}

export { PirateMapElement };
