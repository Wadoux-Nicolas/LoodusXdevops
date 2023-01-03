import "./score.scss"
import {getUrl} from "../../../shared/helper";
import {scoreTagName} from "./score-helpers";

class Score extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("features/tic-tac-toe/score/score.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

    }

}

customElements.define(scoreTagName, Score);
