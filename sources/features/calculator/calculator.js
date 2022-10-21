import "./calculator.scss"
import {calculatorTagName} from "./calculator-helpers";

fetch("features/calculator/calculator.html")
    .then(response => response.text())
    .then(html => define(html));

function define(html) {
    class Calculator extends HTMLElement {
        operation = '';
        savedResults = [];

        constructor() {
            super();
        }
        get resultElement() {
            return this.querySelector("#result")
        }

        connectedCallback() {
            this.innerHTML = html;
            this.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', event => {
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
                            if(this.operation !== '' && isFinite(this.operation.at(-1))){
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
                    this.updateView();
                })
            })
        }

        getOperationWithSignOfLastNumberInverted() {
            let result = this.operation;

            for (let i = this.operation.length - 1; i >= 0; i--) {
                if (!isFinite(this.operation[i]) && this.operation[i] !== '.') {
                    if(['-', '+'].includes(this.operation[i])) {
                        // If last number is signed (plus or minus), replace the sign
                        let operator = this.operation[i] === '-' ? '+': '-';
                        if(i === 0) {
                            // we don't show a plus sign at the beginning of the operation
                            operator = '';
                        }

                        result = this.operation.slice(0, i) + operator + this.operation.slice(i + 1);
                    } else {
                        // if no sign, simply add a minus
                        result = this.operation.slice(0, i + 1) + '-' + this.operation.slice(i + 1);
                    }
                    break;
                } else if(i === 0) {
                    // if no sign, simply add a minus
                    result = '-' + this.operation;
                    break;
                }
            }

            return result;
        }

        updateView() {
            this.resultElement.innerHTML = this.operation !== '' ? this.operation : '0';
        }

        compute() {
            let result;
            try {
                result = eval(this.operation.replace('^', '**'));
            } catch {
                result = 'Error';
            }
            this.savedResults.push(this.operation + ' = ' + result);
            this.operation = result.toString();
            this.updateView();
        }
    }

    customElements.define(calculatorTagName, Calculator);
}