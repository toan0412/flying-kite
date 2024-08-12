const app = require("./app.cjs");

const server = app.listen(process.env.PORT || 3030, () => {
    console.log('Server started on port: ' + (process.env.PORT || 3030));
});

process.on('SIGINT', () => {
    server.close(() => console.log('Server closed'));
});
