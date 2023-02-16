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
    accessibilityParams = {};
    networkLatency;
    battery = null;
    static MAXIMUM_TRIES = 3

    constructor() {
        super();
    }

    get getDate() {
        return this.querySelector("#date");
    }

    get getTime() {
        return this.querySelector("#time");
    }

    get batteryInformation() {
        return this.querySelector("#batteryInformation");
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

        this.setIntervalWithoutDelay(() => {
            this.setTime();
            this.setDate();
        }, 1000);

        this.querySelector("#parameters").addEventListener("click", () => {
            openModal(parametersTagName);
        });

        await this.initBatteryListeners();
    }

    setTime() {
        const {displayTime, hour, minute, second} = this.optionsDateTime;

        if (displayTime && (hour || minute || second)) {

            const options = {
                hour: hour ? 'numeric' : undefined,
                minute: minute ? 'numeric' : undefined,
                second: second ? 'numeric' : undefined,
            }

            this.getTime.innerHTML = new Date().toLocaleString('fr-FR', options);
            this.getTime.classList.remove('hidden');
        } else {
            this.getTime.classList.add('hidden');
        }
    }

    setDate() {
        const {displayDate, day, weekday, month, year} = this.optionsDateTime;

        if (displayDate) {
            this.getDate.classList.remove('hidden');

            if (weekday || day || month || year) {
                const options = {
                    weekday: weekday ? 'long' : undefined,
                    day: day ? 'numeric' : undefined,
                    month: month ? 'long' : undefined,
                    year: year ? 'numeric' : undefined,
                }

                let date = new Date().toLocaleString('fr-FR', options);

                if (weekday) {
                    date = date.charAt(0).toUpperCase() + date.slice(1);
                }

                this.getDate.innerHTML = date;
            } else {
                this.getDate.classList.add('hidden');
            }
        } else {
            this.getDate.classList.add('hidden');
        }
    }

    initBatteryListeners() {
        if (!navigator.getBattery) {
            console.error('Battery API is not handled by this browser');
            this.batteryInformation.classList.add('hidden');
            return;
        }

        if (!this.battery) {
            try {
                this.battery = navigator.getBattery().then(battery => {
                    this.battery = battery;
                    this.setBatteryStatus();
                })
            } catch (e) {
                console.error(e);
            }
        } else {
            this.setBatteryStatus();
        }
    }

    setBatteryStatus() {
        if (this.accessibilityParams.displayBatteryState) {
            this.batteryInformation.classList.remove('hidden');
            this.updateBatteryCharging(this.battery.charging);
            this.battery.onchargingchange = () => this.updateBatteryCharging(this.battery.charging);
            this.updateBatteryLevel(this.battery.level);
            this.battery.onlevelchange = () => this.updateBatteryLevel(this.battery.level);
        } else {
            this.batteryInformation.classList.add('hidden');
            this.battery.onchargingchange = null;
            this.battery.onlevelchange = null;
        }
    }

    updateBatteryLevel(level) {
        this.batteryPercent.textContent = Math.round(level * 100) + "%";
        this.batteryLevel.style.height = `${level * 18}px`;
    }

    updateBatteryCharging(isCharging) {
        if (isCharging) {
            this.batteryInformation.classList.add("charging");
        } else {
            this.batteryInformation.classList.remove("charging");
        }
    }

    setNetworkStatus() {
        const {displayLatencyNetwork, domain, delay} = this.optionsNetwork;
        clearInterval(this.networkLatency);

        if (displayLatencyNetwork) {
            this.networkIndicator.classList.remove('hidden');

            let errors = 0;
            this.networkLatency = this.setIntervalWithoutDelay(() => {
                let url = domain;
                if (!url.startsWith("http")) {
                    url = "https://" + url;
                }
                const startTime = Date.now();

                fetch(url)
                    .then(() => {
                        errors = 0;
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
                    .catch(error => {
                        console.warn(error)
                        errors++;
                        this.networkIcon.innerHTML = `<i class="material-icons">signal_cellular_off</i>`;
                        this.latenceLevel.innerHTML = "";

                        // if we have too many errors, we stop the interval
                        if (errors >= Navbar.MAXIMUM_TRIES) {
                            console.error("Too many errors : Le domaine " + domain + " n'est pas joignable")
                            clearInterval(this.networkLatency);
                        }
                    });
            }, delay * 1000);
        } else {
            this.networkIndicator.classList.add('hidden');
        }
    }

    setIntervalWithoutDelay(func, interval) {
        func();
        return setInterval(func, interval);
    }

    setAccessibility(accessibilityParams) {
        this.accessibilityParams = accessibilityParams;
        if (accessibilityParams.displayVibrationState === true) {
            this.vibrateIcon.classList.remove('hidden');
        } else {
            this.vibrateIcon.classList.add('hidden');
        }
        if (accessibilityParams.activeVibration === false) {
            this.crosswordIcon.classList.remove('hidden');
        } else {
            this.crosswordIcon.classList.add('hidden');
        }
        this.initBatteryListeners();
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
            displayTime: dateParams.displayTime,
            hour: dateParams.displayHours,
            minute: dateParams.displayMinutes,
            second: dateParams.displaySecondes,
        };
    }

    setOptionsNetwork(networkParams) {
        const {displayLatencyNetwork, domain, delay} = networkParams;

        this.optionsNetwork = {
            displayLatencyNetwork,
            domain,
            delay,
        };
    }
}

customElements.define(navbarTagName, Navbar);
