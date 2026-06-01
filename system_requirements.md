# System Requirements

## Project Name

Biweekly Meal Planner

---

## Purpose

Build a neat glassmorphism-style web app that helps plan a 2-week meal schedule and automatically generates a grocery list based on selected meals.

The app should persist user data through Supabase Auth and Supabase Postgres instead of browser localStorage.

---

## Preferred Tech Stack

The first prototype used plain HTML, CSS, JavaScript, and localStorage.

For the improved version, use a hosted Supabase backend so meal data, ingredient data, planner state, and grocery ownership states can be edited and preserved reliably across refreshes, devices, and deployments.

Recommended stack:

- Frontend: React + Vite
- Styling: Tailwind CSS using a custom glassmorphism visual layer
- Authentication: Supabase Auth
- Backend/database: Supabase Postgres
- Hosting: Vercel free tier
- Version control: GitHub

Reasoning:

- React + Vite keeps the frontend lightweight and fast to develop.
- Tailwind makes the glassmorphism UI consistent and maintainable.
- Supabase Auth provides the login gate without a custom auth server.
- Supabase Postgres gives durable relational storage for dishes, ingredients, planner cells, and grocery states.
- Vercel can host the frontend on the free tier and connect cleanly to GitHub.
- GitHub remains the source of truth for version control and deployment history.

---

# Core UI Requirements

## Visual Style

The app should use a neat glassmorphism style.

Required visual characteristics:

- Dark gradient background
- Frosted glass panels
- Blurred translucent cards
- Rounded corners
- Soft shadows
- Clean spacing
- Modern dashboard feel
- Hover states
- Smooth transitions

---

## Layout

The main page should contain:

1. Header/title area
2. Biweekly meal calendar
3. Toggleable grocery list panel
4. Meal selection dropdown or modal
5. Ingredient ownership toggle cards

---

# Calendar Requirements

## Calendar Structure

The planner should use a calendar-style layout.

Rows are weekdays across two weeks.

Columns are:

1. Breakfast
2. Lunch 1
3. Lunch 2
4. Dinner

The calendar should cover 14 days total.

Suggested rows:

- Monday Week 1
- Tuesday Week 1
- Wednesday Week 1
- Thursday Week 1
- Friday Week 1
- Saturday Week 1
- Sunday Week 1
- Monday Week 2
- Tuesday Week 2
- Wednesday Week 2
- Thursday Week 2
- Friday Week 2
- Saturday Week 2
- Sunday Week 2

---

## Cell Interaction

Each meal cell should be clickable.

When hovering over a cell:

- A plus sign should appear.
- The cell should visually indicate that it can be edited.

When clicking a cell:

- A dropdown, popover, or modal should appear.
- It should show all available menu items.
- The user should be able to click one menu item to select it for that cell.

---

## Meal Selection Behaviour

When the user selects a meal, the system should fill the selected cell and, depending on serving count, fill the same meal slot for the next sequential weekday cells.

Example:

If the user selects Chicken curry on Monday Week 1 Lunch 1:

- Monday Week 1 Lunch 1 = Chicken curry
- Tuesday Week 1 Lunch 1 = Chicken curry
- Wednesday Week 1 Lunch 1 = Chicken curry

This is because Chicken curry has 3 servings.

The auto-filled cells should be visually distinguishable from the original selected cell.

---

# Serving Rules

Use the following serving logic.

## 2-Serving Meals

These meals last for 2 servings.

Each serving is eaten once per day.

Therefore, selecting one of these meals should fill 2 sequential same-slot cells.

Meals:

- Oats bowl
- Malatang-style ramen
- Tonkotsu ramen
- Kimchi jjigae
- Pad Thai
- Paneer Mushroom Broccoli Rice
- Jeera Aloo

Behaviour:

- Selected day = serving 1
- Next day in the same meal slot = serving 2

---

## 1-Serving Meals

These meals last for 1 serving.

Selecting one of these meals should fill only the selected cell.

Meals:

- Miso soup
- Peanut butter bread with milk

Behaviour:

- Selected day only

---

## 3-Serving Meals

These meals last for 3 servings.

Each serving is eaten once per day.

Therefore, selecting one of these meals should fill 3 sequential same-slot cells.

Meals:

- Beans, kale, potatoes, and dal
- Thai red curry
- Chicken curry
- Chicken biryani
- Rose pasta with minced pork

Behaviour:

