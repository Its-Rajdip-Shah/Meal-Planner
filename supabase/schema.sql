create extension if not exists pgcrypto;

create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  servings integer not null check (servings > 0),
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (
    category in ('carbs', 'protein', 'vegetables', 'dairy', 'sauce', 'pantry', 'spices', 'optional')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dish_ingredients (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  optional boolean not null default false,
  quantity_note text,
  unique (dish_id, ingredient_id)
);

create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  dish_id uuid not null references public.dishes(id) on delete cascade,
  step_number integer not null check (step_number > 0),
  instruction text not null,
  unique (dish_id, step_number)
);

create table if not exists public.meal_plan_cells (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_index integer not null check (day_index between 0 and 13),
  week_number integer not null check (week_number in (1, 2)),
  weekday text not null,
  slot text not null check (slot in ('breakfast', 'lunch1', 'lunch2', 'dinner')),
  dish_id uuid references public.dishes(id) on delete set null,
  is_auto_filled boolean not null default false,
  origin_cell_id uuid references public.meal_plan_cells(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day_index, slot)
);

create table if not exists public.ingredient_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  week_group text not null check (week_group in ('WEEK 1', 'WEEK 2', 'BOTH WEEKS')),
  status text not null check (status in ('owned', 'missing')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, ingredient_id, week_group)
);

alter table public.dishes enable row level security;
alter table public.ingredients enable row level security;
alter table public.dish_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.meal_plan_cells enable row level security;
alter table public.ingredient_status enable row level security;

drop policy if exists "Authenticated users can read dishes" on public.dishes;
create policy "Authenticated users can read dishes"
  on public.dishes for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read ingredients" on public.ingredients;
create policy "Authenticated users can read ingredients"
  on public.ingredients for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read dish ingredients" on public.dish_ingredients;
create policy "Authenticated users can read dish ingredients"
  on public.dish_ingredients for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can read recipe steps" on public.recipe_steps;
create policy "Authenticated users can read recipe steps"
  on public.recipe_steps for select
  to authenticated
  using (true);

drop policy if exists "Users can read their meal plan cells" on public.meal_plan_cells;
create policy "Users can read their meal plan cells"
  on public.meal_plan_cells for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their meal plan cells" on public.meal_plan_cells;
create policy "Users can insert their meal plan cells"
  on public.meal_plan_cells for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their meal plan cells" on public.meal_plan_cells;
create policy "Users can update their meal plan cells"
  on public.meal_plan_cells for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their meal plan cells" on public.meal_plan_cells;
create policy "Users can delete their meal plan cells"
  on public.meal_plan_cells for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read their ingredient status" on public.ingredient_status;
create policy "Users can read their ingredient status"
  on public.ingredient_status for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their ingredient status" on public.ingredient_status;
create policy "Users can insert their ingredient status"
  on public.ingredient_status for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their ingredient status" on public.ingredient_status;
create policy "Users can update their ingredient status"
  on public.ingredient_status for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their ingredient status" on public.ingredient_status;
create policy "Users can delete their ingredient status"
  on public.ingredient_status for delete
  to authenticated
  using (auth.uid() = user_id);
