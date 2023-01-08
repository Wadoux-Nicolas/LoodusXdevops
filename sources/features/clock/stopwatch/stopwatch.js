import "./stopwatch.scss"
import {stopwatchTagName} from "./stopwatch-helpers";
import {_, getUrl, sendNotification, vibrate} from "../../../shared/js/helper";
import stopwatchSound from "../../../shared/assets/sounds/stopwatch.mp3";

class Stopwatch extends HTMLElement {
    interval = null;
    vibrateInterval = null;
    stopwatchAudio = null;
    ringAnimation = null;

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
        await fetch(getUrl("features/clock/stopwatch/stopwatch.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.hoursInput.addEventListener("input", (event) => this.padHoursInput(event));
        this.minutesInput.addEventListener("input", () => this.checkTimeInput(this.minutesInput, this.hoursInput));
        this.secondsInput.addEventListener("input", () => this.checkTimeInput(this.secondsInput, this.minutesInput));
        this.getButton('start').addEventListener("click", () => this.start());
        this.getButton('pause').addEventListener("click", () => this.pause());
        this.getButton('restart').addEventListener("click", () => this.restart());
        this.getButton('cancel').addEventListener("click", () => this.reset());
        this.getButton('stop-ring').addEventListener("click", () => this.stopRing());
        this.querySelectorAll('.arrow-button').forEach(button => {
            button.addEventListener("mousedown", () => this.arrowButtonClicked(button))
        });
        this.stopwatchAudio = new Audio(stopwatchSound);
        this.stopwatchAudio.loop = true;

        this.ringAnimation = this.getButton('stop-ring').querySelector('i').animate([
            {transform: 'rotate(0deg)'},
            {transform: 'rotate(-10deg)'},
            {transform: 'rotate(10deg)'},
            {transform: 'rotate(0deg)'},
        ], {
            duration: 1000,
            iterations: Infinity,
        });
        this.ringAnimation.pause();
    }

    disconnectedCallback() {
        this.stopRing();
        clearInterval(this.interval);
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
        const time = this.launchCounter();
        this.stopRing();
        this.progressBar.setAttribute('value', time);
        this.progressBar.setAttribute('max', time);
        this.progressBar.classList.remove('hidden');
        this.getButton('start').classList.add('hidden');
        this.getButton('pause').classList.remove('hidden');
        this.getButton('cancel').classList.remove('hidden');
        this.hoursInput.disabled = true;
        this.minutesInput.disabled = true;
        this.secondsInput.disabled = true;
        this.querySelectorAll('.arrow-button').forEach(button => button.classList.add('hidden'));
    }

    launchCounter() {
        let hours = parseInt(this.hoursInput.value);
        let minutes = parseInt(this.minutesInput.value);
        let seconds = parseInt(this.secondsInput.value);
        let time = hours * 3600 + minutes * 60 + seconds;
        this.interval = setInterval(() => {
            time--;
            this.progressBar.setAttribute('value', time);
            if (time <= 0) {
                this.stopWatchEnded();
                return;
            }
            this.hoursInput.value = Math.floor(time / 3600).toString().padStart(2, "0");
            this.minutesInput.value = Math.floor((time % 3600) / 60).toString().padStart(2, "0");
            this.secondsInput.value = (time % 60).toString().padStart(2, "0");
        }, 1000);
        return time;
    }

    stopWatchEnded() {
        this.getButton('stop-ring').classList.remove('hidden');

        const pattern = [1000, 500];
        const patternTime = pattern.reduce((a, b) => a + b);
        vibrate(pattern);
        this.vibrateInterval = setInterval(() => vibrate(pattern), patternTime);

        this.stopwatchAudio.play();
        this.ringAnimation.play();
        sendNotification("Fin du chronomètre", { body: "Le chronomètre est fini !" });

        this.reset();
    }

    pause() {
        clearInterval(this.interval);
        this.getButton('pause').classList.add('hidden');
        this.getButton('restart').classList.remove('hidden');
    }

    restart() {
        this.launchCounter();
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
        this.progressBar.classList.add('hidden');
        this.querySelectorAll('.arrow-button').forEach(button => button.classList.remove('hidden'));
    }

    stopRing() {
        this.getButton('stop-ring').classList.add('hidden');
        clearInterval(this.vibrateInterval);
        this.stopwatchAudio.pause();
        this.ringAnimation.pause();

        this.stopwatchAudio.currentTime = 0;
    }
}

customElements.define(stopwatchTagName, Stopwatch);