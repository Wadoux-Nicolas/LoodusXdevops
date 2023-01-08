import "./tic-tac-toe.scss"
import {ticTacToeTagName} from "./tic-tac-toe-helpers";
import {getUrl} from "../../shared/js/helper";

class TicTacToe extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("features/tic-tac-toe/tic-tac-toe.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        // Write your code here, it will be executed when the component is loaded
    }
}

customElements.define(ticTacToeTagName, TicTacToe);
