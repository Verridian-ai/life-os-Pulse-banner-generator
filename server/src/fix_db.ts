import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Running DB fix...');
    
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "images" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "user_id" text NOT NULL,
                "storage_url" text NOT NULL,
                "file_name" text NOT NULL,
                "prompt" text,
                "model_used" text,
                "quality" text,
                "generation_type" text DEFAULT 'generate',
                "tags" text[],
                "is_favorite" boolean DEFAULT false,
                "file_size_bytes" integer,
                "width" integer,
                "height" integer,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `);
        
        await db.execute(sql`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'images_user_id_users_id_fk') THEN
                    ALTER TABLE "images" 
                    ADD CONSTRAINT "images_user_id_users_id_fk" 
                    FOREIGN KEY ("user_id") 
                    REFERENCES "public"."users"("id") 
                    ON DELETE cascade 
                    ON UPDATE no action;
                END IF;
            END $$;
        `);

        console.log('Images table created successfully.');
    } catch (e) {
        console.error('Error creating table:', e);
    }
    
    process.exit(0);
}

main();
