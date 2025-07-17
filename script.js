console.log("JavaScript");
let currentsong = new Audio();
let songs;

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let filename = element.href.split("/songs/")[1];
            songs.push(filename);
        }
    }

    return songs;
}

function playmusic(track) {
    // let audio = new Audio("/songs/" + track);
    currentsong.src = "/songs/" + track
    currentsong.play();

    currentsong.addEventListener("loadedmetadata", () => {
        let duration = formatTime(currentsong.duration);
        document.getElementById("song-duration").textContent = duration;
        document.getElementById("seek-bar").max = Math.floor(currentsong.duration);
    });
}

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
}

async function main() {
    songs = await getSongs();
    console.log("Songs Found:", songs);

    let songUL = document.querySelector(".song-list ul");

    for (const song of songs) {
        songUL.innerHTML += `
        <li class="s-img" data-file="${song}">
            <i class="fa-solid fa-music"></i>
            <div class="info">
                <div>${decodeURIComponent(song.replace(".mp3", ""))}</div>
                <div>Gulrez</div>
            </div>
            <div class="ho">
            <i class="fa-solid fa-play" style="font-size:15px;"></i>
            </div>
        </li>`;
    }

    // Attach click events
    // document.querySelectorAll(".song-list li").forEach(e => {
    //     e.addEventListener("click", () => {
    //         const filename = e.getAttribute("data-file");
    //         console.log("Playing:", filename);
    //         playmusic(filename);
    //     });
    // });

    document.querySelectorAll(".song-list li").forEach(e => {
        e.addEventListener("click", () => {
            const filename = e.getAttribute("data-file");
            console.log("Playing:", filename);

            const title = e.querySelector(".info div")?.textContent.trim() || filename;

            document.getElementById("song-name").textContent = title;

            playmusic(filename);
        });
    });

    pl.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
        }
        else {
            currentsong.pause();
        }
    })

    let playBtn = document.getElementById("pl");

    currentsong.addEventListener("play", () => {
        playBtn.classList.remove("fa-play");
        playBtn.classList.add("fa-pause");
    });

    currentsong.addEventListener("pause", () => {
        playBtn.classList.remove("fa-pause");
        playBtn.classList.add("fa-play");
    });

    currentsong.addEventListener("ended", () => {
        playBtn.classList.remove("fa-pause");
        playBtn.classList.add("fa-play");
    });

    let seekBar = document.getElementById("seek-bar");

    currentsong.addEventListener("timeupdate", () => {
        seekBar.value = currentsong.currentTime;
    });

    seekBar.addEventListener("input", () => {
        currentsong.currentTime = seekBar.value;
    });

    pre.addEventListener("click", () => {
        console.log("hi");

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            const prevSong = songs[index - 1];
            const li = document.querySelector(`li[data-file="${prevSong}"]`);
            document.getElementById("song-name").textContent = li.querySelector(".info div").textContent;
            playmusic(prevSong);
        }
    })

    next.addEventListener("click", () => {
        console.log("hi");

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) <= songs.length) {
            const nextSong = songs[index + 1];
            const li = document.querySelector(`li[data-file="${nextSong}"]`);
            document.getElementById("song-name").textContent = li.querySelector(".info div").textContent;
            playmusic(nextSong);
        }
    })

}

main();
