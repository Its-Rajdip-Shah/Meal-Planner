# Security Checklist

Use this checklist before deploying to Vercel.

## Auth

- Public signups must be disabled in Supabase if the app is intended to be private.
- Create allowed users manually in Supabase Authentication.
- Only authenticated users should access `/planner`.
- Do not add fake auth or bypass Supabase Auth in the frontend.

## Supabase Keys

- `VITE_SUPABASE_ANON_KEY` is safe to expose only when Row Level Security policies are correct.
- Never expose the Supabase service role key in frontend code, Vercel client env vars, GitHub, or `.env` files.
- Use only:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Row Level Security

- RLS must be enabled on user-specific tables.
- `meal_plan_cells` must enforce `auth.uid() = user_id` for select, insert, update, and delete.
- `ingredient_status` must enforce `auth.uid() = user_id` for select, insert, update, and delete.
- Public seed tables such as `dishes`, `ingredients`, `dish_ingredients`, and `recipe_steps` may be readable to authenticated users.
- Do not allow anonymous users to read or write planner data.

## User Ownership

- `meal_plan_cells.user_id` must exist and be required.
- `ingredient_status.user_id` must exist and be required.
- Frontend writes to planner and ingredient status tables must include the logged-in user's id.
- Frontend reads from planner and ingredient status tables must filter by the logged-in user's id.

## Environment Files

- Never commit `.env`.
- Never commit `.env.local`.
- `.gitignore` must include:
  - `node_modules`
  - `dist`
  - `.env`
  - `.env.local`

## Vercel

- Confirm Vercel has `VITE_SUPABASE_URL`.
- Confirm Vercel has `VITE_SUPABASE_ANON_KEY`.
- Confirm Vercel does not have the Supabase service role key.
- Redeploy after changing environment variables.

## Pre-Launch Test

- Signed-out users should be redirected from `/planner` to `/login`.
- Signed-in users should be able to load `/planner`.
- One user's planner rows should not be visible to another user.
- Grocery ingredient status should persist after refresh.
