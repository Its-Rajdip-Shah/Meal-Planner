import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { supabase } from '../lib/supabaseClient.js';

const DAYS = [
  { dayIndex: 0, weekNumber: 1, weekday: 'Monday', label: 'Monday Week 1' },
  { dayIndex: 1, weekNumber: 1, weekday: 'Tuesday', label: 'Tuesday Week 1' },
  { dayIndex: 2, weekNumber: 1, weekday: 'Wednesday', label: 'Wednesday Week 1' },
  { dayIndex: 3, weekNumber: 1, weekday: 'Thursday', label: 'Thursday Week 1' },
  { dayIndex: 4, weekNumber: 1, weekday: 'Friday', label: 'Friday Week 1' },
  { dayIndex: 5, weekNumber: 1, weekday: 'Saturday', label: 'Saturday Week 1' },
  { dayIndex: 6, weekNumber: 1, weekday: 'Sunday', label: 'Sunday Week 1' },
  { dayIndex: 7, weekNumber: 2, weekday: 'Monday', label: 'Monday Week 2' },
  { dayIndex: 8, weekNumber: 2, weekday: 'Tuesday', label: 'Tuesday Week 2' },
  { dayIndex: 9, weekNumber: 2, weekday: 'Wednesday', label: 'Wednesday Week 2' },
  { dayIndex: 10, weekNumber: 2, weekday: 'Thursday', label: 'Thursday Week 2' },
  { dayIndex: 11, weekNumber: 2, weekday: 'Friday', label: 'Friday Week 2' },
  { dayIndex: 12, weekNumber: 2, weekday: 'Saturday', label: 'Saturday Week 2' },
  { dayIndex: 13, weekNumber: 2, weekday: 'Sunday', label: 'Sunday Week 2' },
];

const SLOTS = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch1', label: 'Lunch 1' },
  { key: 'lunch2', label: 'Lunch 2' },
  { key: 'dinner', label: 'Dinner' },
];

const GROCERY_GROUPS = ['WEEK 1', 'WEEK 2', 'BOTH WEEKS'];

function cellKey(dayIndex, slot) {
  return `${dayIndex}:${slot}`;
}

function statusKey(ingredientId, weekGroup) {
  return `${ingredientId}:${weekGroup}`;
}

