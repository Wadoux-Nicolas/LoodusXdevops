import "./score.scss"
import {scoreTagName} from "./score-helpers";
import {_, getUrl} from "../../../shared/js/helper";
import LoodusDb from "../../../shared/js/loodusDb";
import {openModal} from "../../../shared/components/modal/modal-helpers";
import {gameTagName} from "../game/game-helpers";

class Score extends HTMLElement {

    loodusDb = new LoodusDb();
    savedScores = [];

    constructor() {
        super();
    }

    get playGameButton() {
        return this.querySelector('#playGame');
    }

    get score1Element() {
        return this.querySelector("#score1");
    }

    get score2Element() {
        return this.querySelector("#score2");
    }

    get noScore() {
        return this.querySelector(".no-score");
    }

    get container() {
        return this.querySelector(".container");
    }

    get backToGameButton() {
        return this.querySelector('#backButton');
    }

    async connectedCallback() {
        await fetch(getUrl("features/tic-tac-toe/score/score.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        await this.loodusDb.openDb()
            .catch(error => console.error(error ?? "Erreur lors de la connexion à la base de données"));

        this.loodusDb.get('tic-tac-toe', 'score')
            .then(result => {
                result?.data?.length ? this.savedScores = result?.data : this.savedScores = [];
                if(this.savedScores.length) {
                    for (let savedScores of this.savedScores) {
                        this.updateScore(savedScores);
                    }
                }
                else {
                    this.noScore.classList.remove('hidden');
                    this.container.classList.add('hidden');
                }
            })
            .catch(error => console.error(error ?? "Erreur lors de la récupération des scores"));

        this.playGameButton.addEventListener("click", () => {
            openModal(gameTagName);
        });

        this.backToGameButton.addEventListener("click", () => {
            openModal(gameTagName);
        });
    }

    updateScore(score) {
        const className = score.score === 1 ? 'winner' : '';
        const player = score.player === "Joueur 1" ? this.score1Element : this.score2Element;

        _('p', score.score, player, null, className);
    }

}

customElements.define(scoreTagName, Score);
