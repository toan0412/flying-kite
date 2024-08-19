const app = require("./app.cjs");
const setupSocket = require('./socket/socket.cjs')


const server = app.listen(process.env.PORT || 3030, () => {
    console.log('Server started on port: ' + (process.env.PORT || 3030));
});

const io = setupSocket(server)

process.on('SIGINT', () => {
    server.close(() => console.log('Server closed'));
});
