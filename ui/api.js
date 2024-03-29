const port = 8080;
const ip = 'localhost:' + port;

// const remote = 'http://raspberrypi.local:8080';
// const remote = 'http://' + ip;
const remote = '';

let socket;

function initStream() {

    let camera1 = document.getElementById('camera1');

    let streamSocket = io(remote + '/camera1');

    streamSocket.on('connect', function() {

        log('camera1 connect');
    });

    streamSocket.on('disconnect', function() {

        log('camera1 disconnect');
    });

    streamSocket.on('data', function(data) {

        const bytes = new Uint8Array(data);
        camera1.src = 'data:image/jpeg;base64,' + base64ArrayBuffer(bytes);
    });
}

function initSocket() {

    socket = io(remote, {'forceNew': true});

    socket.on('connect', function() {
        console.log('connect');
        log('connect');
    });

    socket.on('disconnect', function(){
        console.log('disconnect');
        gpioState = {};
        renderGPIO();
        log('disconnect');
    });

    socket.on('state', (state) => {
        gpioState = JSON.parse(state);
        renderGPIO();
    });

    socket.on('log', (text) => {
        console.log(text);
        log(text);
    });

    socket.on('time', (time) => {

        console.log(time);

        // log(time);

        $('#current').text(fromSec(time));

        if (time > 0)
            $('#logo').addClass('rotating');

        else if (time === 0)
            $('#logo').removeClass('rotating');
    });

    socket.on('total', (total) => {
        $('#current').text('0:00');
        $('#total').text(fromSec(total));
    });
}

function switchPIN(id) {
    socket.emit('switch', id);
}

function startGame() {
    socket.emit('start', null);
}

function resetGame() {
    socket.emit('reset', null);
}

function addTime() {
    socket.emit('add', toSec($('#addTimeField').text()));
}

function setTime() {
    socket.emit('set', toSec($('#setTimeField').text()));
}

function button(id) {
    socket.emit('button', id);
}


function base64ArrayBuffer(arrayBuffer) {

    var base64    = '';
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var bytes         = new Uint8Array(arrayBuffer);
    var byteLength    = bytes.byteLength;
    var byteRemainder = byteLength % 3;
    var mainLength    = byteLength - byteRemainder;
    var a, b, c, d;
    var chunk;
    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63;               // 63       = 2^6 - 1
        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }
    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];
        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
        // Set the 4 least significant bits to zero
        b = (chunk & 3)   << 4; // 3   = 2^2 - 1
        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4
        // Set the 2 least significant bits to zero
        c = (chunk & 15)    <<  2; // 15    = 2^4 - 1
        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }
    return base64;
}