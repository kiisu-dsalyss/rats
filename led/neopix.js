const { spawn } = require('child_process');

function fadePixels(color, fadeTime) {
  return new Promise((resolve, reject) => {
    const scriptPath = './led/fadepixel.py';
    const holdtime = 30;
    let stdout = '';
    let stderr = '';

    const pythonProcess = spawn('sudo', ['python3', scriptPath, color, holdtime, '--fade', fadeTime]);

    pythonProcess.stdout.on('data', (data) => {
      stdout += data;
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data;
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject({ code, stderr });
      }
    });
  });
}

// function pixelToBrightness(color, brightness) {
//   return new Promise((resolve, reject) => {
//     const scriptPath = './led/fadepixel.py';
//     let stdout = '';
//     let stderr = '';
// 
//     const pythonProcess = spawn('sudo', ['python3', scriptPath, color, brightness]);
// 
//     pythonProcess.stdout.on('data', (data) => {
//       stdout += data;
//     });
// 
//     pythonProcess.stderr.on('data', (data) => {
//       stderr += data;
//     });
// 
//     pythonProcess.on('close', (code) => {
//       if (code === 0) {
//         resolve(stdout);
//       } else {
//         reject({ code, stderr });
//       }
//     });
//   });
// }

function seqPixels(color, fadeTime, direction) {
  return new Promise((resolve, reject) => {
    const scriptPath = './led/seqpixel.py';
    let stdout = '';
    let stderr = '';

    const pythonProcess = spawn('sudo', ['python3', scriptPath, color, fadeTime, '--direction', direction]);

    pythonProcess.stdout.on('data', (data) => {
      stdout += data;
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data;
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject({ code, stderr });
      }
    });
  });
}

module.exports = {
  fadePixels,
  pixelToBrightness,
  seqPixels
};
