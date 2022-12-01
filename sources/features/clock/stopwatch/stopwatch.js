import "./stopwatch.scss"
import {stopwatchTagName} from "./stopwatch-helpers";
import {_} from "../../../shared/helper";

class Stopwatch extends HTMLElement {
    interval = null;

    constructor() {
        super();
    }

    get hoursInput() {
        return this.querySelector("#hours-input");
    }

    get minutesInput() {
        return this.querySelector("#minutes-input");
    }

    get secondsInput() {
        return this.querySelector("#seconds-input");
    }

    get timeFromInputs() {
        let hours = parseInt(this.hoursInput.value);
        let minutes = parseInt(this.minutesInput.value);
        let seconds = parseInt(this.secondsInput.value);
        return hours * 3600 + minutes * 60 + seconds;
    }

    get progressBar() {
        return this.querySelector("progress-bar-component");
    }

    getButton(type) {
        return this.querySelector(`#${type}-stopwatch`);
    }

    async connectedCallback() {
        await fetch("features/clock/stopwatch/stopwatch.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.hoursInput.addEventListener("input", (event) => this.padHoursInput(event));
        this.minutesInput.addEventListener("input", () => this.checkTimeInput(this.minutesInput, this.hoursInput));
        this.secondsInput.addEventListener("input", () => this.checkTimeInput(this.secondsInput, this.minutesInput));
        this.getButton('start').addEventListener("click", () => this.start());
        this.getButton('pause').addEventListener("click", () => this.pause());
        this.getButton('restart').addEventListener("click", () => this.restart());
        this.getButton('cancel').addEventListener("click", () => this.reset());
        this.querySelectorAll('.arrow-button').forEach(button => {
            button.addEventListener("mousedown", () => this.arrowButtonClicked(button))
        });
    }

    arrowButtonClicked(button) {
        const action = button.getAttribute('data-action') === 'increase' ? 1 : -1;
        const target = button.getAttribute('data-target');
        const el = this.querySelector(`#${target}`);
        this.increaseInput(el, action);
        let interval;
        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                this.increaseInput(el, action);
            }, 100);
        }, 250);
        button.addEventListener('mouseup', () => {
            clearTimeout(timeout);
            clearInterval(interval);
        });
    }

    increaseInput(el, increment) {
        const value = parseInt(el.value);
        if(value + increment >= 0) {
            el.value = value + increment;
            el.dispatchEvent(new Event('input'));
        }
    }

    padHoursInput(event) {
        this.hoursInput.value = parseInt(event.target.value).toString().padStart(2, "0");
        this.hoursInput.style.width = this.hoursInput.value.length + 1 + "ch";
        this.tryToEnableStartButton();
    }

    checkTimeInput(currentInput, inputToIncrease) {
        // get only the 2 last numbers
        let value = parseInt(currentInput.value.toString().slice(-2));
        if (value > 59) {
            inputToIncrease.value = parseInt(inputToIncrease.value) + Math.floor(value / 60);
            inputToIncrease.dispatchEvent(new Event("input"));
            value = value % 60;
        }
        currentInput.value = value.toString().padStart(2, "0");
        this.tryToEnableStartButton();
    }

    tryToEnableStartButton() {
        this.getButton('start').disabled = this.timeFromInputs <= 0;
    }

    start() {
        let hours = parseInt(this.hoursInput.value);
        let minutes = parseInt(this.minutesInput.value);
        let seconds = parseInt(this.secondsInput.value);
        let time = hours * 3600 + minutes * 60 + seconds;
        this.interval = setInterval(() => {
            time--;
            if (time <= 0) {
                this.stopWatchEnded();
                return;
            }
            this.hoursInput.value = Math.floor(time / 3600).toString().padStart(2, "0");
            this.minutesInput.value = Math.floor((time % 3600) / 60).toString().padStart(2, "0");
            this.secondsInput.value = (time % 60).toString().padStart(2, "0");
            this.progressBar.setAttribute('value', 30);
        }, 1000);
        this.getButton('start').classList.add('hidden');
        this.getButton('pause').classList.remove('hidden');
        this.getButton('cancel').classList.remove('hidden');
        this.hoursInput.disabled = true;
        this.minutesInput.disabled = true;
        this.secondsInput.disabled = true;
        this.querySelectorAll('.arrow-button').forEach(button => button.classList.add('hidden'));
    }

    stopWatchEnded() {
        // TODO add sound and vibration
        this.reset();
    }

    pause() {
        clearInterval(this.interval);
        this.getButton('pause').classList.add('hidden');
        this.getButton('restart').classList.remove('hidden');
    }

    restart() {
        this.start();
        this.getButton('restart').classList.add('hidden');
        this.getButton('pause').classList.remove('hidden');
    }

    reset() {
        clearInterval(this.interval);
        this.secondsInput.value = "00";
        this.minutesInput.value = "00";
        this.hoursInput.value = "00";
        this.hoursInput.style.width = "3ch";
        this.secondsInput.disabled = false;
        this.minutesInput.disabled = false;
        this.hoursInput.disabled = false;
        this.getButton('start').classList.remove('hidden');
        this.getButton('start').disabled = true;
        this.getButton('pause').classList.add('hidden');
        this.getButton('cancel').classList.add('hidden');
        this.getButton('restart').classList.add('hidden');
        this.querySelectorAll('.arrow-button').forEach(button => button.classList.remove('hidden'));
    }
}

customElements.define(stopwatchTagName, Stopwatch);