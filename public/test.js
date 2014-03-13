var socket = io.connect('http://' + location.host);

navigator.getMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
var PeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
var IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
var localVideo = $("#local_video")[0];
var remoteVideo = $("#remote_video")[0];

var pc;
var ice = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
var sdpConstraints = {'mandatory': {
                        'OfferToReceiveAudio':true,
                        'OfferToReceiveVideo':true }
                    };
// run start(true) to initiate a call
function start(isCaller) {
    pc = new PeerConnection(ice);

    // send any ice candidates to the other peer
    pc.onicecandidate = function (evt) {
        socket.emit('sendCandidate', JSON.stringify({ "candidate": evt.candidate, "isCaller": isCaller }));
    };

    // once remote stream arrives, show it in the remote video element
    pc.onaddstream = function (evt) {
        remoteVideo.src = URL.createObjectURL(evt.stream);
    };

    // get the local stream, show it in the local video element and send it
    navigator.getMedia({ "audio": true, "video": true }, function (stream) {
        localVideo.src = URL.createObjectURL(stream);
        pc.addStream(stream);

        if (isCaller) {
            pc.createOffer(gotDescription, onError);
        } else {
            pc.createAnswer(gotDescription, onError);
        }

        function gotDescription(desc) {
            pc.setLocalDescription(desc);
            socket.emit("sendDescription", JSON.stringify({ "sdp": desc, "isCaller": isCaller }));
        }

    }, onError); // Error callback is required by Firefox
}


socket.on('setInfo', function (data) {
    if (!pc)
        start(false);

    var signal = JSON.parse(data);
    if (signal.sdp)
        pc.setRemoteDescription(new SessionDescription(signal.sdp));
    else
        pc.addIceCandidate(new IceCandidate(signal.candidate));
});

$('#create_room').on('click', function() {
    if (!$('#room_name').val()) {
        return;
    }
    socket.emit('createRoom', $('#room_name').val());
    start(true);
    $('#room_management').hide();
    $('#in_room').show();
});

$('#join_room').on('click', function() {
    if (!$('#room_name').val()) {
        return;
    }
    //start(false);
    socket.emit('joinRoom');
    $('#room_management').hide();
    $('#in_room').show();
});

function onError(e) {
    console.log("ERR:", e);
}