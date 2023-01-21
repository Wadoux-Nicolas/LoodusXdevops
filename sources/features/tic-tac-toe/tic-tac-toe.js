import "./tic-tac-toe.scss"
import {ticTacToeTagName} from "./tic-tac-toe-helpers";
import {getUrl} from "../../shared/js/helper";
import {openModal} from "../../shared/components/modal/modal-helpers";
import {gameTagName} from "./game/game-helpers";
import {scoreTagName} from "./score/score-helpers";

class TicTacToe extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("features/tic-tac-toe/tic-tac-toe.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelector('#playGame').addEventListener("click", () => {
            openModal(gameTagName);
        });

        this.querySelector('#score').addEventListener("click", () => {
            openModal(scoreTagName);
        });
    }

}

customElements.define(ticTacToeTagName, TicTacToe);