export default function Planner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [cells, setCells] = useState([]);
  const [dishIngredients, setDishIngredients] = useState([]);
  const [ingredientStatuses, setIngredientStatuses] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [loadErrors, setLoadErrors] = useState({});
  const [togglingStatusKey, setTogglingStatusKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const cellsByKey = useMemo(() => {
    return cells.reduce((map, cell) => {
      map.set(cellKey(cell.day_index, cell.slot), cell);
      return map;
    }, new Map());
  }, [cells]);

  const statusByKey = useMemo(() => {
    return ingredientStatuses.reduce((map, item) => {
      map.set(statusKey(item.ingredient_id, item.week_group), item.status);
      return map;
    }, new Map());
  }, [ingredientStatuses]);

  const groceryGroups = useMemo(() => {
    const byIngredient = new Map();
    const linksByDish = dishIngredients.reduce((map, link) => {
      const links = map.get(link.dish_id) ?? [];
      links.push(link);
      map.set(link.dish_id, links);
      return map;
    }, new Map());

    cells
      .filter((cell) => !cell.is_auto_filled && cell.dish_id)
      .forEach((cell) => {
        const weekGroup = cell.week_number === 1 ? 'WEEK 1' : 'WEEK 2';
        const links = linksByDish.get(cell.dish_id) ?? [];

        links.forEach((link) => {
          if (!link.ingredient) return;

          const existing = byIngredient.get(link.ingredient.id) ?? {
            ingredientId: link.ingredient.id,
            ingredientName: link.ingredient.name,
            weeks: new Set(),
            dishes: new Set(),
          };

          existing.weeks.add(weekGroup);
          existing.dishes.add(cell.dish?.name ?? 'Unknown dish');
          byIngredient.set(link.ingredient.id, existing);
        });
      });

    const grouped = GROCERY_GROUPS.reduce((groups, groupName) => {
      groups[groupName] = [];
      return groups;
    }, {});

    byIngredient.forEach((item) => {
      const group = item.weeks.size > 1 ? 'BOTH WEEKS' : [...item.weeks][0];
      grouped[group].push({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        weekGroup: group,
        dishes: [...item.dishes].sort((a, b) => a.localeCompare(b)),
      });
    });

    Object.keys(grouped).forEach((group) => {
      grouped[group].sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
    });

    return grouped;
  }, [cells, dishIngredients]);

  const groceryItemCount = Object.values(groceryGroups).reduce(
    (total, groupItems) => total + groupItems.length,
    0,
  );

  useEffect(() => {
    loadPlannerData();
  }, [user?.id]);

  async function loadPlannerData() {
    if (!user?.id || !supabase) return;

    setLoading(true);
    setError('');
    setLoadErrors({});

    try {
      const [dishResult, cellResult, relationshipResult, statusResult] = await Promise.all([
        supabase.from('dishes').select('id, name, servings').order('name'),
        supabase
          .from('meal_plan_cells')
          .select('id, user_id, day_index, week_number, weekday, slot, dish_id, is_auto_filled, origin_cell_id, dish:dishes(id, name, servings)')
          .eq('user_id', user.id)
          .order('day_index')
          .order('slot'),
        supabase
          .from('dish_ingredients')
          .select('dish_id, ingredient:ingredients(id, name)'),
        supabase
          .from('ingredient_status')
          .select('id, ingredient_id, week_group, status')
          .eq('user_id', user.id),
      ]);

      const nextErrors = {
        dishes: dishResult.error?.message,
        cells: cellResult.error?.message,
        grocery: relationshipResult.error?.message,
        statuses: statusResult.error?.message,
      };

      setLoadErrors(Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message)));

      if (dishResult.error || cellResult.error || relationshipResult.error || statusResult.error) {
        setError('Some data could not be loaded. Check the section details below.');
      }

      if (!dishResult.error) {
        setDishes(dishResult.data ?? []);
      }

      if (!cellResult.error) {
        setCells(cellResult.data ?? []);
      }

      if (!relationshipResult.error) {
        setDishIngredients(relationshipResult.data ?? []);
      }

      if (!statusResult.error) {
        setIngredientStatuses(statusResult.data ?? []);
      }
    } catch (loadError) {
      setError(loadError.message);
      setLoadErrors({ network: loadError.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    navigate('/login', { replace: true });
  }

  async function handleRefreshData() {
    await loadPlannerData();
  }

  async function handleClearFullPlan() {
    if (!supabase || !user?.id) return;

    const confirmed = window.confirm('Clear the full 14-day plan? This removes all selected meals and leftovers.');
    if (!confirmed) return;

    setSaving(true);
    setError('');

    try {
      const { error: clearError } = await supabase
        .from('meal_plan_cells')
        .delete()
        .eq('user_id', user.id);

      if (clearError) {
        setError(clearError.message);
      } else {
        setCells([]);
        setSelectedCell(null);
      }
    } catch (clearError) {
      setError(clearError.message);
    } finally {
      setSaving(false);
    }
  }

  function openMealSelector(day, slot) {
    setSelectedCell({
      day,
      slot,
      existingCell: cellsByKey.get(cellKey(day.dayIndex, slot.key)) ?? null,
    });
  }

  function closeMealSelector() {
    if (saving) return;
    setSelectedCell(null);
  }

  function getGroupOriginId(cell) {
    if (!cell) return null;
    return cell.is_auto_filled ? cell.origin_cell_id : cell.id;
  }

  function getCellsForServingSpan(dayIndex, slot, servings) {
    return DAYS.slice(dayIndex, dayIndex + servings).map((day) => ({
      day,
      slot,
      existingCell: cellsByKey.get(cellKey(day.dayIndex, slot)) ?? null,
    }));
  }

  function getGroupIdsForReplacement(dayIndex, slot, servings) {
    const targetCells = getCellsForServingSpan(dayIndex, slot, servings);
    const groupIds = new Set();

    targetCells.forEach(({ existingCell }) => {
      const groupId = getGroupOriginId(existingCell);
      if (groupId) groupIds.add(groupId);
    });

    return [...groupIds];
  }

  async function deleteMealGroups(groupIds) {
    if (!groupIds.length) return;

    const { error: deleteError } = await supabase
      .from('meal_plan_cells')
      .delete()
      .eq('user_id', user.id)
      .in('id', groupIds);

    if (deleteError) throw deleteError;
  }

  async function handleSelectDish(dish) {
    if (!selectedCell || !supabase) return;

    setSaving(true);
    setError('');

    try {
      const groupIds = getGroupIdsForReplacement(
        selectedCell.day.dayIndex,
        selectedCell.slot.key,
        dish.servings,
      );

      await deleteMealGroups(groupIds);

      const originPayload = {
        user_id: user.id,
        day_index: selectedCell.day.dayIndex,
        week_number: selectedCell.day.weekNumber,
        weekday: selectedCell.day.weekday,
        slot: selectedCell.slot.key,
        dish_id: dish.id,
        is_auto_filled: false,
        origin_cell_id: null,
      };

      const { data: originCell, error: originError } = await supabase
        .from('meal_plan_cells')
        .insert(originPayload)
        .select('id')
        .single();

      if (originError) throw originError;

      const autoFillRows = getCellsForServingSpan(
        selectedCell.day.dayIndex + 1,
        selectedCell.slot.key,
        Math.max(dish.servings - 1, 0),
      ).map(({ day }) => ({
        user_id: user.id,
        day_index: day.dayIndex,
        week_number: day.weekNumber,
        weekday: day.weekday,
        slot: selectedCell.slot.key,
        dish_id: dish.id,
        is_auto_filled: true,
        origin_cell_id: originCell.id,
      }));

      if (autoFillRows.length > 0) {
        const { error: autoFillError } = await supabase
          .from('meal_plan_cells')
          .insert(autoFillRows);

        if (autoFillError) throw autoFillError;
      }

      await loadPlannerData();
      setSelectedCell(null);
    } catch (selectionError) {
      setError(selectionError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveSelectedGroup() {
    if (!selectedCell?.existingCell || !supabase) return;

    const groupId = getGroupOriginId(selectedCell.existingCell);
    if (!groupId) return;

    setSaving(true);
    setError('');

    try {
      await deleteMealGroups([groupId]);
      await loadPlannerData();
      setSelectedCell(null);
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleIngredient(item) {
    if (!supabase) return;

    const key = statusKey(item.ingredientId, item.weekGroup);
    const currentStatus = statusByKey.get(key) ?? 'missing';
    const nextStatus = currentStatus === 'owned' ? 'missing' : 'owned';
    const previousStatuses = ingredientStatuses;
    const existingStatus = ingredientStatuses.find(
      (statusItem) =>
        statusItem.ingredient_id === item.ingredientId && statusItem.week_group === item.weekGroup,
    );

    setTogglingStatusKey(key);
    setIngredientStatuses((current) => {
      if (existingStatus) {
        return current.map((statusItem) =>
          statusItem.ingredient_id === item.ingredientId && statusItem.week_group === item.weekGroup
            ? { ...statusItem, status: nextStatus }
            : statusItem,
        );
      }

      return [
        ...current,
        {
          id: key,
          user_id: user.id,
          ingredient_id: item.ingredientId,
          week_group: item.weekGroup,
          status: nextStatus,
        },
      ];
    });

    try {
      const { data, error: statusError } = await supabase
        .from('ingredient_status')
        .upsert(
          {
            user_id: user.id,
            ingredient_id: item.ingredientId,
            week_group: item.weekGroup,
            status: nextStatus,
          },
          { onConflict: 'user_id,ingredient_id,week_group' },
        )
        .select('id, ingredient_id, week_group, status')
        .single();

      if (statusError) {
        throw statusError;
      }

      setIngredientStatuses((current) =>
        current.map((statusItem) =>
          statusItem.ingredient_id === item.ingredientId && statusItem.week_group === item.weekGroup
            ? data
            : statusItem,
        ),
      );
    } catch (statusError) {
      setIngredientStatuses(previousStatuses);
      setError(statusError.message);
    } finally {
      setTogglingStatusKey('');
    }
  }

  return (
    <div className="grid gap-6">
      <section className="glass-panel overflow-hidden">
        <div className="border-b border-[#d4a262]/25 bg-[#513a24]/45 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4a262]">
                Planner
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#fffbb6]">14-day calendar</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#fffbb6]/80">
                Select meals from Supabase. Serving spans are read from the `dishes.servings` column.
              </p>
              <p className="mt-2 text-xs text-[#d4a262]/85">Signed in as {user?.email}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button className="secondary-button" disabled={loading || saving} onClick={handleRefreshData} type="button">
                Refresh data
              </button>
              <button className="danger-button" disabled={loading || saving || cells.length === 0} onClick={handleClearFullPlan} type="button">
                Clear full plan
              </button>
              <button className="secondary-button" onClick={handleLogout} type="button">
                Log out
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="glass-card p-3">
              <p className="text-xs uppercase tracking-wide text-[#d4a262]/80">Dishes</p>
              <p className="mt-1 text-2xl font-semibold text-[#fffbb6]">{dishes.length}</p>
              <p className="mt-1 text-xs text-[#fffbb6]/60">
                {loading ? 'Loading menu...' : loadErrors.dishes ? 'Needs attention' : 'Ready'}
              </p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs uppercase tracking-wide text-[#d4a262]/80">Planned cells</p>
              <p className="mt-1 text-2xl font-semibold text-[#fffbb6]">{cells.length}</p>
              <p className="mt-1 text-xs text-[#fffbb6]/60">
                {loading ? 'Loading planner...' : loadErrors.cells ? 'Needs attention' : 'Saved in Supabase'}
              </p>
            </div>
            <div className="glass-card p-3">
              <p className="text-xs uppercase tracking-wide text-[#d4a262]/80">Grocery items</p>
              <p className="mt-1 text-2xl font-semibold text-[#fffbb6]">{groceryItemCount}</p>
              <p className="mt-1 text-xs text-[#fffbb6]/60">
                {loading ? 'Preparing list...' : loadErrors.grocery ? 'Needs attention' : 'From cooking events'}
              </p>
            </div>
          </div>
        </div>

        {(error || Object.keys(loadErrors).length > 0) && (
          <div className="m-4 rounded-lg border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100 sm:m-5">
            {error && <p>{error}</p>}
            {Object.entries(loadErrors).length > 0 && (
              <ul className="mt-2 grid gap-1 text-xs text-red-100/80">
                {Object.entries(loadErrors).map(([area, message]) => (
                  <li key={area}>
                    {area}: {message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <span className="status-pill border-[#d4a262]/60 bg-[#d4a262]/20 text-[#fffbb6]">
              Cook
            </span>
            <span className="status-pill border-[#cc915c]/60 bg-[#cc915c]/20 text-[#fffbb6]">
              Leftover
            </span>
            <span className="status-pill border-[#d4a262]/25 bg-[#513a24]/45 text-[#fffbb6]/75">
              Empty
            </span>
          </div>

          {loading ? (
            <div className="grid gap-3">
              <div className="h-12 animate-pulse rounded-lg bg-[#d4a262]/15" />
              <div className="h-24 animate-pulse rounded-lg bg-[#bb8f67]/15" />
              <div className="h-24 animate-pulse rounded-lg bg-[#513a24]/35" />
            </div>
          ) : (
            <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5">
              <div className="min-w-[980px] overflow-hidden rounded-lg border border-[#d4a262]/25 bg-[#513a24]/35">
                <div className="grid grid-cols-[190px_repeat(4,minmax(170px,1fr))] bg-[#d4a262]/18 text-xs font-semibold uppercase tracking-wide text-[#fffbb6]">
                  <div className="border-r border-[#d4a262]/25 p-3">Day</div>
                  {SLOTS.map((slot) => (
                    <div className="border-r border-[#d4a262]/25 p-3 last:border-r-0" key={slot.key}>
                      {slot.label}
                    </div>
                  ))}
                </div>

                {DAYS.map((day) => (
                  <div
                    className="grid grid-cols-[190px_repeat(4,minmax(170px,1fr))] border-t border-[#d4a262]/20"
                    key={day.dayIndex}
                  >
                    <div className="border-r border-[#d4a262]/20 bg-[#513a24]/55 p-3">
                      <p className="text-sm font-semibold text-[#fffbb6]">{day.weekday}</p>
                      <p className="mt-1 text-xs text-[#d4a262]/80">Week {day.weekNumber}</p>
                    </div>
                    {SLOTS.map((slot) => {
                      const cell = cellsByKey.get(cellKey(day.dayIndex, slot.key));
                      const cellBadge = cell?.is_auto_filled ? 'Leftover' : 'Cook';
                      const servings = cell?.dish?.servings;

                      return (
                        <button
                          className={`group min-h-[86px] border-r border-[#d4a262]/20 p-3 text-left transition last:border-r-0 focus:outline-none focus:ring-2 focus:ring-[#d4a262]/50 ${
                            cell
                              ? cell.is_auto_filled
                                ? 'bg-[#cc915c]/18 hover:bg-[#cc915c]/28'
                                : 'bg-[#d4a262]/18 hover:bg-[#d4a262]/28'
                              : 'bg-[#513a24]/35 hover:bg-[#bb8f67]/18'
                          }`}
                          key={slot.key}
                          onClick={() => openMealSelector(day, slot)}
                          type="button"
                        >
                          {cell ? (
                            <span className="flex h-full flex-col justify-between gap-3">
                              <span className="block">
                                <span className="block text-sm font-semibold leading-5 text-[#fffbb6]">
                                  {cell.dish?.name ?? 'Unknown dish'}
                                </span>
                              </span>
                              <span className="flex flex-wrap gap-2">
                                <span
                                  className={`status-pill ${
                                    cell.is_auto_filled
                                      ? 'border-[#cc915c]/70 bg-[#cc915c]/25 text-[#fffbb6]'
                                      : 'border-[#d4a262]/70 bg-[#d4a262]/25 text-[#fffbb6]'
                                  }`}
                                >
                                  {cellBadge}
                                </span>
                                {servings && (
                                  <span className="status-pill border-[#fffbb6]/20 bg-[#513a24]/35 text-[#fffbb6]/80">
                                    {servings} serving{servings === 1 ? '' : 's'}
                                  </span>
                                )}
                              </span>
                            </span>
                          ) : (
                            <span className="flex h-full min-h-[58px] items-center justify-center rounded-md border border-dashed border-[#d4a262]/25 text-2xl text-[#d4a262]/65 transition group-hover:border-[#d4a262]/70 group-hover:text-[#fffbb6]">
                              +
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="glass-panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4a262]">Groceries</p>
            <h2 className="mt-1 text-xl font-semibold text-[#fffbb6]">Grocery list</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#fffbb6]/80">
              Generated from selected cooking events only. Auto-filled leftover cells are ignored.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => setShowGroceryList((current) => !current)}
            type="button"
          >
            {showGroceryList ? 'Hide Grocery List' : 'Show Grocery List'}
          </button>
        </div>

        {showGroceryList && (
          <div className="mt-5 grid gap-5">
            {loading ? (
              <div className="grid gap-3">
                <div className="h-20 animate-pulse rounded-lg bg-[#d4a262]/15" />
                <div className="h-20 animate-pulse rounded-lg bg-[#bb8f67]/15" />
              </div>
            ) : loadErrors.grocery ? (
              <div className="rounded-lg border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100">
                Grocery data could not be loaded: {loadErrors.grocery}
              </div>
            ) : groceryItemCount === 0 ? (
              <div className="rounded-lg border border-[#d4a262]/25 bg-[#513a24]/45 p-4 text-sm text-[#fffbb6]/80">
                No grocery items yet. Select meals in the planner to generate a list.
              </div>
            ) : (
              GROCERY_GROUPS.map((groupName) => (
                <div className="glass-card p-4" key={groupName}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold tracking-wide text-[#fffbb6]">{groupName}</h3>
                    <span className="status-pill border-[#d4a262]/25 bg-[#513a24]/40 text-[#d4a262]">
                      {groceryGroups[groupName].length} item{groceryGroups[groupName].length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {groceryGroups[groupName].length === 0 ? (
                    <p className="mt-3 text-sm text-[#fffbb6]/55">No ingredients in this group.</p>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {groceryGroups[groupName].map((item) => {
                        const status = statusByKey.get(statusKey(item.ingredientId, item.weekGroup)) ?? 'missing';
                        const isOwned = status === 'owned';
                        const itemStatusKey = statusKey(item.ingredientId, item.weekGroup);
                        const isToggling = togglingStatusKey === itemStatusKey;

                        return (
                          <button
                            className={`min-h-[120px] rounded-lg border p-3 text-left text-sm shadow-lg transition disabled:cursor-wait disabled:opacity-70 ${
                              isOwned
                                ? 'border-[#2A5631] bg-[#2A5631] text-white shadow-[#2A5631]/45 hover:border-[#2A5631] hover:bg-[#35683d]'
                                : 'border-[#C84646] bg-[#C84646] text-white shadow-[#C84646]/45 hover:border-[#C84646] hover:bg-[#b83f3f]'
                            }`}
                            disabled={Boolean(togglingStatusKey)}
                            key={`${item.weekGroup}:${item.ingredientId}`}
                            onClick={() => handleToggleIngredient(item)}
                            type="button"
                          >
                            <span className="block text-base font-semibold leading-5">
                              {item.ingredientName}
                            </span>
                            <span className="mt-3 flex flex-wrap gap-1.5">
                              {item.dishes.map((dishName) => (
                                <span
                                  className={`rounded-full border px-2 py-1 text-[11px] font-medium leading-none ${
                                    isOwned
                                      ? 'border-white/35 bg-[#2A5631] text-white'
                                      : 'border-white/35 bg-[#C84646] text-white'
                                  }`}
                                  key={dishName}
                                >
                                  {dishName}
                                </span>
                              ))}
                            </span>
                            <span className="mt-3 block text-xs font-medium opacity-90">
                              {isToggling
                                ? 'Saving...'
                                : isOwned
                                  ? 'Owned / already have it'
                                  : 'Missing / need to buy'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#21150b]/85 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <section className="glass-panel max-h-[92vh] w-full max-w-xl overflow-hidden">
            <div className="border-b border-[#d4a262]/25 bg-[#513a24]/45 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4a262]">
                    Meal selection
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-[#fffbb6]">Select meal</h3>
                  <p className="mt-1 text-sm text-[#fffbb6]/75">
                    {selectedCell.day.label} · {selectedCell.slot.label}
                  </p>
                </div>
                <button
                  className="secondary-button min-h-10 px-3 py-1"
                  onClick={closeMealSelector}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[58vh] overflow-y-auto p-3 sm:p-4">
              {loadErrors.dishes ? (
                <div className="rounded-lg border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100">
                  Dishes could not be loaded: {loadErrors.dishes}
                </div>
              ) : dishes.length === 0 ? (
                <div className="rounded-lg border border-[#d4a262]/25 bg-[#513a24]/45 p-4 text-sm text-[#fffbb6]/80">
                  No dishes available yet.
                </div>
              ) : (
                <div className="grid gap-2">
                  {dishes.map((dish) => (
                    <button
                      className="min-h-16 rounded-lg border border-[#d4a262]/25 bg-[#513a24]/45 p-3 text-left transition hover:border-[#d4a262]/60 hover:bg-[#d4a262]/15 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={saving}
                      key={dish.id}
                      onClick={() => handleSelectDish(dish)}
                      type="button"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-sm font-semibold text-[#fffbb6]">{dish.name}</span>
                        <span className="status-pill shrink-0 border-[#d4a262]/30 bg-[#d4a262]/15 text-[#fffbb6]/85">
                          {dish.servings} serving{dish.servings === 1 ? '' : 's'}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#d4a262]/25 bg-[#513a24]/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="danger-button"
                disabled={saving || !selectedCell.existingCell}
                onClick={handleRemoveSelectedGroup}
                type="button"
              >
                Remove group
              </button>
              <span className="text-xs text-[#d4a262]/85">{saving ? 'Saving changes...' : 'Uses dish.servings'}</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
