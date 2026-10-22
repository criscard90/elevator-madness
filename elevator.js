class Elevator {
    constructor(id, startFloor = 1) {
        this.id = id;
        this.floor = startFloor;
        this.targetFloor = startFloor;
        this.capacity = 3 + (GAME_CONFIG.upgrades.capacity || 0);
        this.currentPassengers = 0;
        this.doorOpen = false;
        this.doorTimer = 0;
        this.speed = 5 + (GAME_CONFIG.upgrades.speed || 0) * 2;
        this.isMoving = false;
        this.springProgress = 0;
        this.springTarget = 0;
        this.springVelocity = 0;
        this.springDamping = 8;
        this.springStiffness = 200;
    }

    moveToFloor(targetFloor) {
        this.targetFloor = targetFloor;
        this.isMoving = true;
        this.springTarget = targetFloor;
    }

    update(deltaTime) {
        if (this.isMoving) {
            const diff = this.springTarget - this.springProgress;
            if (Math.abs(diff) > 0.01) {
                this.springVelocity += diff * this.springStiffness * (deltaTime / 1000);
                this.springVelocity *= Math.pow(this.springDamping, deltaTime / 1000);
                this.springProgress += this.springVelocity * (deltaTime / 1000);
            } else {
                this.springProgress = this.springTarget;
                this.isMoving = false;
                this.springVelocity = 0;
                this.floor = Math.round(this.springProgress);
                this.onFloorArrived();
            }
        }

        if (this.doorOpen) {
            this.doorTimer -= deltaTime;
            if (this.doorTimer <= 0) {
                this.doorOpen = false;
                this.doorTimer = GAME_CONFIG.elevator.doorTime;
            }
        }

        return { floor: this.floor, moving: this.isMoving, doorOpen: this.doorOpen };
    }

    onFloorArrived() {
        this.doorOpen = true;
        this.doorTimer = GAME_CONFIG.elevator.doorTime;
    }

    boardPassenger() {
        if (this.currentPassengers < this.capacity) {
            this.currentPassengers++;
            return true;
        }
        return false;
    }

    alightPassengers(destinationFloor) {
        const alighted = this.currentPassengers;
        this.currentPassengers = 0;
        return alighted;
    }
}