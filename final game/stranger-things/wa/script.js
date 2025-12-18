// Stranger Things seasons with progressive difficulty
const SEASONS = [
    { 
        number: 1, 
        name: "Hawkins Lab", 
        gridSize: 3, 
        safeNeeded: 3, 
        deadlyRatio: 0.4, 
        safeBonus: 0, // Changed to 0 to match exactly
        powerTypes: ["remoteViewing", "nosebleedFocus"],
        powerUses: 2
    },
    { 
        number: 2, 
        name: "The Mall", 
        gridSize: 4, 
        safeNeeded: 4, 
        deadlyRatio: 0.5, 
        safeBonus: 0, // Changed to 0 to match exactly
        powerTypes: ["remoteViewing", "nosebleedFocus"], // Removed echoSense
        powerUses: 2
    },
    { 
        number: 3, 
        name: "The Soviet Facility", 
        gridSize: 5, 
        safeNeeded: 5, 
        deadlyRatio: 0.6, 
        safeBonus: 0, // Changed to 0 to match exactly
        powerTypes: ["remoteViewing", "nosebleedFocus"], // Removed echoSense
        powerUses: 1
    },
    { 
        number: 4, 
        name: "California Hell", 
        gridSize: 6, 
        safeNeeded: 5, // Changed to 5 as requested
        deadlyRatio: 0.7, 
        safeBonus: 0, // Changed to 0 to match exactly
        powerTypes: ["remoteViewing", "nosebleedFocus", "telekineticPulse"], // Removed echoSense
        powerUses: 1
    }
];

// Tile types
const TILE_TYPES = {
    DEADLY: 'deadly',
    SAFE: 'safe',
    FAKE_SAFE: 'fake_safe', // New for higher difficulties
    PORTAL: 'portal',
    POWER: 'power'
};

// Game state
let gameState = {
    grid: [],
    safeTilesFound: 0,
    gameOver: false,
    gameWon: false,
    powerActive: false,
    revealedTiles: new Set(),
    cluesEnabled: true,
    clueReveals: 0, // Will be set per season
    currentSeason: 0,
    seasonSafeTiles: 0,
    playerHealth: 100, // New for nosebleed focus power
    usedPowers: 0 // Track used powers per season
};

// DOM elements
const gridElement = document.getElementById('grid');
const progressElement = document.getElementById('progress');
const progressTextElement = document.getElementById('progress-text');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restart-btn');
const clueButton = document.getElementById('clue-btn');
const seasonNumberElement = document.getElementById('season-number');

// Initialize the game
function initGame() {
    // Reset game state
    gameState = {
        grid: [],
        safeTilesFound: 0,
        gameOver: false,
        gameWon: false,
        powerActive: false,
        revealedTiles: new Set(),
        cluesEnabled: true,
        clueReveals: SEASONS[0].powerUses,
        currentSeason: 0,
        seasonSafeTiles: 0,
        playerHealth: 100,
        usedPowers: 0
    };
    
    // Clear the grid
    gridElement.innerHTML = '';
    
    // Hide any game over screen
    const gameOverScreen = document.querySelector('.game-over');
    if (gameOverScreen) {
        gameOverScreen.remove();
    }
    
    // Hide any season transition screen
    const seasonTransition = document.querySelector('.season-transition');
    if (seasonTransition) {
        seasonTransition.remove();
    }
    
    // Reset UI
    updateProgress();
    updateSeasonDisplay();
    messageElement.textContent = "Welcome to Hawkins Lab! Eleven's powers are at full strength...";
    updateClueButton();
    
    // Generate the grid
    generateGrid();
    renderGrid();
}

// Update season display
function updateSeasonDisplay() {
    const season = SEASONS[gameState.currentSeason];
    seasonNumberElement.textContent = season.number;
    document.querySelector('.level-indicator span').innerHTML = 
        `Season <span id="season-number">${season.number}</span> - ${season.name} (${season.gridSize}x${season.gridSize})`;
}

