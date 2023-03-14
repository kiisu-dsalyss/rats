const { spawn } = require('child_process');

function fadePixels(color, fadeTime) {
  const scriptPath = './fadepixel.py';
  const holdtime = 30;

  const pythonProcess = spawn('sudo', ['python3', scriptPath, color, holdtime, '--fade', fadeTime]);

  pythonProcess.stdout.on('data', (data) => {
    // do something with the output if needed
  });

  pythonProcess.stderr.on('data', (data) => {
    // do something with the error output if needed
  });

  pythonProcess.on('close', (code) => {
    // do something when the process is done if needed
  });
}

function seqPixels(color, fadeTime, direction) {
  const scriptPath = './seqpixel.py';

  const pythonProcess = spawn('sudo', ['python3', scriptPath, color, fadeTime, '--direction', direction]);

  pythonProcess.stdout.on('data', (data) => {
    // do something with the output if needed
  });

  pythonProcess.stderr.on('data', (data) => {
    // do something with the error output if needed
  });

  pythonProcess.on('close', (code) => {
    // do something when the process is done if needed
  });
}

module.exports = {
  fadePixels,
  seqPixels
};
