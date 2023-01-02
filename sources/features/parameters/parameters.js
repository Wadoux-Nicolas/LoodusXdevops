import "./parameters.scss"
import {parametersTagName} from "./parameters-helper";
import {getUrl} from "../../shared/helper";

class Parameters extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("features/parameters/parameters.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);
    }
}

customElements.define(parametersTagName, Parameters);

