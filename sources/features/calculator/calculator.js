import "./calculator.scss"
import {calculatorTagName} from "./calculator-helpers";
import {_, vibrate} from "../../shared/helper";

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
        await fetch("features/calculator/calculator.html")
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        this.querySelector('#history-toggle').addEventListener('click', () => {
            this.historyContainerElement.classList.toggle('hidden');
        });

        this.keypadElement.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => this.handleCalculatorButtons(button));
        });

        this.querySelector('#remove-history').addEventListener('click', () => {
            this.savedResults = [];
            this.historyElement.innerHTML = '';
        });
    }

    handleCalculatorButtons(button) {
        vibrate();
        // if we had an error but still try to do something, clear the error
        this.operation = this.operation.replace('Error', '');

        const action = button.getAttribute("data-action");
        switch (action) {
            case "all-clear":
                this.operation = ''; // empty to be replaced with the first pressed button
                break;
            case "clear":
                this.operation = this.operation.slice(0, -1);
                break;
            case "parenthesis-open":
                // autocomplete open ( with multiply
                if (this.operation !== '' && isFinite(this.operation.at(-1))) {
                    this.operation += '*';
                }
                this.operation += button.innerHTML;
                break;
            case "plusminus":
                this.operation = this.getOperationWithSignOfLastNumberInverted();
                break;
            case "divide":
                this.operation += '/';
                break;
            case "multiply":
                this.operation += '*';
                break;
            case "point":
                // autocomplete point with 0
                if (this.operation === '') {
                    this.operation += '0';
                }
                this.operation += button.innerHTML;
                break;
            case "equals":
                this.compute();
                break;
            case "power":
            case "minus":
            case "plus":
            case "parenthesis-close":
            case "number":
                this.operation += button.innerHTML;
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
        this.savedResults.push(savedOperation);
        this.updateHistory(savedOperation);

        this.operation = result;
        this.updateResult();
    }
}

customElements.define(calculatorTagName, Calculator);