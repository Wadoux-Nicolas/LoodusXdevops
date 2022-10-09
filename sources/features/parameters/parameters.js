import "./parameters.scss"
import {parametersTagName} from "./parameters-helper";

fetch("features/parameters/parameters.html")
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class Parameters extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = html;
        }
    }
    customElements.define(parametersTagName, Parameters);
}

