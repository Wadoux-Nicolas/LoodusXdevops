import "./parameters.scss"
import {parametersTagName} from "./parameters-helper";

class Parameters extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch("features/parameters/parameters.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);
    }
}

customElements.define(parametersTagName, Parameters);

