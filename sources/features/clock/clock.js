import "./clock.scss"
import {clockTagName} from "./clock-helpers";
import {getUrl, local} from "../../shared/js/helper";

class Clock extends HTMLElement {
    dateInterval = null;

    constructor() {
        super();
    }

    get clockDate() {
        return this.querySelector("#clock-date");
    }

    get clockTime() {
        return this.querySelector("#clock-time");
    }

    get actions() {
        return this.querySelectorAll(".tab-button");
    }

    get clockFeatures() {
        return this.querySelectorAll(".clock-feature");
    }

    async connectedCallback() {
        await fetch(getUrl("features/clock/clock.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.displayDate();
        this.dateInterval = setInterval(() => this.displayDate(), 1000);
        this.actions.forEach(button => button.addEventListener("click", () => this.onActionClick(button)));
    }

    disconnectedCallback() {
        clearInterval(this.dateInterval);
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

    onActionClick(button) {
        this.actions.forEach(action => action.classList.remove("active"));
        button.classList.add("active");
        this.clockFeatures.forEach(feature => feature.classList.add("hidden"));
        document.querySelector(button.getAttribute("data-target")).classList.remove("hidden");
    }

}
customElements.define(clockTagName, Clock);