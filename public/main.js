var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");
var startButton = document.getElementById("startButton");

/*


startButton.addEventListener("click", start, false);
*/
var signalingChannel = new SignalingChannel();

var ice = {
    "iceServers": [
        {"url": "stun.l.google.com:19302"}
    ]
};
//var pc = new webrtc.RTCPeerConnection(ice);
var pc;
var constraints = {
    video: true,
    audio: true
};
function getStreamSuccess(stream) {
    pc.addStream(stream);
    localVideo.src = window.URL.createObjectURL(stream);
    pc.createOffer(function(offer) {
        pc.setLocalDescription(offer);
        signalingChannel.send(offer.sdp);
    });

}
function getStreamError(error) {
    console.log("Get media error: ", error);
}

webrtc.getUserMedia (constraints, getStreamSuccess, getStreamError);



signalingChannel.onmessage = function(msg) {
    if (msg.candidate) {
        pc.addIceCandidate(msg.candidate);
    }
};

pc.onaddstream = function (evt) {
    remoteVideo.src = window.URL.createObjectURL(evt.stream);
};

function start() {
    pc = new webrtc.RTCPeerConnection(ice);

    pc.onicecandidate = function(evt) {
        if (evt.candidate) {
            signalingChannel.send(evt.candidate);
        }
        /*
        signalingChannel.send(JSON.stringify({
            'candidate': evt.candidate
        }));
        */
    };

    pc.onnegotiationneeded = function () {
        pc.createOffer(localDescCreated, logError);
    };

    pc.onaddstream = function (evt) {
        remoteView.src = URL.createObjectURL(evt.stream);
    };

  // get a local stream, show it in a self-view and add it to be sent
  navigator.getUserMedia({
    'audio': true,
    'video': true
  }, function (stream) {
    selfView.src = URL.createObjectURL(stream);
    pc.addStream(stream);
  }, logError);
}











var signalingChannel = new SignalingChannel();
  var pc = null;  var ice = {"iceServers": [                {"url": "stun:stunserver.com:12345"},                {"url": "turn:user@turnserver.com", "credential": "pass"}            ]};
  signalingChannel.onmessage = function(msg) {    if (msg.offer) {       pc = new RTCPeerConnection(ice);      pc.setRemoteDescription(msg.offer);
      navigator.getUserMedia({ "audio": true, "video": true },
              gotStream, logError);
    } else if (msg.candidate) {       pc.addIceCandidate(msg.candidate);    }  }
  function gotStream(evt) {    pc.addstream(evt.stream);
    var local_video = document.getElementById('local_video');    local_video.src = window.URL.createObjectURL(evt.stream);
    pc.createAnswer(function(answer) {       pc.setLocalDescription(answer);      signalingChannel.send(answer.sdp);    });  }
  pc.onicecandidate = function(evt) {    if (evt.candidate) {      signalingChannel.send(evt.candidate);    }  }
  pc.onaddstream = function (evt) {    var remote_video = document.getElementById('remote_video');    remote_video.src = window.URL.createObjectURL(evt.stream);  }
  function logError() { ... } </script
