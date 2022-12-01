import "./home.scss"
import {openModal} from "../../shared/components/modal/modal-helpers";
import {parametersTagName} from "../parameters/parameters-helper";
import {homeTagName} from "./home-helpers";
import {calculatorTagName} from "../calculator/calculator-helpers";
import {clockTagName} from "../clock/clock-helpers";

class Home extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch("features/home/home.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelector("#parameters-button").addEventListener("click", () => {
            openModal(parametersTagName);
        });
        this.querySelector("#calculator-button").addEventListener("click", () => {
            openModal(calculatorTagName);
        });
        this.querySelector("#clock-button").addEventListener("click", () => {
            openModal(clockTagName);
        });
    }
}

customElements.define(homeTagName, Home);
