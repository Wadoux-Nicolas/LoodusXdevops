import "./parameters.scss"
import {parametersTagName} from "./parameters-helper";

class Parameters extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch("features/calculator/calculator.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);
    }
}

customElements.define(parametersTagName, Parameters);

