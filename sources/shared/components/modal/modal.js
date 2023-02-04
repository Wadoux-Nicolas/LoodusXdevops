import './modal.scss';
import {closeModal, modalTagName} from "./modal-helpers";
import {getUrl, vibrate} from "../../js/helper";


class Modal extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("shared/components/modal/modal.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelector("#modal-close").addEventListener("click", () => {
            vibrate();
            closeModal();
        });

        // detect down click only outside modal (up click could be a fail by user)
        this.querySelector("#modal").addEventListener("pointerdown", (e) => {
            if (e.target.id === "modal") {
                vibrate();
                closeModal();
            }
        });
    }
}

customElements.define(modalTagName, Modal);