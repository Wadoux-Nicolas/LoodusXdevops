import {navbarTagName} from "./navbar-helpers";
import "./navbar.scss";
import {openModal} from "../modal/modal-helpers";
import {parametersTagName} from "../../../features/parameters/parameters-helper";
import {getUrl} from "../../js/helper";
import LoodusDb from "../../js/loodusDb";

class Navbar extends HTMLElement {

    loodusDb = new LoodusDb();

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

    get vibrateIcon() {
        return this.querySelector("#vibrate");
    }

    get crosswordIcon() {
        return this.querySelector("#crossword");
    }

    async connectedCallback() {
        await fetch(getUrl("shared/components/navbar/navbar.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        await this.loodusDb.openDb()
            .catch(error => console.error(error ?? "Erreur lors de la connexion à la base de données"));

        this.loodusDb.get('parameters', 'dateParameters')
            .then(result => {
                const dateParameters = result?.data ?? [];
                this.setDate(dateParameters);
                setInterval(() => {
                    this.setDate(dateParameters);
                }, 3600000);
            })
            .catch(error => console.error(error ?? "Erreur lors de la récupération des paramètres, ou ils sont vides"));

        this.loodusDb.get('parameters', 'hourParameters')
            .then(result => {
                const timeParameters = result?.data ?? [];
                this.setTime(timeParameters);
                setInterval(() => {
                    this.setTime(timeParameters);
                }, 1000);
            })
            .catch(error => console.error(error ?? "Erreur lors de la récupération des paramètres, ou ils sont vides"));


        this.loodusDb.get('parameters', 'vibrationParameters')
            .then(result => {
                const vibrationParameters = result?.data ?? [];
                this.updateVibrateIcon(vibrationParameters);
            })
            .catch(error => console.error(error ?? "Erreur lors de la récupération des paramètres, ou ils sont vides"));

        this.loodusDb.get('parameters', 'networkLatencyParameters')
            .then(result => {
                const networkLatencyParameters = result?.data ?? [];
                this.setNetworkStatus(networkLatencyParameters);
                setInterval(() => {
                    this.setNetworkStatus(networkLatencyParameters);
                }, 1000);
            })
            .catch(error => console.error(error ?? "Erreur lors de la récupération des paramètres, ou ils sont vides"));

        this.querySelector("#parameters").addEventListener("click", () => {
            openModal(parametersTagName);
        });

        this.initBatteryListeners();
    }

    setTime(timeParameters) {
        const hour = timeParameters.displayHour;
        const minute = timeParameters.displayMinute;
        const second = timeParameters.displaySecond;

        if(hour !== undefined && minute !== undefined && second !== undefined) {
            const options = {
                hour: hour ? 'numeric' : undefined,
                minute: minute ? 'numeric' : undefined,
                second: second ? 'numeric' : undefined,
            }
            this.time.textContent = new Date().toLocaleString('fr-FR', options);
        }
        else {
            this.time.classList.add('hidden');
        }

    }

    setDate(dateParameters) {
        if(dateParameters.display) {
            const weekday = dateParameters.displayDay;
            const day = dateParameters.displayDay;
            const month = dateParameters.displayMonth;
            const year = dateParameters.displayYear;

            if(weekday !== undefined && day !== undefined && month !== undefined && year !== undefined) {
                const options = {
                    weekday: weekday ? 'long' : undefined,
                    day: day ? 'numeric' : undefined,
                    month: month ? 'long' : undefined,
                    year: year ? 'numeric' : undefined,
                }

                let date = new Date().toLocaleString('fr-FR', options);
                if(weekday) {
                    date = date.charAt(0).toUpperCase() + date.slice(1);
                }
                this.date.textContent = date;
            }
            else {
                this.date.classList.add('hidden');
            }
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

    setNetworkStatus(networkLatencyParameters) {
        if(networkLatencyParameters.displayNetworkLatency) {
            let url = networkLatencyParameters.url
            url = "https://" + url;
            const startTime = Date.now();
            fetch(url)
                .then(response => {
                    const latency = Date.now() - startTime;
                    this.latenceLevel.textContent = latency + "ms";
                    if (latency <= 100) {
                        this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt</i>`;
                    } else if (latency <= 200) {
                        this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt_2_bar</i>`;
                    } else {
                        this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt_1_bar</i>`;
                    }
                })
                .catch(error => console.log(error));
        }
    }

    updateVibrateIcon(vibrationParameters) {
        if (vibrationParameters.displayVibrationStatus === true){
            this.vibrateIcon.classList.remove('hidden');
        }
        if(vibrationParameters.enableVibration === false){
            this.crosswordIcon.classList.remove('hidden');
        }
    }
}

customElements.define(navbarTagName, Navbar);