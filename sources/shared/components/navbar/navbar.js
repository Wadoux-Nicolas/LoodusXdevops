import {navbarTagName} from "./navbar-helpers";
import "./navbar.scss";
import {openModal} from "../modal/modal-helpers";
import {parametersTagName} from "../../../features/parameters/parameters-helper";

class Navbar extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch("shared/components/navbar/navbar.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelectorAll("#parameters").forEach(e => e.addEventListener("click", () => {
            openModal(parametersTagName);
        }));

        let date = new Date().toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long'});
        date = date.charAt(0).toUpperCase() + date.slice(1);

        document.getElementById("time").textContent = new Date().toLocaleString('fr-FR', {
            hour: 'numeric',
            minute: 'numeric'
        })

        checkWidth();

        function checkWidth() {
            const width = window.innerWidth;
            if (width < 425) {
                let shortDate = date.split(' ').slice(0, -1).join(' ');
                shortDate += " " + new Date().toLocaleString('fr-FR', { month: 'short' });
                document.getElementById("date").textContent = shortDate;
            }
            else {
                document.getElementById("date").textContent = date;
            }
        }

        window.onresize = checkWidth;

        function updateBatteryStatus(battery) {
            document.querySelector('#battery').textContent = Math.round(battery.level * 100) + "%";
            document.querySelector('#batteryLevel').style.height = `${battery.level * 18}px`;
        }

        navigator.getBattery()
            .then(function(battery) {
                updateBatteryStatus(battery);

                battery.onlevelchange = function () {
                    updateBatteryStatus(battery);
                };
            })
            .catch(function(err) {
                console.log(err);
            });

        const rtt = navigator.connection.rtt;

        document.querySelector('#latenceLevel').textContent = rtt + "ms";

        switch (true) {
            case (rtt < 100): {
                document.querySelector('#networkIcon').innerHTML = `<i class="material-icons">signal_cellular_alt</i>`;
                break;
            }
            case (rtt < 200): {
                document.querySelector('#networkIcon').innerHTML = `<i class="material-icons">signal_cellular_alt_2_bar</i>`;
                break;
            }
            case (rtt > 200): {
                document.querySelector('#networkIcon').innerHTML = `<i class="material-icons">signal_cellular_alt_1_bar</i>`;
                break;
            }
            default: {
                document.querySelector('#networkIcon').innerHTML = `no data`;
            }
        }
    }
}
customElements.define(navbarTagName, Navbar);
