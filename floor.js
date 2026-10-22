class Floor {
    constructor(index, totalFloors) {
        this.index = index;
        this.totalFloors = totalFloors;
        this.passengers = [];
        this.hasMaintenance = false;
        this.maintenanceTimer = 0;
        this.fireAlarm = false;
        this.fireAlarmTimer = 0;
        this.springProgress = 0;
        this.springTarget = index;
        this.springVelocity = 0;
        this.springDamping = 8;
        this.springStiffness = 200;
    }

    update(deltaTime) {
        if (Math.abs(this.springTarget - this.springProgress) > 0.01) {
            this.springVelocity += (this.springTarget - this.springProgress) * this.springStiffness * (deltaTime / 1000);
            this.springVelocity *= Math.pow(this.springDamping, deltaTime / 1000);
            this.springProgress += this.springVelocity * (deltaTime / 1000);
        } else {
            this.springProgress = this.springTarget;
        }

        this.passengers = this.passengers.filter(p => p.state !== 'fled');
        
        this.passengers.forEach(p => {
            const result = p.update(deltaTime);
            if (result === 'lost') {
                gameState.stars--;
                updateReputationUI();
                if (gameState.stars <= 0) {
                    triggerGameOver();
                }
                const idx = this.passengers.indexOf(p);
                if (idx > -1) this.passengers.splice(idx, 1);
            }
        });

        if (this.hasMaintenance) {
            this.maintenanceTimer -= deltaTime;
            if (this.maintenanceTimer <= 0) {
                this.hasMaintenance = false;
            }
        }
        if (this.fireAlarm) {
            this.fireAlarmTimer -= deltaTime;
            if (this.fireAlarmTimer <= 0) {
                this.fireAlarm = false;
            }
        }
    }

    addPassenger(type, isAnxious = false) {
        const destFloor = Math.floor(Math.random() * this.totalFloors) + 1;
        const passenger = new Passenger(type, this.index, destFloor);
        
        if (isAnxious) {
            passenger.bonusAcceleration = type.acceleratesOthers * 1000;
            this.passengers.forEach(other => {
                if (other.type !== type && other.state === 'waiting') {
                    other.bonusAcceleration += type.acceleratesOthers * 1000;
                }
            });
        }
        
        this.passengers.push(passenger);
        return passenger;
    }

    triggerMaintenance() {
        this.hasMaintenance = true;
        this.maintenanceTimer = 5000;
    }

    triggerFireAlarm() {
        this.fireAlarm = true;
        this.fireAlarmTimer = GAME_CONFIG.hazards.fireAlarmDuration;
        this.passengers.forEach(p => {
            p.destinationFloor = 0;
        });
    }
}