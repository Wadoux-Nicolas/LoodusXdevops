import "./home.scss"
import {openModal} from "../../shared/components/modal/modal-helpers";
import {parametersTagName} from "../parameters/parameters-helper";
import {homeTagName} from "./home-helpers";

// read the home.html file to get it as a string
fetch("features/home/home.html")
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class Home extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = html;
            this.querySelector("#parameters").addEventListener("click", () => {
                openModal(parametersTagName);
            });
        }
    }
    customElements.define(homeTagName, Home);
}

