import {navbarTagName} from "./navbar-helpers";
import "./navbar.scss";
import {openModal} from "../modal/modal-helpers";
import {parametersTagName} from "../../../features/parameters/parameters-helper";

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

    get batteryInformations() {
        return this.querySelector("#batteryInformations");
    }

    async connectedCallback() {
        await fetch("shared/components/navbar/navbar.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelector("#parameters").addEventListener("click", () => {
            openModal(parametersTagName);
        });

        this.setTime();
        this.setDate();
        this.setBatteryLevel();
        this.setNetworkStatus();
    }

    setTime() {
        this.time.textContent = new Date().toLocaleString('fr-FR', {
            hour: 'numeric',
            minute: 'numeric'
        })
    }

    setDate() {
        let date = new Date().toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long'});
        date = date.charAt(0).toUpperCase() + date.slice(1);
        this.checkWidth(date);
        window.onresize = (event) => this.checkWidth(date);
    }

    checkWidth(date) {
        const width = window.innerWidth;
        if (width < 425) {
            let shortDate = date.split(' ').slice(0, -1).join(' ');
            shortDate += " " + new Date().toLocaleString('fr-FR', { month: 'short' });
            this.date.textContent = shortDate;
        }
        else {
            this.date.textContent = date;
        }
    }

    setBatteryLevel() {
        const navbarElement = this;
        navigator.getBattery()
            .then(function(battery) {
                navbarElement.updateBatteryLevel(battery);
                    battery.onlevelchange = function () {
                        navbarElement.updateBatteryLevel(battery);
                    };
            })
            .catch(function(err) {
                console.log(err);
            });
    }

    updateBatteryLevel(battery) {
        this.batteryPercent.textContent = Math.round(battery.level * 100) + "%";
        this.batteryLevel.style.height = `${battery.level * 18}px`;
    }

    setNetworkStatus() {
        const rtt = navigator.connection.rtt;
        this.latenceLevel.textContent = rtt + "ms";
        switch (true) {
            case (rtt < 100): {
                this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt</i>`;
                break;
            }
            case (rtt < 200): {
                this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt_2_bar</i>`;
                break;
            }
            case (rtt > 200): {
                this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt_1_bar</i>`;
                break;
            }
            default: {
                this.networkIcon.innerHTML = `no data`;
            }
        }
    }
}
customElements.define(navbarTagName, Navbar);
