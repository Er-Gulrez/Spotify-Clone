console.log("JavaScript");

let currentsong = new Audio();
let songs;
let currfolder;

// Get all songs from a folder
async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let filename = element.href.split(`/${folder}/`)[1];
            songs.push(filename);
        }
    }

    return songs;
}

// Play music
function playmusic(track) {
    currentsong.src = `/${currfolder}/` + track;
    currentsong.play();

    currentsong.addEventListener("loadedmetadata", () => {
        let duration = formatTime(currentsong.duration);
        document.getElementById("song-duration").textContent = duration;
        document.getElementById("seek-bar").max = Math.floor(currentsong.duration);
    });
}

// Format time as MM:SS
function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
}

// Render song list to the UI
function renderSongs(songArray) {
    let songUL = document.querySelector(".song-list ul");
    songUL.innerHTML = "";

    for (const song of songArray) {
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

    document.querySelectorAll(".song-list li").forEach(e => {
        e.addEventListener("click", () => {
            const filename = e.getAttribute("data-file");
            const title = e.querySelector(".info div")?.textContent.trim() || filename;
            document.getElementById("song-name").textContent = title;
            playmusic(filename);
        });
    });
}

// Display available albums by scanning folders
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".card-contaner");
    cardContainer.innerHTML = "";

    let isFirstAlbum = true;

    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs/")) {
            let folder = e.getAttribute("href").replace(/\/$/, "").split("/").filter(Boolean).pop();

            try {
                let res = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                if (res.ok) {
                    let json = await res.json();

                    // create card
                    let card = document.createElement("div");
                    card.className = "card";
                    card.dataset.folder = folder;
                    card.innerHTML = `
                        <div class="play">
                            <i class="fa-solid fa-play"></i>
                        </div>
                        <img src="/songs/${folder}/${json.cover}" alt="">
                        <h2>${json.title}</h2>
                        <p>${json.description}</p>
                    `;

                    // Add click functionality
                    card.addEventListener("click", async () => {
                        songs = await getSongs(`songs/${folder}`);
                        renderSongs(songs);
                    });

                    cardContainer.appendChild(card);

                    // Load the first album automatically
                    if (isFirstAlbum) {
                        songs = await getSongs(`songs/${folder}`);
                        renderSongs(songs);
                        isFirstAlbum = false;
                    }
                }
            } catch (error) {
                console.error(`Error with folder ${folder}:`, error);
            }
        }
    });
}

// Main app logic
async function main() {
    songs = await getSongs("songs/");
    console.log("Songs Found:", songs);
    // renderSongs(songs);
    displayAlbums();

    let playBtn = document.getElementById("pl");

    playBtn.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
        } else {
            currentsong.pause();
        }
    });

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

    document.getElementById("pre").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            const prevSong = songs[index - 1];
            const li = document.querySelector(`li[data-file="${prevSong}"]`);
            document.getElementById("song-name").textContent = li.querySelector(".info div").textContent;
            playmusic(prevSong);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            const nextSong = songs[index + 1];
            const li = document.querySelector(`li[data-file="${nextSong}"]`);
            document.getElementById("song-name").textContent = li.querySelector(".info div").textContent;
            playmusic(nextSong);
        }
    });

    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            console.log("Songs Loaded from Folder:", songs);
            renderSongs(songs);
        });
    });
}

main();
