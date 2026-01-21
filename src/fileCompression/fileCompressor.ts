import imageCompression from "browser-image-compression";

const BG_IMG_STORAGE_KEY = "customBackgroundImage";

export async function compressAndStore(file: File) {
    const options = {
        maxSizeMB: 1,      // desired max size in MB
        useWebWorker: true // run in a worker
    };

    try {
        const compressedFile = await imageCompression(file, options);

        // Convert compressedFile to Base64 if you need to store it
        const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile);

        localStorage.setItem(BG_IMG_STORAGE_KEY, dataUrl);

    } catch (error) {
        console.error("Compression failed:", error);
    }
}