// Generate the game grid with randomized tiles
function generateGrid() {
    const season = SEASONS[gameState.currentSeason];
    const gridSize = season.gridSize;
    const totalTiles = gridSize * gridSize;
    
    // Create an array with tile types distribution
    const tileDistribution = [];
    
    // Add deadly tiles based on season difficulty
    const deadlyCount = Math.floor(totalTiles * season.deadlyRatio);
    for (let i = 0; i < deadlyCount; i++) {
        tileDistribution.push(TILE_TYPES.DEADLY);
    }
    
    // Add exactly the number of safe tiles needed
    const safeCount = season.safeNeeded;
    for (let i = 0; i < safeCount; i++) {
        tileDistribution.push(TILE_TYPES.SAFE);
    }
    
    // Add fake safe tiles for higher difficulties
    if (season.number >= 3) {
        const fakeSafeCount = Math.floor(totalTiles * 0.1); // 10% fake safe tiles
        for (let i = 0; i < fakeSafeCount; i++) {
            tileDistribution.push(TILE_TYPES.FAKE_SAFE);
        }
    }
    
    // Add portal tiles (1-2)
    const portalCount = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < portalCount; i++) {
        tileDistribution.push(TILE_TYPES.PORTAL);
    }
    
    // Add power tiles
    const powerCount = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < powerCount; i++) {
        tileDistribution.push(TILE_TYPES.POWER);
    }
    
    // Fill remaining slots with deadly tiles if needed
    while (tileDistribution.length < totalTiles) {
        tileDistribution.push(TILE_TYPES.DEADLY);
    }
    
    // Shuffle the array
    shuffleArray(tileDistribution);
    
    // Create grid structure
    gameState.grid = [];
    for (let i = 0; i < totalTiles; i++) {
        gameState.grid.push({
            id: i,
            type: tileDistribution[i],
            revealed: false,
            revealedByPower: false,
            hasClue: false,
            powerMarker: null, // New: track what type of marker Eleven's power placed
            adjacentDangerCount: null // New: store adjacent danger count for safe tiles
        });
    }
    
    // Reset power uses for this season
    gameState.clueReveals = season.powerUses;
    gameState.usedPowers = 0;
    
    // Calculate adjacent danger counts for all safe tiles
    calculateAdjacentDangers();
}