- Selected day = serving 1
- Next day in same meal slot = serving 2
- Day after that in same meal slot = serving 3

---

# Grocery List Requirements

## Grocery List Toggle

There should be a toggle button to show or hide the grocery list.

The grocery list should be generated based on the biweekly meal plan.

---

## Grocery List Format

Each ingredient should be displayed in the following format:

```text
ingredient: {for dishes...}
```

Example:

```text
rice: {Chicken curry, Chicken biryani, Thai red curry}
tofu: {Malatang-style ramen, Kimchi jjigae, Miso soup}
```

---

## Grocery Grouping

The grocery list should be grouped into:

1. WEEK 1
2. WEEK 2
3. BOTH WEEKS

The grouping is determined by which week the meals using that ingredient are cooked in.

Rules:

- If an ingredient is only used by meals cooked in Week 1, place it under `WEEK 1`.
- If an ingredient is only used by meals cooked in Week 2, place it under `WEEK 2`.
- If an ingredient is used by meals cooked in both Week 1 and Week 2, place it under `BOTH WEEKS`.

Important:

- Grouping should be based on the original cooking/selection cell, not necessarily every auto-filled leftover cell.
- If a 3-serving meal is cooked in Week 1 and leftovers continue into Week 2, the ingredient should still count as Week 1 unless there is another cooking event in Week 2.
- This makes the grocery list reflect when ingredients need to be bought/cooked, not just when leftovers are eaten.

---

## Ingredient Cards

Each ingredient should appear as a togglable card.

Card states:

- Red = ingredient is missing / needs to be bought
- Green = ingredient is already available / user has it

User should be able to click an ingredient card to toggle between red and green.

The card state should be saved in the database.

---

# Data Persistence Requirements

The app should not rely on localStorage for durable user data.

Use Supabase Auth and Supabase Postgres for persisted application data.

Required saved data:

1. Dishes
2. Ingredients
3. Dish-to-ingredient relationships
4. Dish serving counts
5. Recipe timeline data
6. Calendar meal plan selections
7. Auto-filled meal plan cells
8. Grocery ingredient ownership states
9. User edits to dishes and ingredients, if editing is implemented later

---

# Database Requirements

Use Supabase Postgres for the first hosted version.

Suggested database tables:

## `dishes`

Stores each menu item.

Suggested fields:

- `id`
- `name`
- `servings`
- `description`
- `notes`

---

## `ingredients`

Stores unique ingredients.

Suggested fields:

- `id`
- `name`
- `category`

Possible categories:

- carbs
- protein
- vegetables
- dairy
- sauce
- pantry
- spices
- optional

---

## `dish_ingredients`

Many-to-many table connecting dishes and ingredients.

Suggested fields:

- `id`
- `dish_id`
- `ingredient_id`
- `optional`
- `quantity_note`

---

## `recipe_steps`

Stores recipe timeline steps for each dish.

Suggested fields:

- `id`
- `dish_id`
- `step_number`
- `instruction`

---

## `meal_plan_cells`

Stores the 14-day planner selections for each authenticated user.

Suggested fields:

- `id`
- `user_id`
- `day_index`
- `week_number`
- `weekday`
- `slot`
- `dish_id`
- `is_auto_filled`
- `origin_cell_id`
- `created_at`
- `updated_at`

Allowed slots:

- breakfast
- lunch1
- lunch2
- dinner

---

## `ingredient_status`

Stores whether an ingredient is owned or missing for each authenticated user.

Suggested fields:

- `id`
- `user_id`
- `ingredient_id`
- `week_group`
- `status`

Allowed `week_group` values:

- WEEK 1
- WEEK 2
- BOTH WEEKS

Allowed `status` values:

- owned
- missing

---

# Data Access Requirements

The React frontend should use the Supabase JavaScript client to read and write data.

Required Supabase operations:

## Dish Data

- Read all dishes.
- Read one dish by id.
- Insert, update, or delete dishes if editing is implemented later.

## Ingredient Data

- Read all ingredients.
- Insert, update, or delete ingredients if editing is implemented later.

## Meal Plan

- Read the authenticated user's meal plan cells.
- Save a selected meal and its auto-filled cells.
- Delete a single meal plan cell.
- Clear the authenticated user's whole meal plan.

## Grocery List

- Generate grocery list data from Supabase meal plan and ingredient records.
- Save ingredient owned/missing status changes.

Supabase Row Level Security should ensure each user can access only their own planner state and grocery ownership states.

