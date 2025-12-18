# Hawkins Arcade - Stranger Things Games Collection

A collection of two browser-based games inspired by the hit Netflix series "Stranger Things". Test your skills in both a match-3 puzzle game and a strategic minesweeper-style survival game as you navigate the world of Hawkins and the Upside Down.

## Games Included

### 1. Mind Match (Match-3 Game)
A character-themed match-3 puzzle game featuring your favorite Stranger Things characters.

#### How to Play
1. Open `game 3/match.html` in a web browser
2. Swap adjacent character tiles to form groups of 3 or more matching characters
3. Each match scores points and removes the matched tiles
4. New tiles fall from the top to fill empty spaces
5. Chain reactions earn bonus points
6. Complete the game by reaching 500 points within 30 moves

#### Game Features
- **Character Tiles**: Play with tiles featuring Eleven, Mike, Dustin, Lucas, Will, Steve, and the Demogorgon
- **Scoring System**: Earn 10 points for each tile matched
- **Move Limit**: 30 moves to achieve victory
- **Win Condition**: Score 500 points to win
- **Hint System**: Use the hint button to highlight a possible move
- **Upside Down Mode**: Toggle the atmospheric filter for a different visual experience
- **Responsive Design**: Works on both desktop and mobile devices

#### Controls
- **Mouse/Touch**: Click or tap on a tile to select it, then click/tap on an adjacent tile to swap
- **Reset Button**: Restart the game at any time
- **Hint Button**: Get assistance with a possible move
- **Upside Down Toggle**: Switch between normal and inverted visual modes

#### Technical Details
- Pure HTML, CSS, and JavaScript (no external libraries)
- Uses PNG images for character tiles
- Web Audio API for sound effects
- Retro pixel art aesthetic with scanline effects

---

### 2. Hawkins Sweep (Minesweeper-Style Survival Game)
Navigate the treacherous Upside Down across all four seasons of Stranger Things in this strategic survival game.

#### How to Play
1. Open `stranger-things/wa/index.html` in a web browser
2. Navigate through the dark realm of the Upside Down
3. Survive all 4 seasons of increasing difficulty
4. Avoid Demogorgons or face instant death!
5. Use Eleven's psychic powers strategically

#### Game Structure

##### The Four Seasons
1. **Season 1 - Hawkins Lab**: 3×3 grid (Very Easy)
2. **Season 2 - The Mall**: 4×4 grid (Easy)
3. **Season 3 - The Soviet Facility**: 5×5 grid (Hard)
4. **Season 4 - California Hell**: 6×6 grid (Very Hard)

Each season must be completed to unlock the next, with progressively larger grids and increased danger.

#### Game Rules
- **Objective**: Survive all 4 seasons of the Upside Down
- **Progressive Difficulty**: Each season has a larger grid than the last
- **Season 1**: 3x3 grid, find 3 safe zones
- **Season 2**: 4x4 grid, find 4 safe zones
- **Season 3**: 5x5 grid, find 5 safe zones
- **Season 4**: 6x6 grid, find 5 safe zones
- **Demogorgons (☠️)**: Instant death if encountered
- **Christmas Lights (🛡️)**: Protection and safety
- **Fake Safe Zones (💀)**: Appear in Seasons 3-4, act like deadly tiles when clicked
- **Portals (🌀)**: Transport to safer areas
- **Psychic Powers (⚡)**: Reveal adjacent safe zones

#### Game Features

##### Tile Types
- ☠️ **Demogorgons**: Deadly creatures from the Upside Down. Instant death!
- 🛡️ **Christmas Lights**: Protection from the darkness. Increases survival progress.
- 💀 **Fake Safe Zones**: Deceptive tiles that appear safe but are actually deadly (Seasons 3-4)
- 🌀 **Portals**: Transport mechanisms to safer areas.
- ⚡ **Power Amplifiers**: Increase Eleven's psychic power uses.

##### Eleven's Psychic Powers
- **Remote Viewing**: Briefly reveals 1–2 safe tiles
- **Nosebleed Focus**: Highlights nearby deadly tiles (costs health)
- **Telekinetic Pulse**: Removes one random deadly tile (Season 4 only)

##### Progressive Grid System
- **Season 1**: 3x3 grid (9 tiles total) - Very Easy
- **Season 2**: 4x4 grid (16 tiles total) - Easy
- **Season 3**: 5x5 grid (25 tiles total) - Hard
- **Season 4**: 6x6 grid (36 tiles total) - Very Hard
- Each season becomes increasingly challenging with more tiles to navigate
- Higher ratio of deadly tiles as grid size increases
- Fake safe tiles introduced in later seasons

##### Difficulty Scaling
- **Season 1**: More safe tiles, clear visual cues
- **Season 2**: Fewer safe tiles, some delayed danger
- **Season 3**: Fake safe tiles appear, enemies move between tiles
- **Season 4**: Minimum safe tiles, almost every choice is lethal

##### Atmosphere
- Dark, foggy Upside Down theme
- Visual distortion increases each level
- Audio becomes more intense and unsettling
- Glitch effects as difficulty increases

#### Technical Details
- Pure HTML, CSS, and JavaScript (no external libraries)
- Responsive design works on mobile and desktop
- Click-based interaction only
- No complex physics or dependencies

#### Game Mechanics
- Tile contents are randomly generated each season
- Safe zones become rarer in later seasons
- Winning requires surviving all four seasons
- Progressive difficulty scaling with grid expansion
- Limited psychic power system that becomes weaker in later seasons

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your web browser to access the main menu
3. Choose between "Mind Match" and "Hawkins Sweep" games
4. Enjoy the Stranger Things gaming experience!

## Browser Compatibility

These games work in all modern browsers that support:
- HTML5
- CSS3
- JavaScript ES6+
- Web Audio API (for sound effects)

Tested in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Credits

This fan-made game collection is inspired by the Netflix series "Stranger Things" created by The Duffer Brothers. All character images and intellectual property belong to their respective owners.
