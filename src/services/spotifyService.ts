
import { refreshAccessToken } from "../Spotify/authCodeWithPkce.ts";
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

export async function fetchProfile(token: string): Promise<UserProfile> {
    console.log('Fetching user profile');
    const result = await fetchWithAuth(
        "https://api.spotify.com/v1/me",
        token,
        clientId
    );
    if (!result.ok) {
        console.error("Profile fetch failed", result.status, result.statusText,  await result.text());
        throw new Error("Failed to fetch profile");
    }
    return await result.json();
}

export async function fetchQueue(token: string): Promise<FullQueue | null> {
    const playbackState = await fetchWithAuth('https://api.spotify.com/v1/me/player', token, clientId);
    if (!playbackState.ok) {
        console.error('No active playback device or session');
        return null;
    } else {
        const result = await fetchWithAuth(
            "https://api.spotify.com/v1/me/player/queue",
            token,
            clientId
        );
        if (!result.ok) {
            console.error("Queue fetch failed", result.status, result.statusText, await result.text());
            throw new Error("Failed to fetch queue");
        }
        return await result.json();
    }
}

// src/fetchAlbums.ts
export async function fetchCountryAlbums(accessToken: string, limit = 20) {
    const url = `https://api.spotify.com/v1/search?q=country&type=album&limit=${limit}`;
    const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${accessToken}` }
    });
    const data = await res.json();

    // Extract album image URLs (small size for background)
    return data.albums.items.map((album: any) => album.images[2]?.url || album.images[0]?.url).filter(Boolean);
}


async function fetchWithAuth(url: string, token: string, clientId: string) {
    let result = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (result.status === 401) { // token expired
        console.warn("Token expired, refreshing...");
        const newToken = await refreshAccessToken(clientId);

        result = await fetch(url, {
            headers: { Authorization: `Bearer ${newToken}` }
        });
    }

    return result;
}

// Example fetchCurrentlyPlaying function
export async function fetchCurrentlyPlaying(token: string): Promise<any> {
    const res = await fetchWithAuth("https://api.spotify.com/v1/me/player/currently-playing", token, clientId);
    if (res.status === 204) return null;  // nothing playing
    return await res.json();
}
