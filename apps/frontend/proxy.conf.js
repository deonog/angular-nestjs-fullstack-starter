const fs = require('fs');
const path = require('path');

function readBackendPort() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, 'utf8').match(/^PORT=(\d+)/m);
    if (match) {
      return Number(match[1]);
    }
  }
  return 3001;
}

const port = readBackendPort();

module.exports = {
  '/api': {
    target: `http://localhost:${port}`,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
};
