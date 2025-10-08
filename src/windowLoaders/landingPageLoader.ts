import { getSpotifyAccessToken } from "../Spotify/authCodeWithPkce.ts";
import { fetchCountryAlbums } from "../services/spotifyService.ts";

const NUM_ALBUMS = 50; // number of floating album covers
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const floatingContainer = document.getElementById("floatingAlbums")!;

async function initFloatingAlbums() {
    const accessToken = await getSpotifyAccessToken(clientId, clientSecret);
    const albumImages = await fetchCountryAlbums(accessToken, NUM_ALBUMS);

    function randomBetween(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    for (let i = 0; i < NUM_ALBUMS; i++) {
        const img = document.createElement("img");
        img.src = albumImages[Math.floor(Math.random() * albumImages.length)];
        img.className = "floating-album";

        // Random start position (anywhere on the screen)
        const startX = randomBetween(0, window.innerWidth - 60);
        const startY = randomBetween(0, window.innerHeight - 60);
        img.style.left = `${startX}px`;
        img.style.top = `${startY}px`;

        // Random animation duration (slower/faster floats)
        const duration = randomBetween(150, 200);
        img.style.animationDuration = `${duration}s`;

        // Random X/Y float distances for smooth movement
        img.style.setProperty("--float-x", `${randomBetween(-100, 100)}px`);
        img.style.setProperty("--float-y", `${randomBetween(-50, 50)}px`);

        // Random initial animation delay
        img.style.animationDelay = `${randomBetween(0, 1)}s`;

        floatingContainer.appendChild(img);
    }
}

initFloatingAlbums();
