import './modal.scss';
import {closeModal, modalTagName} from "./modal-helpers";


class Modal extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch("shared/components/modal/modal.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelector("#modal-close").addEventListener("click", () => {
            closeModal();
        });
        // detect click outside modal
        this.querySelector("#modal").addEventListener("click", (e) => {
            if (e.target.id === "modal") {
                closeModal();
            }
        });
    }
}

customElements.define(modalTagName, Modal);