// Calculate adjacent danger counts for all safe tiles (non-diagonal only)
function calculateAdjacentDangers() {
    const season = SEASONS[gameState.currentSeason];
    const gridSize = season.gridSize;
    
    for (let i = 0; i < gameState.grid.length; i++) {
        const tile = gameState.grid[i];
        
        // Only calculate for safe tiles
        if (tile.type === TILE_TYPES.SAFE) {
            const adjacentTiles = getAdjacentTilesNonDiagonal(i);
            let dangerCount = 0;
            
            for (const adjId of adjacentTiles) {
                const adjTile = gameState.grid[adjId];
                if (adjTile && (adjTile.type === TILE_TYPES.DEADLY || adjTile.type === TILE_TYPES.FAKE_SAFE)) {
                    dangerCount++;
                }
            }
            
            tile.adjacentDangerCount = dangerCount;
        }
    }
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Render the grid
function renderGrid() {
    const season = SEASONS[gameState.currentSeason];
    const gridSize = season.gridSize;
    
    // Set grid dimensions
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    gridElement.innerHTML = '';
    
    for (let i = 0; i < gameState.grid.length; i++) {
        const tile = gameState.grid[i];
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.dataset.id = tile.id;
        
        // Add event listeners
        tileElement.addEventListener('click', () => handleTileClick(tile.id));
        tileElement.addEventListener('mouseenter', () => playHeartbeatSound());
        
        // Add power marker visualization if Eleven's power was used on this tile
        if (tile.powerMarker) {
            tileElement.classList.add('power-marker');
            tileElement.classList.add(tile.powerMarker);
        }
        
        // Reveal tile if needed
        if (tile.revealed || tile.revealedByPower) {
            tileElement.classList.add('revealed');
            tileElement.classList.add(tile.type);
            
            // Show icon based on type
            let icon = '';
            switch (tile.type) {
                case TILE_TYPES.DEADLY:
                    icon = '☠️';
                    break;
                case TILE_TYPES.SAFE:
                    // Always show shield icon for safe tiles
                    icon = '🛡️';
                    break;
                case TILE_TYPES.FAKE_SAFE:
                    icon = '💀'; // Fake safe tiles reveal as deadly when clicked
                    break;
                case TILE_TYPES.PORTAL:
                    icon = '🌀';
                    break;
                case TILE_TYPES.POWER:
                    icon = '⚡';
                    break;
            }
            
            tileElement.innerHTML = `<span>${icon}</span>`;
            
            // Add adjacent danger count as a separate element for safe tiles
            if (tile.type === TILE_TYPES.SAFE && tile.adjacentDangerCount !== null) {
                const dangerCountElement = document.createElement('div');
                dangerCountElement.className = 'danger-count';
                dangerCountElement.textContent = tile.adjacentDangerCount;
                tileElement.appendChild(dangerCountElement);
            }
        }
        
        gridElement.appendChild(tileElement);
    }
}

// Handle tile click
function handleTileClick(tileId) {
    // Don't process if game is over or tile already revealed
    if (gameState.gameOver || gameState.gameWon || gameState.revealedTiles.has(tileId)) {
        return;
    }
    
    const tile = gameState.grid[tileId];
    tile.revealed = true;
    gameState.revealedTiles.add(tileId);
    
    // Process tile type
    switch (tile.type) {
        case TILE_TYPES.DEADLY:
            handleDeadlyTile(tileId);
            break;
        case TILE_TYPES.SAFE:
            handleSafeTile(tileId);
            break;
        case TILE_TYPES.FAKE_SAFE:
            handleFakeSafeTile(tileId);
            break;
        case TILE_TYPES.PORTAL:
            handlePortalTile(tileId);
            break;
        case TILE_TYPES.POWER:
            handlePowerTile(tileId);
            break;
    }
    
    // Update the grid display immediately
    renderGrid();
}

// Handle deadly tile click
function handleDeadlyTile(tileId) {
    gameState.gameOver = true;
    
    // Season-specific death messages
    const season = SEASONS[gameState.currentSeason];
    const deathMessages = [
        "The Demogorgon got you! But you can try again...",
        "The Mind Flayer's influence was too strong this time...",
        "The Upside Down consumed you, but Eleven believes in you!",
        `Season ${season.number}'s horrors defeated you, but you can retry!`
    ];
    
    messageElement.textContent = deathMessages[Math.floor(Math.random() * deathMessages.length)];
    playDeathSound();
    showGameOver(false);
}

// Handle safe tile click
function handleSafeTile(tileId) {
    gameState.safeTilesFound++;
    gameState.seasonSafeTiles++;
    
    // Show adjacent danger count
    const tile = gameState.grid[tileId];
    if (tile.adjacentDangerCount !== null) {
        messageElement.textContent = `Safe zone found! Shield activated. Adjacent danger zones: ${tile.adjacentDangerCount}`;
    } else {
        // Season-specific messages
        const season = SEASONS[gameState.currentSeason];
        const messages = [
            `Good job! You found safety in the ${season.name}...`,
            "The Christmas lights keep the darkness away!",
            "Eleven's presence protects you...",
            "You're getting closer to escaping!",
            "The Hawkins crew would be proud of you!",
            "Another safe zone secured! Keep going!",
            "You're doing great! Just a few more to go!"
        ];
        
        messageElement.textContent = messages[Math.floor(Math.random() * messages.length)];
    }
    
    // Update progress and check for season completion
    updateProgress();
}

// Handle fake safe tile click
function handleFakeSafeTile(tileId) {
    // Fake safe tiles act like deadly tiles
    gameState.gameOver = true;
    
    const season = SEASONS[gameState.currentSeason];
    messageElement.textContent = `Tricked by a fake safe zone in ${season.name}! The Upside Down is full of deception...`;
    playDeathSound();
    showGameOver(false);
}

// Advance to next season
function advanceToNextSeason() {
    // Check if player completed all seasons
    if (gameState.currentSeason >= SEASONS.length - 1) {
        // Game completed
        gameState.gameWon = true;
        messageElement.textContent = "Incredible! You've escaped all seasons of the Upside Down!";
        showGameOver(true);
    } else {
        // Advance to next season
        gameState.currentSeason++;
        gameState.seasonSafeTiles = 0;
        showSeasonTransition();
    }
}

// Show season transition screen
function showSeasonTransition() {
    const season = SEASONS[gameState.currentSeason];
    
    const transitionScreen = document.createElement('div');
    transitionScreen.className = 'season-transition';
    
    const title = document.createElement('h2');
    title.textContent = `SEASON ${season.number}`;
    
    const subtitle = document.createElement('p');
    subtitle.textContent = `${season.name} - ${season.gridSize}x${season.gridSize} Grid`;
    
    transitionScreen.appendChild(title);
    transitionScreen.appendChild(subtitle);
    
    document.body.appendChild(transitionScreen);
    
    // Update UI after transition
    setTimeout(() => {
        updateSeasonDisplay();
        messageElement.textContent = `Welcome to Season ${season.number}: ${season.name}. Grid expanded to ${season.gridSize}x${season.gridSize}! Eleven's powers adjusted for this challenge.`;
        initSeason();
    }, 2000);
}

// Initialize new season
function initSeason() {
    // Reset grid for new season
    gameState.grid = [];
    gameState.revealedTiles = new Set();
    
    // Generate new grid
    generateGrid();
    renderGrid();
    updateClueButton();
    updateProgress();
}

// Handle portal tile click
function handlePortalTile(tileId) {
    const season = SEASONS[gameState.currentSeason];
    messageElement.textContent = `A helpful portal to ${season.name} opens before you!`;
    
    // Move player closer to escape (reveal a safe tile)
    const safeTiles = gameState.grid.filter(tile => 
        (tile.type === TILE_TYPES.SAFE || tile.type === TILE_TYPES.FAKE_SAFE) && 
        !tile.revealed && 
        !tile.revealedByPower
    );
    
    if (safeTiles.length > 0) {
        const randomSafeTile = safeTiles[Math.floor(Math.random() * safeTiles.length)];
        randomSafeTile.revealedByPower = true;
        gameState.revealedTiles.add(randomSafeTile.id);
        
        // If it's a fake safe tile, reveal it as such
        if (randomSafeTile.type === TILE_TYPES.FAKE_SAFE) {
            gameState.gameOver = true;
            messageElement.textContent = `The portal led to a trap! Fake safe zone exposed in ${season.name}...`;
            playDeathSound();
            showGameOver(false);
            return;
        }
        
        gameState.safeTilesFound++;
        gameState.seasonSafeTiles++;
        
        // Update progress and check for season completion
        updateProgress();
    }
}

// Handle power tile click
function handlePowerTile(tileId) {
    messageElement.textContent = "You found a power amplifier! Your psychic abilities are enhanced!";
    gameState.powerActive = true;
    
    // Increase available power uses
    const season = SEASONS[gameState.currentSeason];
    gameState.clueReveals += 1;
    updateClueButton();
    
    // Re-render to show updated button
    renderGrid();
}

// Get adjacent tiles for a given tile ID (non-diagonal only)
function getAdjacentTilesNonDiagonal(tileId) {
    const season = SEASONS[gameState.currentSeason];
    const gridSize = season.gridSize;
    const row = Math.floor(tileId / gridSize);
    const col = tileId % gridSize;
    const adjacent = [];
    
    // Check only 4 directions (up, down, left, right) - no diagonals
    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // Check bounds
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            const newId = newRow * gridSize + newCol;
            adjacent.push(newId);
        }
    }
    
    return adjacent;
}