---

# Meal Plan Logic Requirements

When a user selects a dish for a cell:

1. Save the selected dish in the chosen cell.
2. Look up the dish serving count.
3. Use `dish.servings` to determine auto-fill behaviour.
4. Fill the same meal slot on the next sequential day(s), depending on servings.
5. Mark extra cells as auto-filled.
6. Store the original selected cell as the origin for the auto-filled cells.
7. If a user deletes the original selected cell, delete all linked auto-filled cells.
8. If a user edits an auto-filled cell, decide whether to:
   - prevent direct editing, or
   - allow overriding and detach it from the origin.

Recommended first implementation:

- Allow editing any cell.
- If editing an auto-filled cell, replace that cell and remove only its own content.
- If deleting an original cell, delete all linked leftover cells.

---

# Grocery Generation Logic

The grocery list should be generated dynamically from the meal plan.

Algorithm:

1. Read all non-auto-filled meal plan selections.
2. For each selected dish, get its ingredients.
3. Determine the cooking week from the selected cell.
4. For each ingredient, collect:
   - ingredient name
   - dishes that use it
   - week(s) where it is needed
5. If ingredient appears in both Week 1 and Week 2 cooking events, place it in BOTH WEEKS.
6. If ingredient appears only in Week 1 cooking events, place it in WEEK 1.
7. If ingredient appears only in Week 2 cooking events, place it in WEEK 2.
8. Render each ingredient as:
   - `ingredient: {dish 1, dish 2, dish 3}`

---

# Required Menu Data

The app must include these dishes on initial database seed:

- Oats bowl
- Peanut butter bread with milk
- Chicken curry
- Chicken biryani
- Paneer Mushroom Broccoli Rice
- Jeera Aloo
- Malatang-style ramen
- Tonkotsu ramen
- Rose pasta with minced pork
- Beans, kale, potatoes, and dal
- Thai red curry
- Pad Thai
- Kimchi jjigae
- Miso soup

All dishes, ingredients, and recipe timeline data should be seeded from `README.md`.

---

# Editing Requirements

For the first version, editing can be simple.

Required:

- User can select meals in planner cells.
- User can clear the whole plan.
- User can remove a meal from a cell.
- User can toggle ingredient cards red/green.
- User changes persist after refresh.

Optional future improvements:

- Edit dish names
- Edit ingredient lists
- Add new dishes
- Delete dishes
- Edit serving counts
- Edit recipe steps
- Export grocery list
- Print planner
- Mobile layout improvements

---

# Data Longevity

Expected behaviour:

- Refreshing the browser should keep all changes.
- Closing and reopening the app should keep all changes.
- Signing out and signing back in should keep authenticated user data.
- Redeploying the Vercel frontend should not delete Supabase data.
- The project owner should be able to back up or export Supabase Postgres data.
- The project owner should be able to manually edit seed data in Supabase if needed.

---

# Non-Goals For First Version

Do not implement these yet unless requested:

- Nutrition tracking
- Calorie counting
- Price tracking
- Barcode scanning
- AI recipe generation
- Complex inventory management
- Exact ingredient quantities

---

# Success Criteria

The project is successful if:

1. The user can plan 14 days of meals.
2. The user can select a dish from a dropdown/modal in each meal cell.
3. Meal selections auto-fill future same-slot cells based on serving count.
4. The app generates a grocery list from planned cooking events.
5. Ingredients are grouped into WEEK 1, WEEK 2, and BOTH WEEKS.
6. Ingredients display in the format `ingredient: {for dishes...}`.
7. Each ingredient is shown as a red/green toggle card.
8. Red means missing.
9. Green means already available.
10. All changes persist using Supabase Auth and Supabase Postgres.
11. The UI uses a clean glassmorphism style.

# Additional Architecture Recommendation

Do NOT hardcode serving logic inside planner code.

Store servings in the dishes table.

Planner auto-fill behaviour must use `dish.servings`.

Serving counts must never be hardcoded in frontend logic.

Example:

dishes
-------
id
name
servings
meal_category
description

Planner behaviour:

fillDays = dish.servings;

Benefits:

- Pad Thai can change from 2 servings to 3 servings without code changes.
- Chicken Curry can change from 3 servings to 4 servings without code changes.
- Any future meal automatically inherits planner behaviour from the database.

The planner must always derive auto-fill behaviour from the database value of dish.servings.
