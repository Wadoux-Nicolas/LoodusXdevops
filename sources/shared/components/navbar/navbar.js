import {navbarTagName} from "./navbar-helpers";
import "./navbar.scss";

fetch('shared/components/navbar/navbar.html')
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class Navbar extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.innerHTML = html;

        }
    }
    customElements.define(navbarTagName, Navbar);
}