// Update progress bar
function updateProgress() {
    const season = SEASONS[gameState.currentSeason];
    const progressPercent = Math.min(100, Math.floor((gameState.seasonSafeTiles / season.safeNeeded) * 100));
    progressElement.style.width = `${progressPercent}%`;
    progressTextElement.textContent = `${progressPercent}%`;
    
    // Automatically advance to next season when progress reaches 100%
    if (progressPercent >= 100) {
        setTimeout(() => {
            advanceToNextSeason();
        }, 500); // Small delay to allow player to see 100% progress
    }
}

// Update clue button text
function updateClueButton() {
    if (clueButton) {
        const season = SEASONS[gameState.currentSeason];
        const powerNames = {
            "remoteViewing": "Remote Viewing",
            "nosebleedFocus": "Nosebleed Focus",
            "telekineticPulse": "Telekinetic Pulse"
        };
        
        // Get available powers for this season
        const availablePowers = season.powerTypes.map(p => powerNames[p]).join(", ");
        clueButton.textContent = `Eleven's Powers (${gameState.clueReveals} left) - ${availablePowers}`;
    }
}

// Show game over screen
function showGameOver(isWin) {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'game-over';
    
    const title = document.createElement('h2');
    title.textContent = isWin ? 'VICTORY! ESCAPED ALL SEASONS!' : 'DEFEATED!';
    
    const message = document.createElement('p');
    if (isWin) {
        message.textContent = `Amazing! You survived all ${SEASONS.length} seasons of the Upside Down! Total safe zones found: ${gameState.safeTilesFound}`;
    } else {
        const season = SEASONS[gameState.currentSeason];
        message.textContent = `Defeated in Season ${season.number}: ${season.name} (${season.gridSize}x${season.gridSize}). Safe zones found: ${gameState.safeTilesFound}. Try again - you've got this!`;
    }
    
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Play Again';
    restartBtn.addEventListener('click', initGame);
    
    gameOverScreen.appendChild(title);
    gameOverScreen.appendChild(message);
    gameOverScreen.appendChild(restartBtn);
    
    document.body.appendChild(gameOverScreen);
}

