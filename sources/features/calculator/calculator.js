import "./calculator.scss"
import {calculatorTagName} from "./calculator-helpers";
import {_, getUrl, vibrate} from "../../shared/js/helper";
import LoodusDb, {defaultParameterValues} from "../../shared/js/loodusDb";
import {CalculatorError} from "../../shared/js/errors";
import {errorAnimation} from "../../shared/js/animations";

class Calculator extends HTMLElement {
    operation = '0';
    savedResults = [];
    loodusDb = new LoodusDb();
    errorCalculatorAnimation = null;

    constructor() {
        super();
    }

    get resultElement() {
        return this.querySelector("#result");
    }

    get historyContainerElement() {
        return this.querySelector("#calculator-history-container");
    }

    get historyElement() {
        return this.historyContainerElement.querySelector("#history");
    }

    get keypadElement() {
        return this.querySelector("#keypad");
    }

    get errorCalculatorContainer() {
        return this.querySelector("#error-calculator-container");
    }

    async connectedCallback() {
        await fetch(getUrl("features/calculator/calculator.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        await this.loodusDb.openDb()
            .catch(error => console.error(error ?? "Erreur lors de la connexion à la base de données"));

        this.loodusDb.get('calculator', 'history')
            .then(result => {
                this.savedResults = result?.data ?? [];
                for (let savedResult of this.savedResults) {
                    this.updateHistory(savedResult);
                }
            })
            .catch(error => console.error(error ?? "Erreur lors de la récupération de l'historique, ou il est vide"));

        this.querySelector('#history-toggle').addEventListener('click', () => {
            this.historyContainerElement.classList.toggle('hidden');
            if (!this.historyContainerElement.classList.contains('hidden')) {
                this.historyElement.scrollTop = -this.historyElement.scrollHeight; // scroll to top, negative cause of flex reverse-column
            }
        });

        this.keypadElement.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => this.handleCalculatorAction(button.getAttribute("data-action"), button.innerHTML));
        });

        this.querySelector('#remove-history').addEventListener('click', () => {
            this.savedResults = [];
            this.loodusDb.set('calculator', 'history', this.savedResults, true);
            this.historyElement.innerHTML = '';
        });


        // listen for key presses and if it's a number or operator, trigger the button click
        this.handleKeyDownEvent = this.handleKeyDownEvent.bind(this);
        document.addEventListener('keydown', this.handleKeyDownEvent);

