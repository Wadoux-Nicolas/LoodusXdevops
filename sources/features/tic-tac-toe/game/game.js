import "./game.scss"
import {gameTagName} from "./game-helpers";
import {openModal} from "../../../shared/components/modal/modal-helpers";
import {scoreTagName} from "../score/score-helpers";
import {getUrl, vibrate} from "../../../shared/js/helper";
import LoodusDb from "../../../shared/js/loodusDb";

class Game extends HTMLElement {

    loodusDb = new LoodusDb();

    winningCombination = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    playerOneSymbol = "x";
    playerTwoSymbol = "o";
    isPlayerTwoTurn = false;

    constructor() {
        super();
    }

    get squares() {
        return this.querySelectorAll('.square')
    }

    get board() {
        return this.querySelector("#board");
    }

    get playerOne() {
        return this.querySelector(".player1");
    }

    get playerTwo() {
        return this.querySelector(".player2");
    }

    get initButton() {
        return this.querySelector("#initGame");
    }

    get endGameButton() {
        return this.querySelector("#endGame");
    }

    get scoreButton() {
        return this.querySelector("#score");
    }

    async connectedCallback() {
        await fetch(getUrl("features/tic-tac-toe/game/game.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        await this.loodusDb.openDb()
            .catch(error => console.error(error ?? "Erreur lors de la connexion à la base de données"));

        this.onCellClick = this.onCellClick.bind(this);

        this.startGame();

        this.initButton.addEventListener("click", () => {
            vibrate();
            this.startGame();
        });

        this.scoreButton.addEventListener("click", () => {
            vibrate();
            openModal(scoreTagName);
        });
    }

    startGame() {
        this.isPlayerTwoTurn = false;
        this.endGameButton.classList.add("hidden");
        this.playerOne.classList.remove("opacity");
        this.playerTwo.classList.add("opacity");
        this.squares.forEach(cell => {
            cell.classList.remove(this.playerOneSymbol);
            cell.classList.remove(this.playerTwoSymbol);
            cell.removeEventListener("click",  this.onCellClick, true);
            cell.addEventListener("click", this.onCellClick, true);
        });
        this.setBoardHoverClass();
    }

    onCellClick(e) {
        const cell = e.target
        if(cell.classList.contains(this.playerOneSymbol) === false && cell.classList.contains(this.playerTwoSymbol) === false) {
            vibrate();
            const currentPlayerSymbol = this.isPlayerTwoTurn ? this.playerTwoSymbol : this.playerOneSymbol;
            this.placeSymbol(cell, currentPlayerSymbol);
            if (this.checkWin(currentPlayerSymbol)) {
                this.endGame(false);
            } else if (this.isCellSymbol()) {
                this.endGame(true);
            } else {
                this.swapTurns();
                this.setBoardHoverClass();
            }
        }
    }

    isCellSymbol() {
        return [...this.squares].every(cell => {
            return cell.classList.contains(this.playerOneSymbol) || cell.classList.contains(this.playerTwoSymbol)
        })
    }

    endGame(draw) {
        if (draw) {
            this.endGameButton.textContent = "Personne n'a gagné !";
            this.endGameButton.classList.remove("hidden");

        } else {
            this.endGameButton.textContent = this.isPlayerTwoTurn ? "Bravo Joueur 2 !" : "Bravo Joueur 1 !";
            this.endGameButton.classList.remove("hidden");

            const scorePlayer1 = {
                player: "Joueur 1",
                score: this.isPlayerTwoTurn ? 0 : 1,
            };

            const scorePlayer2 = {
                player: "Joueur 2",
                score: this.isPlayerTwoTurn ? 1 : 0,
            };

            this.saveNewResult(scorePlayer1);
            this.saveNewResult(scorePlayer2);
        }
        this.squares.forEach(cell => {
            cell.removeEventListener("click",  this.onCellClick, true);
            cell.classList.add("no-hover");
        });
        this.board.classList.remove(this.playerOneSymbol);
        this.board.classList.remove(this.playerTwoSymbol);
    }

    saveNewResult(score) {
        this.loodusDb.set('tic-tac-toe', 'score', [score])
            .catch(error => console.log(error ?? "Enregistrement du score impossible en base de données"))
    }

    placeSymbol(cell, currentPlayerSymbol) {
        cell.classList.add(currentPlayerSymbol);
    }

    swapTurns() {
        this.isPlayerTwoTurn = !this.isPlayerTwoTurn;
        this.playerOne.classList.toggle("opacity")
        this.playerTwo.classList.toggle("opacity")
    }

    setBoardHoverClass() {
        this.board.classList.remove(this.playerOneSymbol);
        this.board.classList.remove(this.playerTwoSymbol);
        if (this.isPlayerTwoTurn) {
            this.board.classList.add(this.playerTwoSymbol);
        } else {
            this.board.classList.add(this.playerOneSymbol);
        }
    }

    checkWin(currentPlayerSymbol) {
        return this.winningCombination.some(combination => {
            return combination.every(index => {
                return this.squares[index].classList.contains(currentPlayerSymbol);
            })
        })
    }
}

customElements.define(gameTagName, Game);
