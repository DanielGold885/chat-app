const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');

const users = [];
const connections = [];

const PORT = '3300';


server.listen(process.env.PORT || PORT,  () => {
    console.log(`listening to *:${PORT}`);
  });

app.get('/', (req, res) => {
    try{
        res.sendFile(path.resolve(__dirname, '../client/index.html'));
        //serving the index file as a responce to getting the home adress
    }
    catch(err){
        console.log(err);
    }
});

io.sockets.on('connection', socket => {

    //on connect
    connections.push(socket);
    console.log('connected: %s sockets connected ', connections.length);

    //on disconnect
    socket.on('disconnect', data =>{
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('disconnected: %s sockets disconnected ', connections.length);
    });

    //on message send
    socket.on('send message', data => {
        console.log(data);
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    //on new user
    socket.on('new user', (data, callback) => {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();

        console.log('new user joined chat: ', data);
        io.sockets.emit('new user joined chat: ', {msg: data});
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }
});

