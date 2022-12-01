import "./stopwatch.scss"
import {stopwatchTagName} from "./stopwatch-helpers";

class Stopwatch extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch("features/clock/stopwatch/stopwatch.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);
        // Write your code here, it will be executed when the component is loaded
    }
}
customElements.define(stopwatchTagName, Stopwatch);