const DiscordRPC = require('discord-rpc');
const clientID = '886693671641153578'
let rpc = null;

exports.startDiscord = () => {
  DiscordRPC.register(clientID);
  rpc = new DiscordRPC.Client({ transport: 'ipc' });
  rpc.login({clientId: clientID});

  rpc.on('ready', () => {
    rpc.setActivity({
      state: `Home`,
      buttons: [
        {
          label: 'Join',
          url: 'https://parallelsocial.net/',
        },
      ],
      largeImageKey: 'logo',
      largeImageText: 'Parallel'
    });
  });
}

exports.setStatus = (status) => {
  rpc.setActivity({
    state: `${status}`,
    buttons: [
      {
        label: 'Join',
        url: 'https://parallelsocial.net/',
      },
    ],
    largeImageKey: 'logo',
    largeImageText: 'Parallel'
  });
}

exports.clearStatus = () => {
  rpc.setActivity({
    state: `Home`,
    buttons: [
      {
        label: 'Join',
        url: 'https://parallelsocial.net/',
      },
    ],
    largeImageKey: 'logo',
    largeImageText: 'Parallel'
  });
}