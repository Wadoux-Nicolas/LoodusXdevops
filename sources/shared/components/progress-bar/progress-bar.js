import "./progress-bar.scss"
import {progressBarTagName} from "./progress-bar-helpers";

fetch("shared/components/progress-bar/progress-bar.html")
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class ProgressBar extends HTMLElement {
        static get observedAttributes() {
            return ["value"];
        }

        get value() {
            return this.getAttribute("value");
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

        connectedCallback() {
            this.innerHTML = html;
            this.updateProgress();
        }

        attributeChangedCallback(attrName, oldVal, newVal) {
            // call updateProgress when component was loaded
            if (this.innerHTML) {
                this.updateProgress();
            }
        }

        updateProgress() {
            let barWidth = this.value > 0 ? this.value : 2; // force display of progress bar at 0 state
            this.progress.style.width = barWidth + "%";
            this.progressBar.setAttribute("aria-valuenow", this.value);
            this.progressBar.setAttribute("aria-valuemin", this.min);
            this.progressBar.setAttribute("aria-valuemax", this.max);
        }
    }
    customElements.define(progressBarTagName, ProgressBar);
}