var webrtc = {};

webrtc.getUserMedia = function(options, successCallback, errorCallback) {
    var getMedia = navigator.getUserMedia ||
                   navigator.webkitGetUserMedia ||
                   navigator.mozGetUserMedia ||
                   navigator.msGetUserMedia;
    getMedia.call(navigator, options, successCallback, errorCallback);
};

webrtc.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;