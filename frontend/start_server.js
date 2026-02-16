const { spawn } = require('child_process');
const path = require('path');

// Change to the frontend directory
process.chdir(path.join(__dirname));

console.log('Starting Next.js development server...');

// Start the next dev server as a child process
const nextProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (err) => {
  console.error('Failed to start server:', err.message);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js server exited with code ${code}`);
});