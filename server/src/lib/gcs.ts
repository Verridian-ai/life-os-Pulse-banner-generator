import { Storage } from '@google-cloud/storage';
import { config } from 'dotenv';

config();

// Initialize storage client
// We expect GCS_CREDENTIALS to be a JSON string or we rely on automatic Google Application Credentials
const getStorageClient = () => {
    if (process.env.GCS_CREDENTIALS) {
        try {
            const credentials = JSON.parse(process.env.GCS_CREDENTIALS);
            return new Storage({ credentials });
        } catch (e) {
            console.error('Failed to parse GCS_CREDENTIALS', e);
            // Fallback to default auth or error
            return new Storage();
        }
    }
    return new Storage();
};

const storage = getStorageClient();
const bucketName = process.env.GCS_BUCKET_NAME || 'life-os-user-files';
const bucket = storage.bucket(bucketName);

export const generateUploadSignedUrl = async (
    userId: string,
    fileName: string,
    contentType: string
) => {
    const filePath = `${userId}/${fileName}`;
    const file = bucket.file(filePath);

    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType,
    });

    return { url, filePath };
};

export const generateReadSignedUrl = async (filePath: string) => {
    const file = bucket.file(filePath);

    // Check if file exists first? 
    // For performance, we might skip strictly checking existence if we trust the path,
    // but let's assume valid paths for now.

    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return url;
};

export const deleteFile = async (filePath: string) => {
    await bucket.file(filePath).delete();
};

export const getFileMetadata = async (filePath: string) => {
    const [metadata] = await bucket.file(filePath).getMetadata();
    return metadata;
}

export const uploadFileFromUrl = async (
    userId: string,
    url: string,
    fileName: string,
    contentType: string = 'image/png'
): Promise<{ path: string; size: number }> => {
    const filePath = `${userId}/${fileName}`;
    const file = bucket.file(filePath);

    // Fetch the file from the external URL
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to GCS
    await file.save(buffer, {
        contentType,
        resumable: false // Simple upload for images
    });

    return { path: filePath, size: buffer.length };
};

export const getFileStream = async (filePath: string) => {
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    if (!exists) {
        throw new Error('File not found');
    }

    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'application/octet-stream';
    const stream = file.createReadStream();

    // Convert Node stream to Web Stream for Hono compatibility if needed, 
    // but usually Hono handles Node streams in Node env.
    // For strictly correct types we might need conversion, but 'any' cast in route works.
    return { stream, contentType };
};
