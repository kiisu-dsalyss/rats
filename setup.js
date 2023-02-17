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

    rl.question('Please enter OSC receive address: ', (ip) => {
      rl.question('Please enter the baseUrl (e.g. http://0.0.0.0:8080): ', (baseUrl) => {
        rl.question('Please enter the OSC receive port: ', (rcvport) => {
          rl.question('Please enter the client port: ', (clientport) => {
            rl.question('Please enter the default track: ', (defaultTrack) => {
              rl.close();
              resolve({ ip, baseUrl, rcvport, clientport, defaultTrack });
            });
          });
        });
      });
    });
  });
};

const createConfig = async () => {
  const { ip, baseUrl, rcvport, clientport, defaultTrack } = await promptUser();
  const config = `module.exports = {
  ip: '${ip}',
  baseUrl: '${baseUrl}',
  rcvport: ${rcvport},
  clientport: ${clientport},
  defaultTrack: ${defaultTrack}
};`;
  fs.writeFileSync('./secrets/config.js', config);
};

setup();
