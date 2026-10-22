class PassengerType {
    constructor(data) {
        this.label = data.label;
        this.patience = data.patience;
        this.multiplier = data.multiplier;
        this.color = data.color;
        this.doubleSlot = data.doubleSlot || false;
        this.acceleratesOthers = data.acceleratesOthers || 0;
    }
}

const PassengerTypes = {
    standard: new PassengerType({
        label: 'Pendolare Standard',
        patience: 30,
        multiplier: 1,
        color: '#4a90e2'
    }),
    vip: new PassengerType({
        label: 'VIP/CEO',
        patience: 15,
        multiplier: 5,
        color: '#ffd700'
    }),
    tourist: new PassengerType({
        label: 'Turista con Valigie',
        patience: 25,
        multiplier: 2,
        color: '#7ed321',
        doubleSlot: true
    }),
    courier: new PassengerType({
        label: 'Corriere Espresso',
        patience: 20,
        multiplier: 1.5,
        color: '#f5a623'
    }),
    anxious: new PassengerType({
        label: 'Passeggero Ansioso',
        patience: 30,
        multiplier: 1,
        color: '#e94e77',
        acceleratesOthers: 0.2
    })
};

class Passenger {
    constructor(type, floor, destinationFloor) {
        this.type = type;
        this.floor = floor;
        this.destinationFloor = destinationFloor;
        this.state = 'waiting';
        this.patience = type.patience;
        this.maxPatience = type.patience;
        this.bonusAcceleration = 0;
        this.elapsed = 0;
        this.domElement = this.createDomElement();
    }

    createDomElement() {
        const el = document.createElement('div');
        el.className = 'passenger-indicator';
        el.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            background: ${this.type.color};
            border-radius: 50%;
            border: 2px solid #fff;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 50;
        `;
        return el;
    }

    update(deltaTime) {
        if (this.state === 'waiting' || this.state === 'fleeing') {
            this.elapsed += deltaTime;
            const effectivePatience = this.patience - this.bonusAcceleration * deltaTime / 1000;
            if (effectivePatience <= 0) {
                this.state = 'fleeing';
                this.patience = 0;
                return 'lost';
            }
            this.patience = effectivePatience;
        }
        return 'alive';
    }

    getReward() {
        return Math.floor(10 * this.multiplier);
    }

    getPatiencePercentage() {
        return Math.max(0, (this.patience / this.maxPatience) * 100);
    }
}