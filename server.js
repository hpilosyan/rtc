/*var express = require('express'),
    http = require('http'),
    path = require('path');

var app = express();
var server = http.createServer(app);

app.configure(function(){
    app.use(express.static(path.join(__dirname, 'public')));
});

server.listen(Number(process.env.PORT || 7000));

var room = null;
var caller_ice = [];
var caller_sdp = null;
var callee_ice = [];
var callee_sdp = null;

var io = require("socket.io").listen(server);
io.sockets.on("connection", function (socket) {
    socket.on("createRoom", function(room_name) {
        var handle = setInterval(function() {
            if (callee_ice.length && callee_sdp) {
                socket.emit("setInfo", JSON.stringify({ "sdp": callee_sdp }));
                socket.emit("setInfo", JSON.stringify({ "candidate": callee_ice }));

                clearInterval(handle);
            }
        }, 500);
        room = room_name;
    });

    socket.on("joinRoom", function(room_name) {
        console.log("HERE");
        socket.emit("setInfo", JSON.stringify({ "sdp": caller_sdp }));
        socket.emit("setInfo", JSON.stringify({ "candidate": caller_ice }));

        room = room_name;
    });

    socket.on("sendDescription", function(data) {
        data = JSON.parse(data);
        //console.log("SDP", data);
        if (data.isCaller) {
            caller_sdp = data.sdp;
        } else {
            callee_sdp = data.sdp;
        }
    });

    socket.on("sendCandidate", function(data) {
        data = JSON.parse(data);
        if (data.isCaller) {
            if (data.candidate)
                caller_ice.push(data.candidate);
        } else {
            callee_ice.push(data.candidate);
        }
    });
});
*/

var express = require('express'),
    http = require('http'),
    path = require('path');

var app = express();
var server = http.createServer(app);

app.configure(function(){
    app.use(express.static(path.join(__dirname, 'public')));
});

server.listen(Number(process.env.PORT || 7000));

var io = require("socket.io").listen(server);

var rooms = {};
// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
    var localRoom = null;
    var roomName = "";
    //console.log(io.sockets.clients(room));
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('createRoom', function(room) {
        socket.join(room);
        roomName = room;
        localRoom = rooms[room] = {
            caller: {
                sdp: null,
                candidate: []
            },
            callee: {
                sdp: null,
                candidate: []
            }
        };
    });

    socket.on('joinRoom', function(room) {
        localRoom = rooms[room];
        roomName = room;
        if (!localRoom) {
            return;
        }
        socket.join(room);
        socket.emit("setInfo", JSON.stringify(localRoom.caller.sdp));
        socket.emit("setInfo", JSON.stringify(localRoom.caller.candidate));
    });

    socket.on('disconnect', function() {
        console.log(io.sockets.clients(roomName));
    });

    socket.on("sendDescription", function(data) {
        data = JSON.parse(data);
        //console.log("SDP", data);

        if (data.isCaller) {
            localRoom.caller.sdp = data.sdp;
        } else {
            localRoom.callee.sdp = data.sdp;
            io.sockets.in(roomName).emit("setInfo", JSON.stringify(data.sdp));
        }
    });

    socket.on("sendCandidate", function(data) {
        data = JSON.parse(data);
        //console.log("ICE", data);
        if (data.isCaller) {
            if (data.candidate)
                localRoom.caller.candidate.push(data.candidate);
        } else {
            if (data.candidate) {
                localRoom.callee.candidate.push(data.candidate);
                io.sockets.in(roomName).emit("setInfo", JSON.stringify([data.candidate]));
            }
        }
    });
});


// now, it's easy to send a message to just the clients in a given room
/*room = "abc123";
io.sockets.in(room).emit('message', 'what is going on, party people?');

// this message will NOT go to the client defined above
io.sockets.in('foobar').emit('message', 'anyone in this room yet?');
*/