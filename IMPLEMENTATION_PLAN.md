# Implementation Plan

## 1. Project Setup

- Create a React + Vite project.
- Install and configure Tailwind CSS.
- Add Supabase JavaScript client configuration using environment variables.
- Set up GitHub as the source repository.
- Keep app code organized around planner, meals, groceries, auth, and Supabase data modules.

## 2. Supabase Schema

- Create Supabase Postgres tables for `dishes`, `ingredients`, `dish_ingredients`, `recipe_steps`, `meal_plan_cells`, and `ingredient_status`.
- Store `servings` on the `dishes` table.
- Add `user_id` to user-owned planner and ingredient status tables.
- Enable Row Level Security so each user can only access their own planner state and grocery ownership state.

## 3. Seed Data

- Seed all dishes from `README.md`.
- Include Paneer Mushroom Broccoli Rice and Jeera Aloo.
- Seed ingredients, dish-to-ingredient relationships, recipe steps, notes, and serving counts.
- Confirm serving counts match the documented 1-serving, 2-serving, and 3-serving groups.

## 4. Auth Gate

- Add Supabase Auth sign-in/sign-out flow.
- Prevent access to the planner until a user is authenticated.
- Load planner state and ingredient ownership state for the authenticated user only.

## 5. Meal Planner Calendar

- Build the 14-day calendar with rows for two weeks and columns for Breakfast, Lunch 1, Lunch 2, and Dinner.
- Make each cell clickable and editable.
- Show selected meals, auto-filled meals, and empty editable cells clearly.

## 6. Meal Selection + Auto-Fill Logic

- Fetch dish data from Supabase, including `dish.servings`.
- When a meal is selected, fill the chosen cell and the next same-slot cells based on `dish.servings`.
- Mark extra cells as auto-filled and link them to the original selected cell.
- Do not hardcode serving counts in frontend logic.

## 7. Grocery List Generation

- Generate grocery items from non-auto-filled cooking events.
- Group ingredients into `WEEK 1`, `WEEK 2`, and `BOTH WEEKS`.
- Display grocery items as `ingredient: {dish 1, dish 2, dish 3}`.

## 8. Ingredient Owned/Missing Toggles

- Render each grocery ingredient as a toggleable card.
- Use red for missing and green for owned.
- Persist owned/missing state to Supabase per authenticated user and week group.

## 9. Glassmorphism Styling

- Use Tailwind for layout, spacing, responsive behaviour, and component styling.
- Apply a dark gradient background, frosted panels, translucent cards, soft shadows, hover states, and smooth transitions.
- Keep the planner dense and usable rather than making it a marketing-style landing page.

## 10. Deployment Notes

- Store Supabase URL and anon key in Vercel environment variables.
- Deploy the React + Vite frontend to Vercel free tier.
- Connect Vercel to the GitHub repository for automatic deployments.
- Confirm Supabase Row Level Security policies work correctly in production.
