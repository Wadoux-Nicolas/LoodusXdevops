import "./pattern-lock.scss"
import {patternLockTagName} from "./pattern-lock-helpers";
import {getUrl} from "../../js/helper";

class PatternLock extends HTMLElement {
    circles = [];
    selectedPattern = [];
    context = null;

    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("shared/components/pattern-lock/pattern-lock.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        // trick to be able to remove the event listener without losing the context
        // cf https://stackoverflow.com/questions/10444077/javascript-removeeventlistener-not-working
        this.onCanvasMouseDown = this.onCanvasMouseDown.bind(this);
        this.submitPattern = this.submitPattern.bind(this);

        this.initPattern();
    }

    initPattern() {
        const canvas = document.getElementById('pattern-canvas');
        this.context = canvas.getContext('2d');
        const radius = 18;
        const margins = canvas.width / 3;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = col * margins + margins / 2;
                const y = row * margins + margins / 2;
                this.circles.push(new CircleInput(x, y, radius, this.context, this.circles.length+1));
            }
        }

        this.drawPattern();

        const actions = ['mouse', 'pointer'];
        for (const action of actions) {
            canvas.addEventListener(action + 'down', () => {
                canvas.addEventListener(action + 'move', this.onCanvasMouseDown, true);
                if (action === 'mouse') {
                    canvas.addEventListener('mouseout', this.submitPattern, true); // not working for pointer cf scss
                }
            });
            canvas.addEventListener(action + 'up', () => this.submitPattern());
        }
    }

    drawPattern() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        // draw lines (first to be sure they aren't on top)
        this.circles.forEach(circle => {
            const selectedCircleIndex = this.selectedPattern.indexOf(circle.value);
            if (selectedCircleIndex > 0) {
                const lastCircle = this.circles.find(circle => circle.value === this.selectedPattern[selectedCircleIndex - 1]);
                this.drawLineBetween([lastCircle.x, lastCircle.y], [circle.x, circle.y]);
            }
        });
        this.circles.forEach(circle => {
            circle.draw();
            if (this.selectedPattern.includes(circle.value)) {
                circle.markAsSelected();
            }
        });
    }

    drawLineBetween(from, to) {
        const X = 0;
        const Y = 1;
        this.context.beginPath();
        this.context.strokeStyle = '#fff';
        this.context.lineWidth = 5;
        this.context.moveTo(from[X], from[Y]);
        this.context.lineTo(to[X], to[Y]);
        this.context.stroke();
    }

    submitPattern() {
        this.context.canvas.removeEventListener('mousemove', this.onCanvasMouseDown, true);
        this.context.canvas.removeEventListener('mouseout', this.submitPattern, true);
        this.context.canvas.removeEventListener('pointermove', this.onCanvasMouseDown, true);


        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('pattern-lock-submitted', {
                detail: {
                    pattern: this.selectedPattern.join('')
                }
            }));
            this.selectedPattern = [];
            this.drawPattern();
        }, 150); // to quickly see the last circle selected
    }

    onCanvasMouseDown(event) {
        // draw line between last circle and current mouse position
        const selectedPatternLength = this.selectedPattern.length;
        if(selectedPatternLength) {
            const lastCircle = this.circles.find(circle => circle.value === this.selectedPattern[selectedPatternLength - 1]);
            this.drawPattern();
            this.drawLineBetween([lastCircle.x, lastCircle.y], [event.offsetX, event.offsetY]);
        }

        for (let circle of this.circles) {
            if(circle.checkIfClicked(event.offsetX, event.offsetY) && !this.selectedPattern.includes(circle.value)) {
                this.selectedPattern.push(circle.value);
                circle.markAsSelected();
                if(this.selectedPattern.length >= 9) {
                    this.submitPattern();
                }
            }
        }
    }
}

customElements.define(patternLockTagName, PatternLock);

class CircleInput {
    constructor(x, y, radius, context, value) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.context = context;
        this.value = value;
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = 'white';
        this.context.fill();
    }

    markAsSelected() {
        this.draw();
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 4;
        this.context.stroke();
    }

    checkIfClicked(x, y) {
        const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
        return distance < this.radius;
    }
}