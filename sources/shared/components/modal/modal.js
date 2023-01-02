import './modal.scss';
import {closeModal, modalTagName} from "./modal-helpers";
import {getUrl, vibrate} from "../../helper";


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
        // detect click outside modal
        this.querySelector("#modal").addEventListener("click", (e) => {
            if (e.target.id === "modal") {
                vibrate();
                closeModal();
            }
        });
    }
}

customElements.define(modalTagName, Modal);