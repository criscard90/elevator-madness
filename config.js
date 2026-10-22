const GAME_CONFIG = {
    initialStars: 3,
    initialMoney: 0,
    basePatience: 30,
    minPatience: 15,
    passengerTypes: {
        standard: { label: 'Pendolare Standard', patience: 30, multiplier: 1, color: '#4a90e2' },
        vip: { label: 'VIP/CEO', patience: 15, multiplier: 5, color: '#ffd700' },
        tourist: { label: 'Turista con Valigie', patience: 25, multiplier: 2, color: '#7ed321', doubleSlot: true },
        courier: { label: 'Corriere Espresso', patience: 20, multiplier: 1.5, color: '#f5a623' },
        anxious: { label: 'Passeggero Ansioso', patience: 30, multiplier: 1, color: '#e94e77', acceleratesOthers: 0.2 }
    },
    elevator: {
        initialCapacity: 3,
        maxCapacity: 6,
        baseSpeed: 5,
        doorTime: 1000
    },
    hazards: {
        morningRushDuration: 20000,
        fireAlarmDuration: 15000,
        blackoutChance: 0.02
    }
};

const GAME_STATE_KEY = 'tower-rush-save';

function loadGameState() {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        stars: GAME_CONFIG.initialStars,
        money: GAME_CONFIG.initialMoney,
        unlockedElevators: 1,
        upgrades: {
            speed: 0,
            capacity: 0,
            doors: 0,
            coffeeShop: false,
            musicLounge: false
        },
        record: parseInt(localStorage.getItem('tower-rush-record') || '0')
    };
}

function saveGameState(state) {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    localStorage.setItem('tower-rush-record', Math.max(state.record || 0, state.stars || 0));
}

export { GAME_CONFIG, GAME_STATE_KEY, loadGameState, saveGameState };