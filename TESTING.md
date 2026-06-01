# Testing Checklist

Use this before deployment and after every production release.

## Manual Local Testing

- Run `npm install`.
- Copy `.env.example` to `.env`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Run `npm run dev`.
- Open the local Vite URL.
- Confirm `/` redirects to `/planner`.
- Confirm logged-out access to `/planner` redirects to `/login`.
- Sign in with a manually created Supabase user.
- Confirm `/planner` loads after sign-in.
- Click `Refresh data` and confirm planner, dishes, grocery relationships, and ingredient statuses reload without errors.
- Select a meal in an empty cell and confirm it saves.
- Select a multi-serving meal and confirm future same-slot cells are auto-filled.
- Select a 3-serving meal near the end of Week 2 and confirm it fills only available remaining days.
- Replace an original cooking cell and confirm its old leftovers are removed.
- Replace a leftover cell and confirm the previous meal group is removed safely.
- Remove a meal group from the modal and confirm original and leftover cells disappear.
- Click `Clear full plan`, cancel confirmation, and confirm the plan remains.
- Click `Clear full plan`, accept confirmation, and confirm all planner cells are removed.
- Refresh the browser and confirm saved planner data persists.
- Sign out and confirm `/planner` is inaccessible.

## Grocery Testing

- Add Week 1 meals and open the grocery list.
- Confirm grocery items appear under `WEEK 1`.
- Add Week 2 meals using different ingredients and confirm those items appear under `WEEK 2`.
- Add Week 2 meals sharing ingredients with Week 1 and confirm shared ingredients move to `BOTH WEEKS`.
- Confirm leftover cells do not independently add grocery ingredients.
- Confirm each grocery row uses `ingredient: {dish 1, dish 2, dish 3}` format.
- Confirm ingredients are not duplicated inside a group.
- Toggle a missing ingredient to owned and confirm the card turns green.
- Toggle an owned ingredient to missing and confirm the card turns red.
- Refresh the browser and confirm ingredient statuses persist.
- Confirm `WEEK 1`, `WEEK 2`, and `BOTH WEEKS` statuses are independent.

## Supabase Setup Verification

- Run `supabase/schema.sql` in the Supabase SQL editor.
- Run `supabase/seed.sql` in the Supabase SQL editor.
- Confirm these tables exist:
  - `dishes`
  - `ingredients`
  - `dish_ingredients`
  - `recipe_steps`
  - `meal_plan_cells`
  - `ingredient_status`
- Confirm `dishes.servings` is populated.
- Confirm `meal_plan_cells.user_id` exists and is required.
- Confirm `ingredient_status.user_id` exists and is required.
- Confirm Row Level Security is enabled on `meal_plan_cells`.
- Confirm Row Level Security is enabled on `ingredient_status`.
- Confirm policies enforce `auth.uid() = user_id` for user-owned planner and ingredient status data.
- Confirm public signups are disabled if the app should stay private.
- Confirm the private user can sign in with email/password.

## Deployment Verification

- Confirm `.env` and `.env.local` are not committed.
- Confirm Vercel has `VITE_SUPABASE_URL`.
- Confirm Vercel has `VITE_SUPABASE_ANON_KEY`.
- Confirm Vercel does not have the Supabase service role key.
- Confirm Vercel build command is `npm run build`.
- Confirm Vercel output directory is `dist`.
- Deploy from GitHub to Vercel.
- Open the production URL.
- Confirm direct navigation to `/login` works.
- Confirm direct navigation to `/planner` works and redirects to `/login` when signed out.
- Sign in and confirm planner data loads.
- Add a meal, refresh production, and confirm it persists.
- Toggle a grocery ingredient, refresh production, and confirm it persists.

## Mobile Testing

- Test on a narrow viewport or phone.
- Confirm login inputs and button are easy to tap.
- Confirm planner action buttons remain usable.
- Confirm the calendar scrolls horizontally.
- Confirm meal cells remain readable while horizontally scrolling.
- Confirm the meal selection modal fits within the viewport and scrolls internally.
- Confirm grocery cards stack cleanly.
- Confirm ingredient cards are easy to tap.
- Confirm clear-plan confirmation appears and does not break layout.
