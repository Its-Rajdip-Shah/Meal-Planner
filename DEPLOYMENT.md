# Deployment Guide

This app is designed for the free-tier path:

- GitHub for source control
- Supabase free tier for Auth and Postgres
- Vercel free tier for hosting

## 1. Create a Supabase Project

1. Go to Supabase and create a new project.
2. Choose an organization, project name, database password, and region.
3. Wait for the project to finish provisioning.

## 2. Run the Database Schema

1. Open the Supabase project.
2. Go to SQL Editor.
3. Open `supabase/schema.sql` from this repo.
4. Paste the full contents into the SQL editor.
5. Run the SQL.

This creates the app tables and Row Level Security policies.

## 3. Run the Seed Data

1. In Supabase SQL Editor, create a new query.
2. Open `supabase/seed.sql` from this repo.
3. Paste the full contents into the SQL editor.
4. Run the SQL.

This inserts dishes, ingredients, dish relationships, recipe notes, serving counts, and recipe steps.

## 4. Create the Private User Manually

1. In Supabase, go to Authentication.
2. Open Users.
3. Click Add user.
4. Enter the email and password for the private planner account.
5. Confirm the user if Supabase prompts for confirmation.

## 5. Disable Public Signups

To keep the app private-ready:

1. Go to Authentication.
2. Open Providers.
3. Open Email.
4. Disable public email signups or new user signups if the setting is available.
5. Keep email/password login enabled so manually created users can sign in.

Supabase settings can change over time. The goal is that only users you create manually can access the app.

## 6. Get Supabase Environment Variables

In Supabase:

1. Go to Project Settings.
2. Open API.
3. Copy the Project URL.
4. Copy the anon public API key.

Use these values:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

## 7. Add Environment Variables in Vercel

1. Open Vercel.
2. Import or open the Meal Planner project.
3. Go to Settings.
4. Open Environment Variables.
5. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Apply them to Production, Preview, and Development unless you intentionally want different Supabase projects per environment.

Do not add the Supabase service role key to Vercel.

## 8. Connect GitHub to Vercel

1. Push this repo to GitHub.
2. Open Vercel.
3. Click Add New Project.
4. Import the GitHub repo.
5. Vercel should detect Vite automatically.

Expected Vercel settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## 9. Deploy

1. Confirm environment variables are set.
2. Click Deploy.
3. After deployment, open the Vercel URL.
4. Sign in with the manually created Supabase user.
5. Confirm `/planner` is blocked when signed out and available after login.

## 10. After Deployment

- Test adding meals.
- Refresh the page and confirm planner data persists.
- Toggle grocery ingredient states and confirm they persist.
- Sign out and confirm `/planner` redirects to `/login`.
