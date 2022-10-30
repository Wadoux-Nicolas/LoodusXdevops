import "./clock.scss"
import {clockTagName} from "./clock-helpers";
import {local} from "../../shared/helper";

fetch("features/clock/clock.html")
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class Clock extends HTMLElement {
        constructor() {
            super();
        }

        get clockDate() {
            return this.querySelector("#clock-date");
        }

        get clockTime() {
            return this.querySelector("#clock-time");
        }

        connectedCallback() {
            this.innerHTML = html;
            this.displayDate();
            setInterval(() => this.displayDate(), 1000);
        }

        displayDate() {
            const date = new Date();

            let day = date.toLocaleDateString(local(), { weekday: 'long' });
            day = day.charAt(0).toUpperCase() + day.slice(1);
            const dayNumber = date.getDate();
            const month = date.toLocaleDateString(local(), { month: 'long' });
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");
            this.clockDate.innerHTML = `${day} <span class="text3">${dayNumber}</span> ${month}`;
            this.clockTime.innerHTML = `${hours}:${minutes}<span class="text4">:${seconds}</span>`;

        }

    }
    customElements.define(clockTagName, Clock);
}