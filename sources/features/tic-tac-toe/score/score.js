import "./score.scss"
import {scoreTagName} from "./score-helpers";
import {_, getUrl} from "../../../shared/js/helper";
import LoodusDb from "../../../shared/js/loodusDb";

class Score extends HTMLElement {

    loodusDb = new LoodusDb();
    savedScores = [];

    constructor() {
        super();
    }

    get score1Element() {
        return this.querySelector("#score1");
    }

    get score2Element() {
        return this.querySelector("#score2");
    }

    async connectedCallback() {
        await fetch(getUrl("features/tic-tac-toe/score/score.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        await this.loodusDb.openDb()
            .catch(error => console.error(error ?? "Erreur lors de la connexion à la base de données"));

        this.loodusDb.get('tic-tac-toe', 'score')
            .then(result => {
                this.savedScores = result?.data ?? [];
                for (let savedScores of this.savedScores) {
                    this.updateScore(savedScores);
                }
            })
            .catch(error => console.error(error ?? "Erreur lors de la récupération des scores"));

    }

    updateScore(score) {
        const className = score.score === 1 ? 'winner' : '';
        const player = score.player === "Joueur 1" ? this.score1Element : this.score2Element;

        _('p', score.score, player, null, className);
    }

}

customElements.define(scoreTagName, Score);
