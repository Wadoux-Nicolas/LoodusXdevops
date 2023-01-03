import "./lock-screen.scss"
import {lockScreenTagName} from "./lock-screen-helpers";
import {getUrl, updateAvatar} from "../../shared/helper";

class LockScreen extends HTMLElement {
    errorMessageAnimation = null;

    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("features/lock-screen/lock-screen.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        updateAvatar();

        // TODO get prefered unlock method from settings to display the correct section
        const unlockMethod = "pattern";
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

        document.addEventListener('pattern-lock-submitted', event => {
            this.submit('pattern', event.detail.pattern);
        });

        this.errorMessageAnimation = this.querySelector('#error-code-message').animate([
            {transform: 'translateX(0)', easing: 'ease-in'},
            {transform: 'translateX(-5px)', easing: 'ease-out'},
            {transform: 'translateX(5px)', easing: 'ease-in'},
            {transform: 'translateX(0)', easing: 'ease-out'},
        ], {
            duration: 500,
            iterations: 1
        });
        this.errorMessageAnimation.pause();
    }

    submit(type, value) {
        let expectedValue = null;
        switch (type) {
            case 'password':
                expectedValue = '0000'; // TODO Get password from db
                break;
            case 'pattern':
                expectedValue = '123456789'; // TODO Get pattern from db
                break;
            default:
                console.error('Unknown unlock method');
        }

        if (value === expectedValue) {
            this.success();
        } else {
            this.error();
        }
    }

    success() {
        document.body.classList.remove('is-locked');
        this.querySelector('#unlock-password-input').value = '';
        this.querySelector('#error-code-message').classList.add('hidden');
    }

    error() {
        this.querySelector('#error-code-message').classList.remove('hidden');
        this.errorMessageAnimation.play();
    }
}



customElements.define(lockScreenTagName, LockScreen);
