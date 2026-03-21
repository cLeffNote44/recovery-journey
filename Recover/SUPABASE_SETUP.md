# Supabase Cloud Sync Setup Guide

This guide explains how to set up Supabase for cloud backup and sync functionality in the Recover app.

## Overview

The app uses Supabase Storage to provide secure cloud backup and cross-device synchronization with:
- End-to-end encryption (AES-GCM 256-bit)
- User ID-based authentication (no email required)
- Multi-device sync
- Automatic and manual backups
- Backup history management

## Prerequisites

- A Supabase account (free tier works fine)
- Node.js and npm installed
- The Recover app cloned and dependencies installed

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization (or create one)
4. Enter project details:
   - **Name**: `recover-app` (or any name you prefer)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be set up

## Step 2: Create Storage Bucket

1. In your Supabase project dashboard, click **Storage** in the left sidebar
2. Click **New Bucket**
3. Enter bucket details:
   - **Name**: `recover-backups` (must match BACKUP_BUCKET in src/lib/supabase.ts)
   - **Public**: Leave unchecked (private bucket)
   - **File size limit**: 50MB (default is fine)
   - **Allowed MIME types**: Leave empty (allows all types)
4. Click **Create bucket**

## Step 3: Configure Storage Policies

To allow users to access their own backups, you need to set up Row Level Security (RLS) policies.

### 3.1 Enable RLS

The bucket should have RLS enabled by default. If not:
1. Click on the `recover-backups` bucket
2. Click **Policies**
3. Ensure RLS is enabled

### 3.2 Create Access Policies

You have two options for access control:

#### Option A: Public Access (Simpler, less secure)

This allows anyone to read/write to the bucket. Only use this for development/testing.

1. Click **New Policy** → **Create a policy**
2. **Insert Policy**:
   ```sql
   CREATE POLICY "Allow all users to insert"
   ON storage.objects FOR INSERT
   TO public
   WITH CHECK (bucket_id = 'recover-backups');
   ```

3. **Select Policy**:
   ```sql
   CREATE POLICY "Allow all users to read"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'recover-backups');
   ```

4. **Update Policy**:
   ```sql
   CREATE POLICY "Allow all users to update"
   ON storage.objects FOR UPDATE
   TO public
   USING (bucket_id = 'recover-backups');
   ```

5. **Delete Policy**:
   ```sql
   CREATE POLICY "Allow all users to delete"
   ON storage.objects FOR DELETE
   TO public
   USING (bucket_id = 'recover-backups');
   ```

#### Option B: User-Specific Access (More Secure - Recommended)

This requires implementing Supabase authentication. For now, use Option A and upgrade later.

## Step 4: Get API Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** under Project Settings
3. Copy the following values:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string starting with eyJ)

## Step 5: Configure Environment Variables

1. Open your project directory in a terminal
2. Navigate to the `source` folder:
   ```bash
   cd source
   ```

3. Open the `.env` file (created during installation)
4. Replace the placeholder values with your Supabase credentials:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. Save the file

**Important**:
- Never commit the `.env` file to version control
- The `.env.example` file is safe to commit (it contains placeholders)
- The anon key is safe to use in client-side code

## Step 6: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser (usually `http://localhost:5173`)

3. Navigate to **Settings** → **Cloud Sync & Backup**

4. Test the cloud sync:
   - Enter a **User ID** (e.g., `user123`)
   - Enter a **Password** for encryption
   - Click **Create Backup**
   - You should see a success message

5. Verify in Supabase:
   - Go to **Storage** in your Supabase dashboard
   - Click on `recover-backups` bucket
   - You should see a folder named after your User ID
   - Inside should be backup files and a metadata file

## Step 7: Test Multi-Device Sync

1. Open the app in a second browser (or incognito/private window)
2. Navigate to **Settings** → **Cloud Sync & Backup**
3. Enter the **same User ID** and **password** you used before
4. Click **Sync Now**
5. Your data should be downloaded from the cloud

## Troubleshooting

### "Failed to upload backup"

1. Check your `.env` file has the correct credentials
2. Verify the bucket name is exactly `recover-backups`
3. Check Storage policies are configured correctly
4. Look in the browser console (F12) for detailed error messages

### "Backup not found" when syncing

1. Make sure you're using the exact same User ID
2. Check that a backup exists in the Supabase Storage dashboard
3. Verify you're using the correct password (encryption key)

### Environment variables not loading

1. Make sure the file is named `.env` (not `.env.txt`)
2. Restart the development server after changing `.env`
3. Check that variables start with `VITE_` (required by Vite)

### Build errors with Supabase

1. Make sure `@supabase/supabase-js` is installed:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Security Considerations

### Current Implementation (User ID + Password)

- **Encryption**: All data is encrypted client-side before upload
- **Password**: Used as encryption key, never sent to server
- **User ID**: Acts as a namespace for backups
- **Weakness**: Anyone who knows a User ID can see the encrypted files (but can't decrypt without password)

### Recommendations for Production

1. **Implement Supabase Auth**:
   - Use email/password or magic link authentication
   - Update storage policies to user `auth.uid()`
   - See [Supabase Auth docs](https://supabase.com/docs/guides/auth)

2. **Use RLS Policies**:
   ```sql
   CREATE POLICY "Users can only access their own files"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'recover-backups' AND (storage.foldername(name))[1] = auth.uid()::text);
   ```

3. **Add Rate Limiting**: Prevent abuse by limiting backup frequency

4. **Monitor Usage**: Check Supabase dashboard for unusual activity

## Cost Considerations

Supabase Free Tier includes:
- 500 MB database space
- 1 GB file storage
- 50 GB bandwidth per month
- Pauses after 1 week of inactivity

For this app:
- Average backup size: ~50-500 KB per user
- Free tier supports: ~2,000-10,000 backups
- More than enough for moderate usage

If you exceed free tier limits, Supabase Pro is $25/month.

## Backup to Local Storage Fallback

If Supabase is not configured (missing `.env` credentials), the app automatically falls back to localStorage simulation mode:
- Backups are stored in browser localStorage
- No cross-device sync
- Data is device-specific
- Works offline

This is useful for:
- Development without Supabase
- Users who don't want cloud sync
- Testing encryption locally

## Next Steps

Now that Supabase is configured, you can:

1. **Test thoroughly**: Try different User IDs, passwords, multiple devices
2. **Add authentication**: Implement proper Supabase Auth (recommended)
3. **Add UI indicators**: Show whether cloud sync is active or using fallback
4. **Implement conflict resolution**: Better handling of simultaneous edits
5. **Add backup versioning**: Keep multiple versions of backups

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## Support

If you encounter issues:

1. Check the browser console for errors (F12 → Console tab)
2. Check Supabase project logs (Logs → All logs)
3. Verify your `.env` file is configured correctly
4. Review the Storage policies in Supabase dashboard
5. Check that the bucket name matches exactly

For code-specific issues, check:
- `source/src/lib/supabase.ts` - Supabase client configuration
- `source/src/lib/cloud-sync.ts` - Cloud sync implementation
- `source/src/components/app/CloudSyncPanel.tsx` - UI implementation
