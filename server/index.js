import RestServer from './server';

const server = new RestServer();

server.on('listening', () => {
  console.log(`Listening on port ${server.app.get('port')}`);
});
