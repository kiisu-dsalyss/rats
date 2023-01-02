const fs = require('fs');
const readline = require('readline');

const setup = () => {
  const directory = './secrets';
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  const configFile = './secrets/config.js';
  if (fs.existsSync(configFile)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('A config file already exists. Do you want to overwrite it? (y/n) ', (answer) => {
      if (answer === 'y') {
        rl.close();
        createConfig();
      } else {
        console.log('Exiting setup process.');
        process.exit();
      }
    });
  } else {
    createConfig();
  }
};

const promptUser = () => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Please enter the baseUrl: ', (baseUrl) => {
      rl.question('Please enter the port you want to run the server on: ', (port) => {
        rl.close();
        resolve({ baseUrl, port });
      });
    });
  });
};

const createConfig = async () => {
  const { baseUrl, port } = await promptUser();
  const config = `module.exports = {
  baseUrl: '${baseUrl}:8080',
  port: ${port}
};`;
  fs.writeFileSync('./secrets/config.js', config);
};

setup();
