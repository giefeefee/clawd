const fs = require('fs');
const path = require('path');

const event = process.argv[2] || 'unknown';
const stateDir = path.join(process.env.LOCALAPPDATA, 'clawd');
const stateFile = path.join(stateDir, 'state.json');

fs.mkdirSync(stateDir, { recursive: true });
fs.writeFileSync(stateFile, JSON.stringify({ event, timestamp: Date.now() }));
