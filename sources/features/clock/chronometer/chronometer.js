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

        get chronometerStart() {
            return this.querySelector("#chronometer-start");
        }

        get chronometerPause() {
            return this.querySelector("#chronometer-pause");
        }

        get chronometerReset() {
            return this.querySelector("#chronometer-reset");
        }

        get chronometerTour() {
            return this.querySelector("#chronometer-tour");
        }

        get chronometerUnpause() {
            return this.querySelector("#chronometer-unpause");
        }

        chronometerInterval = null;
        time = 0;

        connectedCallback() {
            this.innerHTML = html;
            this.chronometerStart.addEventListener("click", () => this.startChronometer());
            this.chronometerPause.addEventListener("click", () => this.pauseChronometer());
            this.chronometerUnpause.addEventListener("click", () => this.startChronometer(this.time));
            this.chronometerReset.addEventListener("click", () => this.resetChronometer());
        }

        startChronometer(previousTime = 0) {
            const chronometerMinutes = this.querySelector("#chronometer-minutes");
            const chronometerSeconds = this.querySelector("#chronometer-seconds");
            const chronometerMilliseconds = this.querySelector("#chronometer-milliseconds");
            const start = Date.now() - previousTime;

            this.chronometerInterval = setInterval(() => {
                this.time = Date.now() - start;
                chronometerMinutes.innerText = (Math.floor(this.time / 60000)).toString().padStart(2, "0");
                chronometerSeconds.innerText = (Math.floor(this.time / 1000) % 60).toString().padStart(2, "0");
                chronometerMilliseconds.innerText = (Math.floor(this.time / 10) % 100).toString().padStart(2, "0");
            }, 10);

            this.chronometerStart.classList.add("hidden");
            this.chronometerUnpause.classList.add("hidden");
            this.chronometerPause.classList.remove("hidden");
            this.chronometerTour.classList.remove("hidden");
            this.chronometerTour.classList.remove("disabled");
            this.chronometerReset.classList.add("hidden");
        }

        pauseChronometer() {
            clearInterval(this.chronometerInterval);
            this.chronometerPause.classList.add("hidden");
            this.chronometerUnpause.classList.remove("hidden");
            this.chronometerTour.classList.add("hidden");
            this.chronometerReset.classList.remove("hidden");
        }

        resetChronometer() {
            clearInterval(this.chronometerInterval);
            this.time = 0;
            this.querySelector("#chronometer-minutes").innerText = "00";
            this.querySelector("#chronometer-seconds").innerText = "00";
            this.querySelector("#chronometer-milliseconds").innerText = "00";
            this.chronometerStart.classList.remove("hidden");
            this.chronometerPause.classList.add("hidden");
            this.chronometerUnpause.classList.add("hidden");
            this.chronometerTour.classList.add("disabled");
            this.chronometerTour.classList.remove("hidden");
            this.chronometerReset.classList.add("hidden");
        }
    }

    customElements.define(chronometerTagName, Chronometer);
}