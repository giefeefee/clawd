const fs = require('fs');
const path = require('path');

const LOCALAPPDATA = process.env.LOCALAPPDATA || path.join(require('os').homedir(), '.local', 'share');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const rl = data.rate_limits;
    if (rl) {
      const dir = path.join(LOCALAPPDATA, 'clawd');
      fs.mkdirSync(dir, { recursive: true });
      const usagePath = path.join(dir, 'usage.json');
      const existing = {};
      try { Object.assign(existing, JSON.parse(fs.readFileSync(usagePath, 'utf8'))); } catch (e) {}
      existing.five_hour = rl.five_hour ? rl.five_hour.used_percentage : null;
      existing.five_hour_resets = rl.five_hour ? rl.five_hour.resets_at : null;
      existing.seven_day = rl.seven_day ? rl.seven_day.used_percentage : null;
      existing.seven_day_resets = rl.seven_day ? rl.seven_day.resets_at : null;
      existing.ts = Date.now();
      fs.writeFileSync(usagePath, JSON.stringify(existing));
    }
  } catch (e) {}
  const data2 = JSON.parse(input || '{}');
  const rl2 = data2.rate_limits;
  if (rl2 && rl2.five_hour) {
    process.stdout.write('5h:' + rl2.five_hour.used_percentage + '%');
  }
});
