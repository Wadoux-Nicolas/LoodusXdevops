import "./home.scss"
import {openModal} from "../../shared/components/modal/modal-helpers";
import {parametersTagName} from "../parameters/parameters-helper";
import {homeTagName} from "./home-helpers";
import {calculatorTagName} from "../calculator/calculator-helpers";
import {clockTagName} from "../clock/clock-helpers";
import {ticTacToeTagName} from "../tic-tac-toe/tic-tac-toe-helpers";

class Home extends HTMLElement {

    constructor() {
        super();
    }

    get home() {
        return this.getElementById("home");
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
        this.querySelector("#tic-tac-toe-button").addEventListener("click", () => {
            openModal(ticTacToeTagName);
        });
    }
}

customElements.define(homeTagName, Home);
