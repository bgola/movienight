let video = document.getElementById("video");
let videoContainer = document.getElementById("videoContainer");
let ws;
let reactions = {
    "l": "love",
    "a": "angry",
    "w": "wow",
    "h": "haha",
    "s": "sad",
    "m": "meh",
    "r": "rolleyes",
    "q": "question-mark"
};


function connect() {
    if (location.protocol === 'https:') {
        ws = new WebSocket("wss://bgo.la:5678/");
    } else {
        ws = new WebSocket("ws://localhost:5678/");
    }

    ws.onmessage = function (event) {
        console.log("Received event: " + event.data);
        if (event.data == "play") {
            disableEvents();
            video.play();
            enableEvents();
        } else if (event.data == "pause") {
            disableEvents();
            video.pause();
            enableEvents();
        } else if (event.data == "nocontrols") {
            video.removeAttribute("controls");
        } else if (event.data.startsWith("number")) {
            var number = event.data.split(":")[1];
            var el = document.getElementById("number");
            el.textContent = number
        } else if (event.data == "controls") {
            video.setAttribute("controls", "");
        } else if (event.data.startsWith("seeked")) {
            disableEvents();
            var time = parseFloat(event.data.split(":")[1])
            if (Math.abs(video.currentTime - time) > 2) {
            video.currentTime = time;
                video.play();
            }
            enableEvents();
        } else if (reactions[event.data] != null) {
            add_reaction(reactions[event.data]);
        };
    };  

    ws.onclose = function(e) {
        setTimeout(function() {
          connect();
        }, 1000);
    };

    ws.onerror = function(err) {
        //console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws.close();
    };
};

connect();

let isFullscreen = false;
function gofullscreen() {
  var elem = videoContainer;
  if (isFullscreen) {
      if (elem.exitFullscreen) {
        elem.exitFullscreen();
      } else if (elem.mozCancelFullScreen) { /* Firefox */
        elem.mozCancelFullScreen();
      } else if (elem.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitExitFullscreen();
      } else if (elem.msExitFullscreen) { /* IE/Edge */
        elem.msExitFullscreen();
      }
  } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
  }
}

function fullscreenChange() {
    if (isFullscreen) {
        isFullscreen = false;
        btFullscreen.style['visibility'] = "visible";
        videoContainer.style.height = "90%";
    } else {
        isFullscreen = true;
        btFullscreen.style['visibility'] = "hidden";
        videoContainer.style.height = "100%";
    }
};

document.addEventListener("fullscreenchange", fullscreenChange);
document.addEventListener("mozfullscreenchange", fullscreenChange);
document.addEventListener("webkitfullscreenchange", fullscreenChange);
document.addEventListener("msfullscreenchange", fullscreenChange);

function disableEvents(seeked) {
    if (seeked)
		video.onseeked = function () {};
    video.onpause = function() {};
    video.onplay = function() {};
};

function enableEvents() {
    setTimeout(function() {
        video.onplay = function(e) {
            ws.send("play");
        };

        video.onpause = function() {
            ws.send("pause");
        };

        video.onseeked = function () {
            ws.send("seeked:"+ video.currentTime);
            enableEvents();
        };

        video.onseeking = function () {
            disableEvents(false);
        };
    }, 500);
};

let btHD = document.getElementById("btHD");
let btLD = document.getElementById("btLD");
let btCHD = document.getElementById("btCHD");
let btCLD = document.getElementById("btCLD");

add_source = function (video_file) {
    result = function () {
        btHD.remove();
        btLD.remove();
	btCHD.remove();
	btCLD.remove();
        videoContainer.style.visibility = "visible";
        var info = document.getElementById("info");
        info.style.visibility = "visible";
        var source = document.createElement("source");
        source.setAttribute("src", video_file);
        video.appendChild(source);
    };
    return result;
};

btHD.onclick = add_source("video.mp4"); //mp4");
btLD.onclick = add_source("video_low.mp4");
btCHD.onclick = add_source("celebrity.mp4");
btCLD.onclick = add_source("celebrity_low.mp4");

let btFullscreen = document.getElementById("btFullscreen");
btFullscreen.onclick = gofullscreen;

// animations

document.onkeydown = function(e) {
    e.preventDefault();
    if (reactions[e.key] != null) {
        notify_reaction(e.key);
    };
};

function notify_reaction(reaction_key) {
    add_reaction(reactions[reaction_key]);
    ws.send(reaction_key);
};

function add_reaction(reaction) {
    var img = document.createElement("img");
    img.setAttribute("src", "imgs/" + reaction + ".png");
    img.setAttribute("class", "reaction");
    img.setAttribute("width", 64);
    img.style.right = (4 + Math.random() * 3) + "%";
    videoContainer.appendChild(img);
    setTimeout(function() { 
        img.remove();
    }, 3000);
    return img;
};

enableEvents();
