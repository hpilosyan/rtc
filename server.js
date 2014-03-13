var express = require('express'),
    http = require('http'),
    path = require('path');

var app = express();
var server = http.createServer(app);

app.configure(function(){
    app.use(express.static(path.join(__dirname, 'public')));
});

server.listen(Number(process.env.PORT || 7000));

var room = null;
var caller_ice = null;
var caller_sdp = null;
var callee_ice = null;
var callee_sdp = null;

var io = require("socket.io").listen(server);
io.sockets.on("connection", function (socket) {
    socket.on("createRoom", function(room_name) {
        var handle = setInterval(function() {
            console.log("AHA: ", callee_ice, callee_sdp);

            if (callee_ice && callee_sdp) {
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

        /*
        var handle = setInterval(function() {
            console.log(caller_ice, caller_sdp);
            if (caller_ice && caller_sdp) {

                clearInterval(handle);
            }
        }, 500);
        */
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
                caller_ice = data.candidate;
        } else {
            callee_ice = data.candidate;
        }
    });
});