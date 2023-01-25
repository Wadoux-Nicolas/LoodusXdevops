import "./lock-screen.scss"
import {lockScreenTagName} from "./lock-screen-helpers";
import {getUrl, updateAvatar} from "../../shared/js/helper";
import {errorAnimation} from "../../shared/js/animations";
import LoodusDb from "../../shared/js/loodusDb";

class LockScreen extends HTMLElement {
    errorMessageAnimation = null;
    loodusDb = new LoodusDb();
    lockParameters = null;

    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("features/lock-screen/lock-screen.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        updateAvatar();

        await this.loodusDb.openDb()
            .then(() => {
                return this.loodusDb.get('parameters', 'lock')
            })
            .then(result => this.lockParameters = result?.data)
            .catch(error => {
                console.error(error ?? "Erreur lors de la connexion à la base de données");
                this.querySelector('#error-lock-db-message').classList.remove('hidden');
                this.querySelector('#error-lock-db-message').animate(errorAnimation.keyframes, errorAnimation.options);
            });

        if (!this.lockParameters) {
            return;
        }

        const unlockMethod = this.lockParameters.unlockMethod;

        try {
            this.querySelector(`#unlock-by-${unlockMethod}`).classList.remove("hidden");
        } catch (e) {
            console.error('Something went wrong while trying to display the unlock method section, showing the password section instead');
            this.querySelector(`#unlock-by-password`).classList.remove("hidden");
        }

        this.addEventListener('submit', event => {
            event.preventDefault();
            this.submit('password', this.querySelector('#unlock-password-input').value);
        });

        this.querySelector('#free-unlock-button').addEventListener('click', event => {
            this.success();
        });

        document.addEventListener('pattern-lock-submitted', event => {
            this.submit('pattern', event.detail.pattern);
        });

        this.errorMessageAnimation = this.querySelector('#error-code-message').animate(errorAnimation.keyframes, errorAnimation.options);
        this.errorMessageAnimation.pause();
    }

    submit(type, value) {
        if (value === this.lockParameters.value || type === 'free') {
            this.success();
        } else {
            this.error();
        }

        this.querySelector('#unlock-password-input').value = '';
    }

    success() {
        document.dispatchEvent(new CustomEvent('unlock-screen'));
        this.querySelector('#error-code-message').classList.add('hidden');
    }

    error() {
        this.querySelector('#error-code-message').classList.remove('hidden');
        this.errorMessageAnimation.play();
    }
}



customElements.define(lockScreenTagName, LockScreen);