        // init error animation
        this.errorCalculatorAnimation = this.errorCalculatorContainer.animate(errorAnimation.keyframes, errorAnimation.options);
        this.errorCalculatorAnimation.pause();
    }

    handleKeyDownEvent(event) {
        this.handleKeyBoardInputs(event.key);
    }

    handleKeyBoardInputs(key) {
        if (isFinite(key)) {
            this.handleCalculatorAction('number', key);
        } else if (key === 'Enter' || key === '=') {
            this.handleCalculatorAction('equals');
        } else if (key === 'Backspace') {
            this.handleCalculatorAction('clear');
        } else {
            let keyConversion = {
                '(': 'parenthesis-open',
                ')': 'parenthesis-close',
                '±': 'plus-minus',
                '*': 'multiply',
                'Dead': 'power', // we can assume that Dead key in this calculator can be only power signs
                '/': 'divide',
                '÷': 'divide',
                '.': 'point',
                ',': 'point',
                '+': 'plus',
                '-': 'minus',
            };
            if (keyConversion.hasOwnProperty(key)) {
                this.handleCalculatorAction(keyConversion[key]);
            }
        }
    }

    handleCalculatorAction(action, number = 0) {
        vibrate();
        this.errorCalculatorContainer.classList.add('hidden');

        // if operation is 0, we remove it (to not have 0-1, but -1, 0*(..) but (..), etc)
        const actionWith0Permitted = ['point', 'equals', 'power', 'divide', 'multiply', 'plus-minus'];
        if (this.operation === '0' && !actionWith0Permitted.includes(action)) {
            this.operation = '';
        }

        switch (action) {
            case 'all-clear':
                this.operation = '0';
                break;
            case 'clear':
                this.operation = this.operation.slice(0, -1) || '0';
                break;
            case 'parenthesis-open':
                // autocomplete open ( with multiply, even for Infinity considered as a right value
                if (isFinite(this.operation.at(-1)) || this.operation.endsWith('Infinity')) {
                    this.operation += '*';
                }
                this.operation += '(';
                break;
            case 'plus-minus':
                this.operation = this.getOperationWithSignOfLastNumberInverted();
                break;
            case 'point':
                this.operation += '.';
                break;
            case 'equals':
                try {
                    this.compute();
                } catch (e) {
                    console.error("L'opération n'est pas valide");
                    this.showComputeError();
                }
                break;
            case 'power':
            case 'minus':
            case 'plus':
            case 'divide':
            case 'multiply':
            case 'parenthesis-close':
                let actionsToKeys = {
                    'power': '^',
                    'minus': '-',
                    'plus': '+',
                    'parenthesis-close': ')',
                    'divide': '/',
                    'multiply': '*',
                }
                this.operation += actionsToKeys[action];
                break;
            case 'number':
                this.operation += number;
                break;
            default:
                console.error("Action inconnue");
                this.operation = this.operation === '' ? '0' : this.operation;
                break;
        }

        this.updateResult();
    }

    getOperationWithSignOfLastNumberInverted() {
        let result = this.operation;

        for (let i = this.operation.length - 1; i >= 0; i--) {
            if (!isFinite(this.operation[i]) && this.operation[i] !== '.') {
                if (['-', '+'].includes(this.operation[i])) {
                    // If last number is signed (plus or minus), replace the sign
                    let operator = this.operation[i] === '-' ? '+' : '-';
                    if (i === 0) {
                        // we don't show a plus sign at the beginning of the operation
                        operator = '';
                    }

                    result = this.operation.slice(0, i) + operator + this.operation.slice(i + 1);
                } else {
                    // if no sign, simply add a minus
                    result = this.operation.slice(0, i + 1) + '-' + this.operation.slice(i + 1);
                }
                break;
            } else if (i === 0) {
                // if no sign, simply add a minus
                result = '-' + this.operation;
                break;
            }
        }

        return result;
    }

    updateResult() {
        this.resultElement.innerHTML = this.operation;
        this.resizeResultFont();
    }

    resizeResultFont() {
        let fontSize = 28; // we set font size to 28 (reset after a first long operation)
        this.resultElement.style.fontSize = fontSize + 'px';
        // we reduce font size to fit calculator when results bar is greater than calculator size + 30px
        while (this.resultElement.clientWidth > this.keypadElement.clientWidth + 30 && fontSize > 12) {
            fontSize--;
            this.resultElement.style.fontSize = fontSize + 'px';
        }
    }

    updateHistory(operation) {
        const operationRow = _('p', '', this.historyElement, null, 'operation-row');
        _('span', operation.operation, operationRow, null, 'operation');
        _('span', ` = ${operation.result}`, operationRow, null, 'operation-result');

        operationRow.addEventListener('click', () => this.handleHistoryRowClick(operationRow));

        this.historyElement.scrollTop = -this.historyElement.scrollHeight; // scroll to top, negative cause of flex reverse-column
    }

    handleHistoryRowClick(operationRow) {
        vibrate();
        this.operation = operationRow.querySelector('.operation').innerText;
        this.updateResult();
    }

    compute() {
        let result;
        try {
            // Infinity won't throw an error, but that good, Infinty * -1 is a right operation
            // round to 2 decimals (+ used to convert 5.50 to 5.5 for example)
            result = +eval(this.operation.replace('^', '**')).toFixed(2);
            result = result.toString();
        } catch (e) {
            throw new CalculatorError('Operation not permitted');
        }

        const savedOperation = {
            result: result,
            operation: this.operation,
        };

        this.saveNewResult(savedOperation);
        this.operation = result;
    }

    saveNewResult(operation) {
        this.savedResults.push(operation);
        this.loodusDb.set('calculator', 'history', [operation])
            .catch(error => console.log(error ?? "Enregistrement de l'historique impossible en base de données"))
        this.updateHistory(operation);
    }

    showComputeError() {
        this.errorCalculatorContainer.classList.remove('hidden');
        this.errorCalculatorAnimation.play();
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this.handleKeyDownEvent);
    }
}

customElements.define(calculatorTagName, Calculator);