import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import imageCompression from "browser-image-compression";

/**
 * Compresses an image file, converts it to WebP format, and uploads it to Firebase Storage.
 * @param file The original image File object from an input.
 * @param siteId The active site ID (for organization/multi-tenancy grouping).
 * @param folder Optional subfolder inside the site's storage directory (e.g. 'marketplace').
 * @returns A Promise that resolves to the download URL of the uploaded image.
 */
export async function uploadAndOptimizeImage(file: File, siteId: string, folder: string = 'general'): Promise<string> {
    if (!file) throw new Error("No file provided");
    if (!file.type.startsWith('image/')) throw new Error("File is not an image");

    const options = {
        maxSizeMB: 1, // Target max size
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: 'image/webp' // Convert to WebP
    };

    try {
        // Compress the image
        const compressedFile = await imageCompression(file, options);

        // Generate a unique filename
        const uuid = crypto.randomUUID();
        const filename = `${uuid}.webp`;

        // Define Firebase Storage path
        const storageRef = ref(storage, `images/${siteId}/${folder}/${filename}`);

        // Upload the compressed file
        const snapshot = await uploadBytes(storageRef, compressedFile);

        // Return the public download URL
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;

    } catch (error) {
        console.error("Error optimizing/uploading image:", error);
        throw error;
    }
}
