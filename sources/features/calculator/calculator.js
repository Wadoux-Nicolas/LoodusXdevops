import "./calculator.scss"
import {calculatorTagName} from "./calculator-helpers";
import {_, getUrl, vibrate} from "../../shared/helper";
import LoodusDb, {defaultParameterValues} from "../../shared/LoodusDb";

class Calculator extends HTMLElement {
    operation = '';
    savedResults = [];

    constructor() {
        super();
    }

    get resultElement() {
        return this.querySelector("#result")
    }

    get historyContainerElement() {
        return this.querySelector("#calculator-history-container")
    }

    get historyElement() {
        return this.historyContainerElement.querySelector("#history")
    }

    get keypadElement() {
        return this.querySelector("#keypad")
    }

    async connectedCallback() {
        await fetch(getUrl("features/calculator/calculator.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelector('#history-toggle').addEventListener('click', () => {
            this.historyContainerElement.classList.toggle('hidden');
        });

        this.keypadElement.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => this.handleCalculatorAction(button.getAttribute("data-action"), button.innerHTML));
        });

        this.querySelector('#remove-history').addEventListener('click', () => {
            this.savedResults = [];
            // TODO REMOVE RESULTS IN DB
            this.historyElement.innerHTML = '';
        });

        // listen for key presses and if it's a number or operator, trigger the button click
        document.addEventListener('keydown', (event) => {
            const key = event.key;
            this.handleKeyBoardInputs(key);
        });

        // TODO get data from db
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
        // if we had an error but still try to do something, clear the error
        this.operation = this.operation.replace('Error', '');

        switch (action) {
            case 'all-clear':
                this.operation = ''; // empty to be replaced with the first pressed button
                break;
            case 'clear':
                this.operation = this.operation.slice(0, -1);
                break;
            case 'parenthesis-open':
                // autocomplete open ( with multiply
                if (this.operation !== '' && isFinite(this.operation.at(-1))) {
                    this.operation += '*';
                }
                this.operation += '(';
                break;
            case 'plus-minus':
                this.operation = this.getOperationWithSignOfLastNumberInverted();
                break;
            case 'point':
                // autocomplete point with 0
                if (this.operation === '') {
                    this.operation += '0';
                }
                this.operation += '.';
                break;
            case 'equals':
                this.compute();
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
        this.resultElement.innerHTML = this.operation !== '' ? this.operation : '0';
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
        // handle cleared 0 = 0, and replace Error to don't try to eval it
        this.operation = this.operation === '' ? '0' : this.operation;

        let result;
        try {
            result = eval(this.operation.replace('^', '**')).toString();
        } catch {
            result = 'Error';
        }

        const savedOperation = {
            result: result,
            operation: this.operation,
        };

        this.saveNewResult(savedOperation);
        this.operation = result;
        this.updateResult();
    }

    saveNewResult(operation) {
        this.savedResults.push(operation);
        const loodusDb = new LoodusDb();
        loodusDb.openDb().then(() => {
            return loodusDb.set('calculator', 'history', [operation]).then(r => {
                console.log('res')
                console.log(r)
            });
        }).catch(error => console.log(error ?? "Enregistrement de l'historique impossible en base de données"))
        this.updateHistory(operation);
    }
}

customElements.define(calculatorTagName, Calculator);