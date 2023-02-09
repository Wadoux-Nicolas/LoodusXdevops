import "./home.scss"
import {openModal} from "../../shared/components/modal/modal-helpers";
import {parametersTagName} from "../parameters/parameters-helper";
import {homeTagName} from "./home-helpers";
import {calculatorTagName} from "../calculator/calculator-helpers";
import {clockTagName} from "../clock/clock-helpers";
import {ticTacToeTagName} from "../tic-tac-toe/tic-tac-toe-helpers";
import {getUrl, local, updateAvatar} from "../../shared/js/helper";

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

        document.addEventListener('toggle-home-mode', () => {
            this.querySelector('#home-small-icons').classList.toggle('hidden');
            const homeBig = this.querySelector('#home-big');
            homeBig.classList.toggle('hidden');
            if (!homeBig.classList.contains('hidden')) {
                this.displayClock();
            }
        });

        this.displayClock();
        this.displayDay();
        setInterval(() => {
            this.displayDay();
        }, 1000);

        updateAvatar();
    }

    displayClock() {
        // Delay clock animation
        const now = new Date();

        this.setTime(now.getSeconds(), "second");
        this.setTime(now.getMinutes() * 60, "minute");
        this.setTime(now.getHours() * 60 * 60, "hour");
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
