import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Connecting to Supabase at:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // 1. Test Auth / Users API
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Auth check error:', authError.message);
    } else {
      console.log(`✅ Supabase Auth connection successful! Total registered auth users: ${users.users.length}`);
    }

    // 2. Check Storage Buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Storage check error:', bucketsError.message);
    } else {
      console.log(`✅ Supabase Storage connected! Buckets found:`, buckets.map((b) => b.name));

      // Create required buckets if missing
      const requiredBuckets = ['employee-documents', 'profile-photos', 'generated-hr-documents'];
      for (const bucketName of requiredBuckets) {
        if (!buckets.some((b) => b.name === bucketName)) {
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: false,
            fileSizeLimit: 10 * 1024 * 1024,
          });
          if (createError) {
            console.log(`Note creating bucket ${bucketName}:`, createError.message);
          } else {
            console.log(`✅ Created private storage bucket: ${bucketName}`);
          }
        }
      }
    }

    console.log('\n🎉 Supabase live connection verified successfully!');
  } catch (err: any) {
    console.error('Connection error:', err.message);
  }
}

testConnection();
