import "./home.scss"
import {openModal} from "../../shared/components/modal/modal-helpers";
import {parametersTagName} from "../parameters/parameters-helper";
import {homeTagName} from "./home-helpers";
import {calculatorTagName} from "../calculator/calculator-helpers";
import {clockTagName} from "../clock/clock-helpers";
import {ticTacToeTagName} from "../tic-tac-toe/tic-tac-toe-helpers";
import {getUrl, local} from "../../shared/helper";
import bobAvatar from "../../shared/assets/images/bob.png";

class Home extends HTMLElement {

    constructor() {
        super();
    }

    get clockDate() {
        return this.querySelector("#clock-date");
    }

    async connectedCallback() {
        // /sources ou .
        await fetch(getUrl("features/home/home.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelectorAll(".parameters-button").forEach(e => e.addEventListener("click", () => {
            openModal(parametersTagName);
        }));
        this.querySelectorAll(".calculator-button").forEach(e => e.addEventListener("click", () => {
            openModal(calculatorTagName);
        }));
        this.querySelectorAll(".clock-button").forEach(e => e.addEventListener("click", () => {
            openModal(clockTagName);
        }));
        this.querySelectorAll(".tic-tac-toe-button").forEach(e => e.addEventListener("click", () => {
            openModal(ticTacToeTagName);
        }));

        this.querySelectorAll(".avatar").forEach(img => {
            img.src = bobAvatar;
        });

        document.addEventListener('toggle-home-mode', (event) => {
            this.querySelector('#home-small-icons').classList.toggle('hidden');
            this.querySelector('#home-big').classList.toggle('hidden');
        });

        // Delay clock animation
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentSeconds =  Math.round((now - today) / 1000);
        const seconds = (currentSeconds / 60) % 1; // %1 is the decimal part, to get only seconds of the day
        const minutes = (currentSeconds / 3600) % 1;
        const hours = (currentSeconds / 43200) % 1;

        this.setTime(60 * seconds, "second");
        this.setTime(3600 * minutes, "minute");
        this.setTime(43200 * hours, "hour");

        setInterval(() => {
            this.displayDay();
        }, 1000);
    }

    setTime(left, hand) {
        this.querySelector(`#${hand}-hand`).style.animationDelay = `-${left}s`;
    }

    displayDay() {
        const date = new Date();
        const dayNumber = date.getDate();
        const dayMonth = date.toLocaleString(local(), {month: 'long'});

        this.clockDate.innerHTML = `${dayNumber} ${dayMonth}`;
    }
}

customElements.define(homeTagName, Home);
