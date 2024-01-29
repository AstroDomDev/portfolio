var pc = null;

function negotiate() {
    console.log('Negotiating...');
    return pc.createOffer().then(function (offer) {
        console.log('Created offer');
        return pc.setLocalDescription(offer);
    }).then(function () {
        return new Promise(function (resolve) {
            if (pc.iceGatheringState === 'complete') {
                console.log('ICE gathering state complete');
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        console.log('ICE gathering state complete');
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function () {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 200) {
                    var desc = new RTCSessionDescription(JSON.parse(xhr.responseText));
                    pc.setRemoteDescription(desc).then(
                        function () { 
                            console.log('Set remote description');
                            resolve(); 
                        }
                    ).catch(function (e) { reject(e); });
                } else {
                    reject(new Error(xhr.statusText));
                }
            }
            xhr.onerror = function () { reject(new Error(xhr.statusText)); }
            xhr.open('POST', '/offer');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({ sdp: pc.localDescription.sdp, type: pc.localDescription.type }));
        });
    });
}

function start() {
    console.log('Starting...');
    var config = { 
        sdpSemantics: 'unified-plan',
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
    };

    pc = new RTCPeerConnection(config);

    pc.addEventListener('track', function (evt) {
        console.log('Received track');
        document.getElementById('video').srcObject = evt.streams[0] || new MediaStream([evt.track]);
        waitForTrack(evt.track, evt.streams[0]);
    });

    pc.onicecandidate = function (event) {
        if (event.candidate) {
            console.log('Received ICE candidate');
            var candidate = event.candidate;
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 500) {
                    alert("Server Error: " + xhr.responseText); 
                }
            }
            xhr.onerror = function () { 
                alert("Request Error"); 
            }
            xhr.open('POST', '/candidate');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({ 'candidate': candidate }));
        }
    }

    document.getElementById('start').style.display = 'none';
    document.getElementById('stop').style.display = 'inline-block';
    negotiate();
}

function stop() {
    console.log('Stopping...');
    document.getElementById('start').style.display = 'inline-block';
    document.getElementById('stop').style.display = 'none';
    document.getElementById('video').srcObject.getTracks().forEach(track => track.stop());
    pc.close();
    pc = null;
}

if (pc) {
    pc.onicecandidate = function (event) {
        if (event.candidate) {
            console.log('Received ICE candidate');
            var candidate = event.candidate;
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 500) {
                    alert("Server Error: " + xhr.responseText); 
                }
            }
            xhr.onerror = function () { 
                alert("Request Error"); 
            }
            xhr.open('POST', '/candidate');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({ 'candidate': candidate }));
        }
    }
}