import "./chronometer.scss"
import {chronometerTagName} from "./chronometer-helpers";
import {_, getUrl} from "../../../shared/helper";


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

    get tourTable() {
        return this.querySelector("#tour-table");
    }

    get tourRows() {
        return this.querySelectorAll(".tour-row");
    }

    chronometerInterval = null;
    time = 0;
    tours = [];

    async connectedCallback() {
        await fetch(getUrl("features/clock/chronometer/chronometer.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);
        this.chronometerStart.addEventListener("click", () => this.startChronometer());
        this.chronometerPause.addEventListener("click", () => this.pauseChronometer());
        this.chronometerUnpause.addEventListener("click", () => this.startChronometer(this.time));
        this.chronometerReset.addEventListener("click", () => this.resetChronometer());
        this.chronometerTour.addEventListener("click", () => {
            if(!this.chronometerTour.disabled) {
                this.tourTable.classList.remove("hidden");
                this.addTour();
            }
        });
    }

    disconnectedCallback() {
        this.resetChronometer();
    }

    startChronometer(previousTime = 0) {
        const chronometerMinutes = this.querySelector("#chronometer-minutes");
        const chronometerSeconds = this.querySelector("#chronometer-seconds");
        const chronometerMilliseconds = this.querySelector("#chronometer-milliseconds");
        const start = Date.now() - previousTime;

        this.chronometerInterval = setInterval(() => {
            this.time = Date.now() - start;
            chronometerMinutes.innerText = this.getMinutesFromTime(this.time);
            chronometerSeconds.innerText = this.getSecondsFromTime(this.time);
            chronometerMilliseconds.innerText = this.getMillisecondsFromTime(this.time);
        }, 10);

        this.chronometerStart.classList.add("hidden");
        this.chronometerUnpause.classList.add("hidden");
        this.chronometerPause.classList.remove("hidden");
        this.chronometerTour.classList.remove("hidden");
        this.chronometerTour.classList.remove("disabled");
        this.chronometerTour.disabled = false;
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
        this.chronometerTour.disabled = true;
        this.chronometerTour.classList.remove("hidden");
        this.chronometerReset.classList.add("hidden");
        this.tourTable.classList.add("hidden");
        this.tours = [];
        this.tourRows.forEach(row => row.remove());
    }

    addTour() {
        const timeSaved = this.time;
        this.tours.push(timeSaved); // could be usefull for the future
        const tourNumber = this.tours.length;

        let timeDelta = timeSaved;
        if (tourNumber > 1) {
            timeDelta -= this.tours[tourNumber - 2];
        }

        const tourRow = _("tr", null, this.tourTable.querySelector("tbody"), null, "tour-row");
        _("td", tourNumber, tourRow);
        _("td", this.getFullTime(timeSaved), tourRow);
        _("td", this.getFullTime(timeDelta), tourRow);
    }

    getMinutesFromTime(time) {
        return (Math.floor(time / 60000)).toString().padStart(2, "0")
    }

    getSecondsFromTime(time) {
        return (Math.floor(time / 1000) % 60).toString().padStart(2, "0")
    }

    getMillisecondsFromTime(time) {
        return (Math.floor(time / 10) % 100).toString().padStart(2, "0")
    }

    getFullTime(time) {
        return `${this.getMinutesFromTime(time)}:${this.getSecondsFromTime(time)}.${this.getMillisecondsFromTime(time)}`;
    }
}

customElements.define(chronometerTagName, Chronometer);