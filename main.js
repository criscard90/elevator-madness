/// Import modules
import { GAME_CONFIG, GAME_STATE_KEY, loadGameState, saveGameState } from './config.js';
import { PassengerTypes } from './passenger.js';
import { Elevator } from './elevator.js';
import { Floor } from './floor.js';

let gameState = loadGameState();
const game = {
    state: gameState,
    buildingHeight: 500,
    floors: [],
    elevators: [],
    clock: new THREE.Clock(),
    isPaused: false,
    morningRushTimer: 0,
    activeHazards: [],
    currentDestinationFloor: 1,
    activeElevator: 1,
initThreeJS: function() {
    const container = document.getElementById('canvas-container');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(10, 20, 30);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.createBuilding();
    this.createElevators();
    this.createFloors();
    window.addEventListener('resize', this.onResize.bind(this));
    this.setupKeyboardControls();
    this.lastTime = performance.now();
    this.gameLoop();
},
onResize: function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
},
createBuilding: function() {
    const geometry = new THREE.BoxGeometry(20, this.buildingHeight, 20);
    const material = new THREE.MeshStandardMaterial({ color: 0x4a4a6a });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(0, this.buildingHeight / 2, 0);
    this.scene.add(building);
    
    // Add floor markers
    for (let i = 1; i <= this.buildingHeight / 50; i++) {
        const markerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
        const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(0, i * 50, 0);
        this.scene.add(marker);
    }
},
createElevators: function() {
    for (let i = 0; i < GAME_CONFIG.initialElevators || 2; i++) {
        const elevator = new Elevator(i + 1);
        this.elevators.push(elevator);
        // Position elevator at starting floor area
        elevator.floor = 1;
        elevator.springProgress = 1;
        elevator.springTarget = 1;
    }
},
createFloors: function() {
    const totalFloors = this.buildingHeight / 50;
    for (let i = 0; i < totalFloors; i++) {
        const floor = new Floor(i + 1, totalFloors);
        this.floors.push(floor);
    }
},
setupKeyboardControls: function() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
},
handleKeyDown: function(event) {
    switch(event.key) {
        case '1':
            this.selectElevator(1);
            break;
        case '2':
            this.selectElevator(2);
            break;
        case '3':
            this.selectElevator(3);
            break;
        case ' ':
            this.toggleElevatorDoors();
            break;
        case 'm':
            this.triggerMorningRush();
            break;
        case 'f':
            this.triggerFireAlarm();
            break;
        case 'b':
            this.triggerBlackout();
            break;
    }
},
toggleElevatorDoors: function() {
    if (this.activeElevator && this.activeElevator <= this.elevators.length) {
        const elevator = this.elevators[this.activeElevator - 1];
        elevator.doorOpen = !elevator.doorOpen;
        if (elevator.doorOpen) {
            elevator.doorTimer = GAME_CONFIG.elevator.doorTime;
        }
    }
},
spawnPassengerAtFloor: function(floorIndex) {
    if (this.floors[floorIndex - 1]) {
        const floor = this.floors[floorIndex - 1];
        const type = Object.values(PassengerTypes)[Math.floor(Math.random() * Object.values(PassengerTypes).length)];
        floor.addPassenger(type);
    }
},
triggerMorningRush: function() {
    this.morningRushTimer = GAME_CONFIG.hazards.morningRushDuration;
    // Add extra passengers during morning rush
    for (let i = 0; i < 5; i++) {
        setTimeout(() => this.spawnPassengerAtFloor(Math.floor(Math.random() * this.floors.length) + 1), i * 500);
    }
},
triggerFireAlarm: function() {
    if (this.activeElevator && this.activeElevator <= this.elevators.length) {
        const elevator = this.elevators[this.activeElevator - 1];
        this.activeElevator = this.activeElevator % this.elevators.length + 1;
    }
    this.floors.forEach(floor => floor.triggerFireAlarm());
},
triggerBlackout: function() {
    this.scene.background = new THREE.Color(0x000000);
    setTimeout(() => { this.scene.background = new THREE.Color(0x1a1a2e); }, 3000);
},
gameLoop: function() {
    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    
    // Update elevators
    this.elevators.forEach(elevator => elevator.update(deltaTime / 1000));
    
    // Update floors
    this.floors.forEach(floor => floor.update(deltaTime / 1000));
    
    // Render
    this.renderer.render(this.scene, this.camera);
    
    this.requestAnimationFrame(this.gameLoop.bind(this));
}
};