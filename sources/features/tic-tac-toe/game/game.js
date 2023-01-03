import "./game.scss"
import {getUrl} from "../../../shared/helper";
import {gameTagName} from "./game-helpers";

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
    isPlayerOneTurn = true;

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

    async connectedCallback() {
        await fetch(getUrl("features/tic-tac-toe/game/game.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.startGame();
    }

    startGame() {
        this.isPlayerOneTurn = true;
        this.isPlayerOneTurn ? this.playerTwo.classList.toggle("opacity") : this.playerOne.classList.toggle("opacity");
        this.cells.forEach(cell => {
            cell.classList.remove(this.playerOneSymbol);
            cell.classList.remove(this.playerTwoSymbol);
            cell.removeEventListener("click", event => this.onCellClick(event));
            cell.addEventListener("click", event => this.onCellClick(event), {once: true});
        });
        this.setBoardHoverClass();
    }

    onCellClick(e) {
        const cell = e.target
        const currentPlayerSymbol = this.isPlayerOneTurn ? this.playerOneSymbol : this.playerTwoSymbol;
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
            //personne a gagné
        } else {
            // ${this.playerOneTurn ? this.playerOne : this.playerTwo} Wins!`
        }
    }

    placeSymbol(cell, currentPlayerSymbol) {
        cell.classList.add(currentPlayerSymbol);
    }

    swapTurns() {
        this.isPlayerOneTurn = !this.isPlayerOneTurn;
        this.playerOne.classList.toggle("opacity")
        this.playerTwo.classList.toggle("opacity")
    }

    setBoardHoverClass() {
        this.board.classList.remove(this.playerOneSymbol);
        this.board.classList.remove(this.playerTwoSymbol);
        if (this.isPlayerOneTurn) {
            this.board.classList.add(this.playerOneSymbol);
        } else {
            this.board.classList.add(this.playerTwoSymbol);
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
