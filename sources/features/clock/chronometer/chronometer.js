import "./chronometer.scss"
import {chronometerTagName} from "./chronometer-helpers";

fetch("features/clock/chronometer/chronometer.html")
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class Chronometer extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = html;
            // Write your code here, it will be executed when the component is loaded
        }
    }
    customElements.define(chronometerTagName, Chronometer);
}