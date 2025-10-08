
import {redirectToAuthCodeFlow, getAccessToken, refreshAccessToken, getCookie, setCookie, deleteCookie} from "./Spotify/authCodeWithPkce.ts";
import {populateProfileImage, populateQueue, startQueuePolling} from "./LoadElements.ts"
import {fetchQueue, fetchProfile} from "./services/spotifyService.ts"
import {
    openPopout,
    toggleFullscreen,
    setupWindowControls,
    initFullscreenButton, setupPartnerDanceButton
} from "./pop-outWindow";


const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const currentlyPlayingSection = document.querySelector(".currentlyPlaying") as HTMLElement;


// ---------------- Main Initialization ----------------
async function init() {
    /*const state = new URLSearchParams(window.location.search).get("state");
    if (state === "fromSpotify=true")  */

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || null;
    const maxRetries = 3;
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (code) {
        try {
            console.log("Exchanging code for new access token...");
            accessToken = await getAccessToken(clientId, code);// ✅ stop here — don’t check stale cookies
        } catch (err) {
            console.error("Code exchange failed, redirecting:", err);
            await redirectToAuthCodeFlow(clientId);
            return;
        }
    }

    // Retrieve tokens from cookies
    const tokenExpiry = Number(getCookie("spotifyTokenExpiryForMyApp") || "0");
    if(!accessToken) accessToken = getCookie("spotifyAccessTokenForMyApp") || null;
    if(!refreshToken) refreshToken = getCookie("spotifyRefreshTokenForMyApp") || null;
    let retries: number = Number(getCookie("spotifyRetries") || "0");

    // I hate you typescript. Only you would infer that the return type 'undefined'
    // would be a string and not actually undefined smh 🤦‍♂️
    if(accessToken == "undefined"){
        accessToken = null;
    }
    if(refreshToken == "undefined"){
        refreshToken = null;
    }

    try {
        // Only retry locally if token missing or expired, up to maxRetries
        if (!accessToken || Date.now() > tokenExpiry) {
            if (refreshToken && retries < maxRetries) {
                try {
                    accessToken = await refreshAccessToken(clientId);
                    setCookie("spotifyAccessToken", accessToken, 1); // persist new access token
                    setCookie("spotifyRetries", "0", 1); // reset retries
                } catch (err) {
                    console.warn("Refresh token failed:", err);
                    deleteCookie("spotifyAccessToken");
                    deleteCookie("spotifyRefreshToken");
                    retries++;
                    setCookie("spotifyRetries", retries.toString(), 1);
                    accessToken = null;
                    refreshToken = null;
                }
            }

            // Try authorization code flow if refresh token fails
            if (!accessToken && code) {
                try {
                    accessToken = await getAccessToken(clientId, code);
                    setCookie("spotifyAccessToken", accessToken, 1);
                    setCookie("spotifyRetries", "0", 1); // reset retries
                } catch (err) {
                    console.warn("Code exchange failed:", err);
                    deleteCookie("spotifyAccessToken");
                    deleteCookie("spotifyRefreshToken");
                    accessToken = null;
                    refreshToken = null;
                }
            }
            // If still no token after retries → single redirect
            if(!accessToken) {
                currentlyPlayingSection.style.display = "none";
                return;
            }
        }
        currentlyPlayingSection.style.display = "flex";
        // Setting up all the Button logic and controls
        setupSiteContentAndButtons();
        // Getting the user profile and image to display
        const profile = await fetchProfile(accessToken);
        populateProfileImage(profile);
        // Fetching the queue
        const fullQueue = await fetchQueue(accessToken);
        if (fullQueue) populateQueue(fullQueue);
        // Starting the constant queue refresh
        startQueuePolling(accessToken);

    } catch (err) {
        console.error("Initialization failed, redirecting:", err);
        await redirectToAuthCodeFlow(clientId);
    }
}

function setupSiteContentAndButtons() {
    // Call this once when the app starts
    setupWindowControls();

    // Hook buttons
    document.getElementById("openPopoutBtn")?.addEventListener("click", openPopout);
    document.getElementById("fullscreenBtn")?.addEventListener("click", toggleFullscreen);
    // Disappearing logic on the fullscreen button
    initFullscreenButton("fullscreenBtn");
    // Partner Dance Button Logic
    setupPartnerDanceButton();
}

init();


