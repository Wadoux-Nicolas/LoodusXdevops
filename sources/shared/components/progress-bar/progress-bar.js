import "./progress-bar.scss"
import {progressBarTagName} from "./progress-bar-helpers";

class ProgressBar extends HTMLElement {
    static get observedAttributes() {
        return ["value", "max", "min"];
    }

    get value() {
        return this.getAttribute("value");
    }

    get isReversed() {
        // invert progress bar if value is decreasing, but you still want to show progress from left to right
        return Boolean(this.getAttribute("is-reversed"));
    }

    get min() {
        return this.getAttribute("min");
    }

    get max() {
        return this.getAttribute("max");
    }

    get progressBar() {
        return this.querySelector(".progress-bar");
    }

    get progress() {
        return this.progressBar.querySelector(".progress");
    }

    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch("shared/components/progress-bar/progress-bar.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);
        this.updateProgress();
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        // call updateProgress only when component was loaded
        if (this.innerHTML) {
            this.updateProgress();
        }
    }

    updateProgress() {
        let barWidth = (this.value - this.min) / (this.max - this.min) * 100;
        if (this.isReversed) {
            barWidth = 100 - barWidth;
        }
        this.progress.style.width = barWidth + "%";
        this.progressBar.setAttribute("aria-valuenow", this.value);
        this.progressBar.setAttribute("aria-valuemin", this.min);
        this.progressBar.setAttribute("aria-valuemax", this.max);
    }
}

customElements.define(progressBarTagName, ProgressBar);
