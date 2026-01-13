
import { Storage } from '@google-cloud/storage';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env from root .env.local (since we are in server/scripts, root is ../../)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../.env.local');

config({ path: rootEnvPath });

const uploadAssets = async () => {
    console.log('🚀 Starting 3D Asset Upload...');

    // Auth
    let storage;
    if (process.env.GCS_CREDENTIALS) {
        try {
            const credentials = JSON.parse(process.env.GCS_CREDENTIALS);
            storage = new Storage({ credentials });
        } catch (e) {
            console.error('❌ Failed to parse GCS_CREDENTIALS', e);
            process.exit(1);
        }
    } else {
        console.warn('⚠️ No GCS_CREDENTIALS found, trying default application credentials...');
        storage = new Storage();
    }

    const bucketName = process.env.GCS_BUCKET_NAME || 'life-os-user-files';
    const bucket = storage.bucket(bucketName);
    console.log(`📂 Target Bucket: ${bucketName}`);

    const assetsDir = path.resolve(__dirname, '../../docs/design/assets');
    const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.png'));

    console.log(`found ${files.length} files to upload.`);

    for (const file of files) {
        const localPath = path.join(assetsDir, file);
        const destination = `assets/social_3d/${file}`; // Organized folder

        console.log(`Uploading ${file} -> ${destination}...`);

        try {
            await bucket.upload(localPath, {
                destination,
                // public: true, // Removed due to Uniform Bucket-Level Access
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                },
            });

            const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
            console.log(`✅ Uploaded: ${publicUrl}`);
        } catch (error) {
            console.error(`❌ Failed to upload ${file}:`, error);
        }
    }
};

uploadAssets().catch(console.error);
