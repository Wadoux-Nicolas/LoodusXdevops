import "./lock-screen.scss"
import {lockScreenTagName} from "./lock-screen-helpers";
import {getUrl, updateAvatar} from "../../shared/helper";

class LockScreen extends HTMLElement {
    errorMessageAnimation = null;
    circles = [];
    selectedPattern = [];
    context = null;

    constructor() {
        super();
    }

    async connectedCallback() {
        await fetch(getUrl("features/lock-screen/lock-screen.html"))
            .then(response => response.text())
            .then(html => this.innerHTML = html);

        updateAvatar();

        // TODO get prefered unlock method from settings to display the correct section
        const unlockMethod = "pattern";
        try {
            this.querySelector(`#unlock-by-${unlockMethod}`).classList.remove("hidden");
        } catch (e) {
            console.error('Something went wrong while trying to display the unlock method section, showing the password section instead');
            this.querySelector(`#unlock-by-password`).classList.remove("hidden");
        }

        if(unlockMethod === 'pattern') {
            this.initPattern();
        }


        this.addEventListener('submit', event => {
            event.preventDefault();
            this.submitPassword();
        });

        this.errorMessageAnimation = this.querySelector('#error-code-message').animate([
            {transform: 'translateX(0)', easing: 'ease-in'},
            {transform: 'translateX(-5px)', easing: 'ease-out'},
            {transform: 'translateX(5px)', easing: 'ease-in'},
            {transform: 'translateX(0)', easing: 'ease-out'},
        ], {
            duration: 500,
            iterations: 1
        });
        this.errorMessageAnimation.pause();
    }

    submitPassword() {
        const password = this.querySelector('#unlock-password-input').value;

        // TODO Get password from db
        if (password === '0000') {
            this.success();
        } else {
            this.error();
        }
    }

    success() {
        document.body.classList.remove('is-locked');
        this.querySelector('#unlock-password-input').value = '';
        this.querySelector('#error-code-message').classList.add('hidden');
    }

    error() {
        this.querySelector('#error-code-message').classList.remove('hidden');
        this.errorMessageAnimation.play();
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
        // trick to be able to remove the event listener without losing the context
        // cf https://stackoverflow.com/questions/10444077/javascript-removeeventlistener-not-working
        this.onCanvasMouseDown = this.onCanvasMouseDown.bind(this);

        canvas.addEventListener('mousedown', () => {
            canvas.addEventListener('mousemove', this.onCanvasMouseDown, true);
        });
        canvas.addEventListener('mouseup', () => {
            canvas.removeEventListener('mousemove', this.onCanvasMouseDown, true);
            this.submitPattern();
        });
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
        // TODO Get pattern from db
        if (this.selectedPattern.join('') === '123456789') {
            this.success();
        } else {
            this.error();
        }
        this.selectedPattern = [];
        this.drawPattern();
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
            }
        }
    }
}

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

customElements.define(lockScreenTagName, LockScreen);
