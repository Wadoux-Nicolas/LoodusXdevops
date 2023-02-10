import {navbarTagName} from "./navbar-helpers";
import "./navbar.scss";
import {openModal} from "../modal/modal-helpers";
import {parametersTagName} from "../../../features/parameters/parameters-helper";
import {getUrl} from "../../js/helper";
import LoodusDb from "../../js/loodusDb";

class Navbar extends HTMLElement {

    loodusDb = new LoodusDb();
    optionsDateTime = {};
    optionsNetwork = {};
    networkLatency;

    constructor() {
        super();
    }

    get getDate() {
        return this.querySelector("#date");
    }

    get getTime() {
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

    get networkIndicator() {
        return this.querySelector('#network-indicator')
    }

    async connectedCallback() {
        await fetch(getUrl("shared/components/navbar/navbar.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        await this.loodusDb.openDb()
            .catch(error => console.error(error ?? "Erreur lors de la connexion à la base de données"));

        await this.initialize();

        this.updateTrigger();

        setInterval(() => {
            this.setTime();
            this.setDate();
        }, 1000);

        this.querySelector("#parameters").addEventListener("click", () => {
            openModal(parametersTagName);
        });

        this.initBatteryListeners();
    }

    setTime() {
        const { hour, minute, second } = this.optionsDateTime;

        if( hour || minute || second ) {

            const options = {
                hour: hour ? 'numeric' : undefined,
                minute: minute ? 'numeric' : undefined,
                second: second ? 'numeric' : undefined,
            }

            this.getTime.innerHTML = new Date().toLocaleString('fr-FR', options);
            this.getTime.classList.remove('hidden');
        }
        else {
            this.getTime.classList.add('hidden');
        }
    }

    setDate() {
        const { displayDate, day, weekday, month, year} = this.optionsDateTime;

        if(displayDate) {
            this.getDate.classList.remove('hidden');

            if( weekday || day || month || year ) {
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

                this.getDate.innerHTML = date;
            }
            else {
                this.getDate.classList.add('hidden');
            }
        }
        else {
            this.getDate.classList.add('hidden');
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
        const { displayLatencyNetwork, domain, delay } = this.optionsNetwork;
        clearInterval(this.networkLatency);

        if(displayLatencyNetwork) {
            this.networkIndicator.classList.remove('hidden');

            this.networkLatency = this.noDelayFirstSetInterval(() => {
                const url = "https://" +  domain;
                const startTime = Date.now();

                fetch(url)
                    .then(response => {
                        const latency = Date.now() - startTime;
                        this.latenceLevel.innerHTML = latency + "ms";
                        if (latency <= 100) {
                            this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt</i>`;
                        } else if (latency <= 200) {
                            this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt_2_bar</i>`;
                        } else {
                            this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_alt_1_bar</i>`;
                        }
                    })
                    .catch(error => console.log(error));
            }, delay * 1000);
        }
        else {
            this.networkIndicator.classList.add('hidden');
        }
    }

    noDelayFirstSetInterval(func, interval) {
        func();
        return setInterval(func, interval);
    }

    setAccessibility(vibrationParameters) {
        if (vibrationParameters.displayVibrationState === true){
            this.vibrateIcon.classList.remove('hidden');
        }
        else {
            this.vibrateIcon.classList.add('hidden');
        }
        if(vibrationParameters.activeVibration === false){
            this.crosswordIcon.classList.remove('hidden');
        }
        else {
            this.crosswordIcon.classList.add('hidden');
        }
        // À voir pcq pas bien compris le point sur la batterie
        /*if(accessibilityParams.displayBatteryState === true){
            this.crosswordIcon.classList.remove('hidden');
        }*/
    }

    async initialize() {
        const dbParams = await this.loodusDb.getAll('parameters');

        for (const param of dbParams) {
            this.updateElements(param.id, param.data);
        }

    }

    updateTrigger() {
        document.addEventListener("parameters-updated", async (e) => {
            const documentId = e.detail.documentId;

            const params = await this.loodusDb.get('parameters', documentId);

            this.updateElements(documentId, params.data);

        });
    }

    updateElements(documentId, params) {

        switch (documentId) {
            case 'network':
                this.setOptionsNetwork(params);
                this.setNetworkStatus();

                break;

            case 'date':
                this.setOptionsDateTime(params);
                this.setDate();
                this.setTime();
                break;

            case 'accessibility':
                this.setAccessibility(params);
                break;

            default:
                break;
        }
    }

    setOptionsDateTime(dateParams) {
        this.optionsDateTime = {
            weekday: dateParams.displayDay,
            day: dateParams.displayDay,
            month: dateParams.displayMonth,
            year: dateParams.displayYear,
            displayDate: dateParams.displayDate,
            hour: dateParams.displayHours,
            minute: dateParams.displayMinutes,
            second: dateParams.displaySecondes,
        };
    }

    setOptionsNetwork(networkParams) {
        const { displayLatencyNetwork, domain, delay } = networkParams;

        this.optionsNetwork = {
            displayLatencyNetwork,
            domain,
            delay,
        };
    }
}

customElements.define(navbarTagName, Navbar);
