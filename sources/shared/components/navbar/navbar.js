import {navbarTagName} from "./navbar-helpers";
import "./navbar.scss";
import {openModal} from "../modal/modal-helpers";
import {parametersTagName} from "../../../features/parameters/parameters-helper";
import {getUrl} from "../../helper";

class Navbar extends HTMLElement {
    constructor() {
        super();
    }

    get date() {
        return this.querySelector("#date");
    }

    get time() {
        return this.querySelector("#time");
    }

    get batteryLevel() {
        return this.querySelector("#batteryLevel");
    }

    get batteryPercent() {
        return this.querySelector("#batteryPercent");
    }

    get latenceLevel() {
        return this.querySelector("#latenceLevel");
    }

    get networkIcon() {
        return this.querySelector("#networkIcon");
    }

    async connectedCallback() {
        await fetch(getUrl("shared/components/navbar/navbar.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelector("#parameters").addEventListener("click", () => {
            openModal(parametersTagName);
        });

        this.setDateAndTime();
        this.setNetworkStatus();
        setInterval(() => {
            this.setDateAndTime();
            this.setNetworkStatus();
        }, 1000);

        window.addEventListener('resize', () => this.setDateAndTime())

        this.initBatteryListeners();
    }

    setDateAndTime() {
        this.time.textContent = new Date().toLocaleString('fr-FR', {
            hour: 'numeric',
            minute: 'numeric'
        })

        let date = new Date().toLocaleString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'});
        date = date.charAt(0).toUpperCase() + date.slice(1);
        this.checkWidthForDate(date);
    }

    checkWidthForDate(date) {
        const width = window.innerWidth;
        if (width < 500) {
            let shortDate = date.split(' ').slice(0, -1).join(' ');
            shortDate += " " + new Date().toLocaleString('fr-FR', {month: 'short'});
            this.date.textContent = shortDate;
        } else {
            this.date.textContent = date;
        }
    }

    initBatteryListeners() {
        if (!navigator.getBattery) {
            console.error('Battery API is not handled by this browser');
            this.querySelectorAll('.batteryInformations').forEach(info => info.classList.add('hidden'));
            return;
        }

        navigator.getBattery()
            .then(battery => {
                this.updateBatteryCharging(battery.charging);
                this.updateBatteryLevel(battery.level);
                battery.addEventListener('chargingchange', () => this.updateBatteryCharging(battery.charging));
                battery.addEventListener('levelchange', () => this.updateBatteryLevel(battery.level));
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    updateBatteryLevel(level) {
        this.batteryPercent.textContent = Math.round(level * 100) + "%";
        this.batteryLevel.style.height = `${level * 18}px`;
    }

    updateBatteryCharging(isCharging) {
        if (isCharging) {
            this.batteryLevel.classList.add("charging");
        } else {
            this.batteryLevel.classList.remove("charging");
        }
    }

    setNetworkStatus() {
        if (navigator.connection && isFinite(navigator.connection.rtt)) {
            const rtt = navigator.connection.rtt;
            this.latenceLevel.textContent = rtt + "ms";

            if (rtt < 100) {
                this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt</i>`;
            } else if (rtt < 200) {
                this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt_2_bar</i>`;
            } else {
                this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt_1_bar</i>`;
            }
        }
    }
}

customElements.define(navbarTagName, Navbar);
