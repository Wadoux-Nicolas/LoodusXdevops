import "./game.scss"
import {getUrl} from "../../../shared/helper";
import {gameTagName} from "./game-helpers";
import {openModal} from "../../../shared/components/modal/modal-helpers";
import {scoreTagName} from "../score/score-helpers";

class Game extends HTMLElement {

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

    get cells() {
        return this.querySelectorAll('[data-cell]')
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

        this.startGame();

        this.onCellClick = this.onCellClick.bind(this);

        this.initButton.addEventListener("click", () => {
            this.startGame();
        });

        this.scoreButton.addEventListener("click", () => {
           openModal(scoreTagName);
        });
    }

    startGame() {
        this.isPlayerTwoTurn = false;
        this.endGameButton.classList.add("hidden");
        this.playerOne.classList.remove("opacity");
        this.playerTwo.classList.remove("opacity");
        this.playerTwo.classList.add("opacity");
        this.cells.forEach(cell => {
            cell.classList.remove(this.playerOneSymbol);
            cell.classList.remove(this.playerTwoSymbol);
            cell.removeEventListener("click",  this.onCellClick, true);
            cell.addEventListener("click", this.onCellClick, true);
        });
        this.setBoardHoverClass();
    }

    onCellClick(e) {
        const cell = e.target
        const currentPlayerSymbol = this.isPlayerTwoTurn ? this.playerTwoSymbol : this.playerOneSymbol;
        this.placeSymbol(cell, currentPlayerSymbol);
        if (this.checkWin(currentPlayerSymbol)) {
            this.endGame(false);
        } else if (this.cellSymbol()) {
            this.endGame(true);
        } else {
            this.swapTurns();
            this.setBoardHoverClass();
        }
    }

    cellSymbol() {
        return [...this.cells].every(cell => {
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
        }
        this.cells.forEach(cell => {
            cell.removeEventListener("click",  this.onCellClick, true);
            cell.classList.add("no-hover");
        });
        this.board.classList.remove(this.playerOneSymbol);
        this.board.classList.remove(this.playerTwoSymbol);
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
                return this.cells[index].classList.contains(currentPlayerSymbol);
            })
        })
    }
}

customElements.define(gameTagName, Game);
