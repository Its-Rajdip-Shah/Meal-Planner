# Biweekly Meal Planner

A personal biweekly meal planning system for planning meals, tracking ingredients, and generating a grocery list from selected dishes.

The app is designed around a fixed student-budget menu with reusable ingredients across Japanese, Korean, Thai, Nepali-style, Pakistani-style, and comfort meals.

---

## Project Direction

- Frontend: React + Vite + Tailwind CSS
- Authentication: Supabase Auth
- Backend/database: Supabase Postgres
- Hosting: Vercel free tier
- Version control: GitHub

---

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Paste your Supabase project values into `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Required environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Start the development server:

```bash
npm run dev
```

## Supabase Setup

Run the SQL files manually in the Supabase SQL editor:

1. Open your Supabase project.
2. Go to SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Paste and run `supabase/seed.sql`.

The `dishes` table stores serving counts. Planner auto-fill behaviour must read `dish.servings` from Supabase and must not hardcode serving counts in frontend logic.

## Supabase Auth Setup

Create the first user manually:

1. Open your Supabase project.
2. Go to Authentication.
3. Open Users.
4. Click Add user.
5. Enter the email and password you want to use for the private planner.
6. Confirm the user if Supabase asks for confirmation.

To keep the app private-ready, disable public signups if your Supabase project settings allow it:

1. Go to Authentication.
2. Open Providers.
3. Open Email.
4. Turn off public email signups or disable new user signups.
5. Keep email/password sign-in enabled for manually created users.

The app uses Supabase's built-in auth session handling. Do not store auth state manually in localStorage.

---

## Menu Overview

The system should support the following dishes:

1. Oats bowl
2. Peanut butter bread with milk
3. Chicken curry
4. Chicken biryani
5. Paneer Mushroom Broccoli Rice
6. Jeera Aloo
7. Malatang-style ramen
8. Tonkotsu ramen
9. Rose pasta with minced pork
10. Beans, kale, potatoes, and dal
11. Thai red curry
12. Pad Thai
13. Kimchi jjigae
14. Miso soup

---

## Serving Rules

These serving rules determine how many sequential meal cells are filled after selecting a cooked dish.

| Dish | Servings | Planning Behaviour |
|---|---:|---|
| Oats bowl | 2 | Fills selected cell + next same-slot day |
| Malatang-style ramen | 2 | Fills selected cell + next same-slot day |
| Tonkotsu ramen | 2 | Fills selected cell + next same-slot day |
| Kimchi jjigae | 2 | Fills selected cell + next same-slot day |
| Pad Thai | 2 | Fills selected cell + next same-slot day |
| Paneer Mushroom Broccoli Rice | 2 | Fills selected cell + next same-slot day |
| Jeera Aloo | 2 | Fills selected cell + next same-slot day |
| Miso soup | 1 | Fills only selected cell |
| Peanut butter bread with milk | 1 | Fills only selected cell |
| Beans, kale, potatoes, and dal | 3 | Fills selected cell + next 2 same-slot days |
| Thai red curry | 3 | Fills selected cell + next 2 same-slot days |
| Chicken curry | 3 | Fills selected cell + next 2 same-slot days |
| Chicken biryani | 3 | Fills selected cell + next 2 same-slot days |
| Rose pasta with minced pork | 3 | Fills selected cell + next 2 same-slot days |

Serving counts must be stored in the `dishes` table. Planner auto-fill behaviour must use `dish.servings`, and serving counts must never be hardcoded in frontend logic.

---

# Dish Data

## 1. Oats Bowl

### Ingredients

- Oats
- Banana
- Greek yogurt
- Peanut butter
- Milk, optional

### Recipe Timeline

1. Add oats to a bowl.
2. Add Greek yogurt.
3. Slice banana on top.
4. Add peanut butter.
5. Add a splash of milk if a looser texture is preferred.
6. Mix and eat immediately, or chill for overnight oats.

### Notes

Fast breakfast option. Cheap, filling, high-protein, and repeatable.

---

## 2. Peanut Butter Bread With Milk

### Ingredients

- Bread
- Peanut butter
- Milk

### Recipe Timeline

1. Toast or warm bread if preferred.
2. Spread peanut butter.
3. Serve with milk.
4. Optionally dip bread into milk.

### Notes

Ultra-fast backup breakfast or snack meal.

---

## 3. Chicken Curry

### Ingredients

- Chicken
- Rice
- Onion
- Garlic
- Ginger
- Tomato
- Greek yogurt
- Nepali-style curry spices
- Salt
- Oil
- Optional: carrots, potatoes, coriander, lime

### Recipe Timeline

1. Marinate chicken with yogurt, salt, ginger, garlic, and curry spices.
2. Fry onion until softened or lightly browned.
3. Add garlic and ginger.
4. Add tomato and cook until thickened.
5. Add chicken and cook until sealed.
6. Add water as needed and simmer until chicken is cooked.
7. Adjust salt and spice level.
8. Serve with rice.

### Notes

Should be Nepali-style rather than overly spicy Indian-style. Keep heat moderate and flavour aromatic.

---

## 4. Chicken Biryani

### Ingredients

- Chicken
- Basmati rice
- Onion
- Garlic
- Ginger
- Greek yogurt
- Tomato
- Biryani masala
- Coriander
- Mint
- Lime
- Salt
- Oil or ghee
- Optional: fried onions, potatoes, boiled eggs

### Recipe Timeline

1. Marinate chicken with yogurt, ginger, garlic, biryani masala, salt, and lime.
2. Parboil basmati rice until partly cooked.
3. Fry onions until golden.
4. Cook marinated chicken with tomato until mostly cooked.
5. Layer rice, chicken, coriander, mint, and optional fried onions.
6. Steam on low heat until rice is fully cooked.
7. Rest before serving.

### Notes

Preferred style: Pakistani-style biryani. Should be aromatic, rich, and not aggressively spicy.

---

## 5. Paneer Mushroom Broccoli Rice

### Ingredients

- Paneer
- Mushrooms
- Broccoli
- Rice
- Onion
- Garlic
- Soy sauce
- Spring onion
- Oil
- Optional: carrots, sesame oil

### Recipe Timeline

1. Cook rice separately.
2. Pan-fry paneer until lightly golden.
3. Cook onion, garlic, mushrooms, and broccoli.
4. Add cooked rice.
5. Add soy sauce and mix.
6. Add paneer back in.
7. Finish with spring onion.

### Notes

Flexible rice dish that can lean Indian, Chinese, or fusion depending on spices and sauces.

---

## 6. Jeera Aloo

### Ingredients

- Potatoes
- Cumin Seeds
- Onion
- Garlic
- Ginger
- Coriander
- Salt
- Oil
- Optional: Green Chilli, Lime

### Recipe Timeline

1. Boil or parboil potatoes until just tender.
2. Cut potatoes into bite-sized pieces.
3. Heat oil and toast cumin seeds until fragrant.
4. Add onion and cook until softened.
5. Add garlic, ginger, and optional green chilli.
6. Add potatoes and salt.
7. Pan-fry until the potatoes are lightly crisp at the edges.
8. Finish with coriander and optional lime.

### Notes

Simple cumin potato dish. Works as a cheap side or light meal with rice, bread, dal, or curry.

---

## 7. Malatang-Style Ramen

### Ingredients

- Chicken stock
- Wheat noodles
- Tofu
- Fish cake
- Shrimp
- Bok choy
- Mushrooms
- Dashi or Hondashi
- Miso
- Soy sauce
- Sesame oil
- MSG
- Garlic
- Ginger
- Optional: baked chicken, baked pork, chilli oil, spring onion

### Recipe Timeline

1. Heat chicken stock.
2. Add garlic, ginger, dashi, soy sauce, MSG, and miso.
3. Add mushrooms, fish cake, tofu, and shrimp.
4. Add noodles.
5. Add bok choy near the end.
6. Finish with sesame oil and optional chilli oil.
7. Top with baked chicken or pork if available.

### Notes

This is a flexible soup bowl inspired by malatang and ramen, not strict traditional ramen.

---

## 8. Tonkotsu Ramen

### Ingredients

- Pork bones
- Wheat noodles
- Bok choy
- Mushrooms
- Spring onion
- Soy sauce
- Garlic
- Dashi or Hondashi
- Eggs
- Optional: miso, sesame oil, baked pork, chilli oil

### Recipe Timeline

1. Blanch pork bones, then discard blanching water.
2. Rinse bones.
3. Pressure cook bones with clean water until broth is rich.
4. Strain broth.
5. Season broth with soy sauce, garlic, dashi, and optional miso.
6. Cook noodles separately.
7. Add noodles to bowl.
8. Add broth.
9. Top with egg, bok choy, mushrooms, spring onion, and pork if available.

### Notes

This is the richer pork-bone ramen option. It should be made less frequently than chicken stock because it is more expensive and heavier.

---

## 9. Rose Pasta With Minced Pork

### Ingredients

- Pasta
- Minced pork
- Parmesan cheese
- Tomato paste
- Cream
- Onion
- Garlic
- Salt
- Black pepper
- Optional: broccoli, chilli flakes, mushrooms

### Recipe Timeline

1. Boil pasta until al dente.
2. Fry onion and garlic.
3. Add minced pork and cook through.
4. Add tomato paste and cook until deeper red.
5. Add cream.
6. Add pasta water to loosen the sauce.
7. Mix pasta into sauce.
8. Finish with parmesan cheese.

### Notes

Comfort pasta. Broccoli works well here for nutrition and texture.

---

## 10. Beans, Kale, Potatoes, and Dal

### Ingredients

- Beans
- Dal
- Kale
- Potatoes
- Onion
- Garlic
- Ginger
- Rice
- Salt
- Oil
- Optional: tomato, cumin, turmeric, coriander

### Recipe Timeline

1. Soak beans if using dried beans.
2. Cook beans and dal until soft.
3. Cook potatoes separately or in the same pot.
4. Fry onion, garlic, and ginger.
5. Add spices if using.
6. Combine beans, dal, potatoes, and kale.
7. Simmer until thick and cohesive.
8. Serve with rice.

### Notes

This category includes dal, beans, chickpeas, rajma-style meals, and similar legume meals. Treat as one flexible dish family.

---

## 11. Thai Red Curry

### Ingredients

- Chicken
- Rice
- Coconut milk
- Thai red curry paste
- Fish sauce
- Lime
- Carrots
- Broccoli
- Onion
- Optional: mushrooms, bok choy, tofu, shrimp

### Recipe Timeline

1. Fry red curry paste in oil.
2. Add chicken and coat in paste.
3. Add coconut milk.
4. Add carrots and other firm vegetables.
5. Simmer until chicken is cooked.
6. Add broccoli near the end.
7. Season with fish sauce and lime.
8. Serve with rice.

### Notes

Should be rich, coconut-based, aromatic, and only moderately spicy.

---

## 12. Pad Thai

### Ingredients

- Rice noodles
- Shrimp
- Eggs
- Bean sprouts
- Spring onion
- Tamarind paste
- Fish sauce
- Lime
- Peanuts
- Optional: tofu, chicken, chilli flakes

### Recipe Timeline

1. Soak rice noodles until flexible.
2. Mix sauce using tamarind, fish sauce, and a little sugar if needed.
3. Cook shrimp or chosen protein.
4. Push protein aside and scramble egg.
5. Add noodles and sauce.
6. Toss until noodles absorb sauce.
7. Add bean sprouts and spring onion.
8. Finish with lime and peanuts.

### Notes

Tangy, sweet-savoury noodle dish. Best cooked fresh rather than held for many days, but planner treats it as two servings.

---

## 13. Kimchi Jjigae

### Ingredients

- Kimchi
- Minced pork
- Tofu
- Onion
- Garlic
- Gochujang
- Chicken stock
- Spring onion
- Optional: mushrooms, egg, sesame oil

### Recipe Timeline

1. Fry pork until browned.
2. Add onion and garlic.
3. Add kimchi and cook until softened.
4. Add gochujang.
5. Add chicken stock.
6. Simmer until broth is rich and sour-spicy.
7. Add tofu near the end.
8. Finish with spring onion.

### Notes

Korean spicy-sour stew. Heat level should be adjustable.

---

## 14. Miso Soup

### Ingredients

- Miso
- Dashi or Hondashi
- Tofu
- Spring onion
- Seaweed
- Optional: mushrooms, bok choy

### Recipe Timeline

1. Heat water or light stock.
2. Add dashi.
3. Add tofu and seaweed.
4. Turn heat low.
5. Dissolve miso into the soup without boiling hard.
6. Finish with spring onion.

### Notes

Quick one-serving soup. Miso should not be pressure cooked or boiled aggressively.

---

# Master Ingredient List

## Core Carbs

- Rice
- Basmati rice
- Wheat noodles
- Rice noodles
- Pasta
- Bread
- Oats
- Potatoes

## Proteins

- Chicken
- Minced pork
- Pork bones
- Paneer
- Tofu
- Shrimp
- Fish cake
- Eggs
- Beans
- Dal

## Vegetables and Fresh Ingredients

- Onion
- Garlic
- Ginger
- Tomato
- Banana
- Kale
- Bok choy
- Mushrooms
- Carrots
- Broccoli
- Spring onion
- Bean sprouts
- Coriander
- Mint
- Lime
- Green Chilli

## Dairy

- Greek yogurt
- Milk
- Parmesan cheese
- Cream

## Sauces, Pastes, and Pantry

- Soy sauce
- Sesame oil
- MSG
- Miso
- Dashi or Hondashi
- Fish sauce
- Gochujang
- Kimchi
- Thai red curry paste
- Tamarind paste
- Peanut butter
- Biryani masala
- Nepali-style curry spices
- Cumin Seeds
- Salt
- Oil
- Optional: chilli oil, black pepper, peanuts, coconut milk

---

# Ingredient Output Format

The app should generate grocery items using this format:

```text
ingredient: {dish 1, dish 2, dish 3}
```

Example:

```text
onion: {Chicken curry, Chicken biryani, Kimchi jjigae}
rice: {Chicken curry, Thai red curry, Paneer Mushroom Broccoli Rice}
```