// Reveal a clue (mark a safe tile with a visual indicator)
function revealClue() {
    // Check if clues are enabled and player has clue reveals left
    if (!gameState.cluesEnabled || gameState.clueReveals <= 0) {
        return;
    }
    
    // Use a power
    gameState.clueReveals--;
    gameState.usedPowers++;
    updateClueButton();
    
    // Determine which power to use based on season
    const season = SEASONS[gameState.currentSeason];
    const availablePowers = season.powerTypes;
    const randomPower = availablePowers[Math.floor(Math.random() * availablePowers.length)];
    
    // Execute the chosen power
    switch (randomPower) {
        case "remoteViewing":
            useRemoteViewing();
            break;
        case "nosebleedFocus":
            useNosebleedFocus();
            break;
        case "telekineticPulse":
            useTelekineticPulse();
            break;
    }
    
    // Re-render to show updated button
    renderGrid();
}

// Remote Viewing Power - Reveals 1-2 safe tiles
function useRemoteViewing() {
    messageElement.textContent = "Eleven uses Remote Viewing! Safe zones briefly glow...";
    
    // Find unrevealed safe tiles
    const unrevealedSafeTiles = gameState.grid.filter(tile => 
        tile.type === TILE_TYPES.SAFE && 
        !tile.revealed && 
        !tile.revealedByPower &&
        !tile.powerMarker
    );
    
    if (unrevealedSafeTiles.length > 0) {
        // Reveal 1-2 safe tiles
        const tilesToReveal = Math.min(Math.floor(Math.random() * 2) + 1, unrevealedSafeTiles.length);
        
        for (let i = 0; i < tilesToReveal; i++) {
            const randomTile = unrevealedSafeTiles[Math.floor(Math.random() * unrevealedSafeTiles.length)];
            randomTile.powerMarker = 'safe-marker'; // Light bulb marker for safe zones
        }
        
        // Re-render grid to show markers
        renderGrid();
        messageElement.textContent = `Eleven's Remote Viewing reveals ${tilesToReveal} safe zone(s)! Look for 💡 markers.`;
    } else {
        messageElement.textContent = "Eleven's Remote Viewing found no safe zones nearby...";
    }
}

// Nosebleed Focus Power - Highlights deadly tiles (costs health)
function useNosebleedFocus() {
    messageElement.textContent = "Eleven uses Nosebleed Focus! Deadly zones revealed at cost of health...";
    
    // Reduce player health
    gameState.playerHealth -= 10;
    
    // Find unrevealed deadly tiles
    const unrevealedDeadlyTiles = gameState.grid.filter(tile => 
        (tile.type === TILE_TYPES.DEADLY || tile.type === TILE_TYPES.FAKE_SAFE) && 
        !tile.revealed && 
        !tile.revealedByPower &&
        !tile.powerMarker
    );
    
    if (unrevealedDeadlyTiles.length > 0) {
        // Reveal 2-3 deadly tiles
        const tilesToReveal = Math.min(Math.floor(Math.random() * 2) + 2, unrevealedDeadlyTiles.length);
        
        for (let i = 0; i < tilesToReveal; i++) {
            const randomTile = unrevealedDeadlyTiles[Math.floor(Math.random() * unrevealedDeadlyTiles.length)];
            randomTile.powerMarker = 'danger-marker'; // Red cross marker for danger zones
        }
        
        // Re-render grid to show markers
        renderGrid();
        messageElement.textContent = `Eleven's Nosebleed Focus reveals ${tilesToReveal} danger zone(s)! Look for ✝ markers.`;
    } else {
        messageElement.textContent = "Eleven's Nosebleed Focus found no immediate dangers...";
    }
}

// Telekinetic Pulse Power - Removes one random deadly tile (Season 4 only)
function useTelekineticPulse() {
    messageElement.textContent = "Eleven uses Telekinetic Pulse! A deadly zone is destroyed...";
    
    // Find a random deadly tile and convert it to safe
    const deadlyTiles = gameState.grid.filter(tile => tile.type === TILE_TYPES.DEADLY);
    
    if (deadlyTiles.length > 0) {
        const randomTile = deadlyTiles[Math.floor(Math.random() * deadlyTiles.length)];
        randomTile.type = TILE_TYPES.SAFE;
        messageElement.textContent = "Eleven's Telekinetic Pulse destroyed a deadly zone!";
    } else {
        messageElement.textContent = "Eleven's Telekinetic Pulse found no targets to destroy...";
    }
    
    // Re-render to show updated message
    renderGrid();
}

// Play sounds (placeholder functions)
function playHeartbeatSound() {
    // In a real implementation, this would play a heartbeat sound
    // console.log("Heartbeat sound");
}

function playDeathSound() {
    // In a real implementation, this would play a death/distortion sound
    // console.log("Death sound");
}

// Event listeners
restartButton.addEventListener('click', initGame);
clueButton.addEventListener('click', revealClue);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);