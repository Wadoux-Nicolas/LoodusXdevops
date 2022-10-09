import './modal.scss';
import {closeModal, modalTagName} from "./modal-helpers";

fetch('shared/components/modal/modal.html')
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class Modal extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = html;
            this.querySelector("#close").addEventListener("click", () => {
                closeModal();
            });
        }
    }
    customElements.define(modalTagName, Modal);
}