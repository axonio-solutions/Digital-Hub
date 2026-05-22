/**
 * Maps database category names to i18n translation keys.
 * This ensures professional MSA translations are used regardless of the underlying DB string.
 */
const CATEGORY_MAP: Record<string, string> = {
  // Canonical names
  'Engine & Parts': 'engine_parts',
  'Braking System': 'braking_system',
  'Suspension & Steering': 'suspension_steering',
  'Transmission & Gearbox': 'transmission_gearbox',
  'Electrical & Lighting': 'electrical_lighting',
  'Body & Panels': 'body_panels',
  'Cooling & Heating': 'cooling_heating',
  'Filters & Fluids': 'filters_fluids',
  'Exhaust System': 'exhaust_system',
  'Wheels & Tires': 'wheels_tires',
  'Interior & Accessories': 'interior_accessories',
  'Tools & Workshop': 'tools_workshop',

  // Legacy or duplicate names in DB
  'Engine Parts': 'engine_parts',
  'Body & Trim': 'body_panels',
  'Transmission & Drivetrain': 'transmission_gearbox',
  'Cooling System': 'cooling_heating',
}

/**
 * Translates a category name using the provided i18next instance.
 * Falls back to the original name if no translation key is found.
 */
export function tCategory(category: any, t: (key: string) => string): string {
  if (!category) return t('categories:general')

  // Extract name from object if necessary
  const name = typeof category === 'string' ? category : category.name

  if (!name) return t('categories:general')

  const key = CATEGORY_MAP[name]

  if (key) {
    // We use the 'categories' namespace
    return t(`categories:${key}`)
  }

  // Fallback to original name if not in map
  return name
}

/**
 * Maps database category names to i18n translation keys for descriptions.
 */
const CATEGORY_DESCRIPTION_MAP: Record<string, string> = {
  'Engine & Parts': 'engine_parts_desc',
  'Braking System': 'braking_system_desc',
  'Suspension & Steering': 'suspension_steering_desc',
  'Transmission & Gearbox': 'transmission_gearbox_desc',
  'Electrical & Lighting': 'electrical_lighting_desc',
  'Body & Panels': 'body_panels_desc',
  'Cooling & Heating': 'cooling_heating_desc',
  'Filters & Fluids': 'filters_fluids_desc',
  'Exhaust System': 'exhaust_system_desc',
  'Wheels & Tires': 'wheels_tires_desc',
  'Interior & Accessories': 'interior_accessories_desc',
  'Tools & Workshop': 'tools_workshop_desc',

  'Engine Parts': 'engine_parts_desc',
  'Body & Trim': 'body_panels_desc',
  'Transmission & Drivetrain': 'transmission_gearbox_desc',
  'Cooling System': 'cooling_heating_desc',
}

/**
 * Translates a category description using the provided i18next instance.
 * Returns null if no translation key is found, so the caller can fall back to the DB description.
 */
export function tCategoryDescription(
  category: any,
  t: (key: string) => string,
): string | null {
  if (!category) return null
  const name = typeof category === 'string' ? category : category.name
  if (!name) return null
  const key = CATEGORY_DESCRIPTION_MAP[name]
  if (key) {
    const translated = t(`categories:${key}`)
    if (translated && translated !== `categories:${key}`) return translated
  }
  return null
}

/**
 * Returns the correct i18n key for a given category name.
 * Useful for selectors and forms.
 */
export function getCategoryKey(name: string): string {
  return CATEGORY_MAP[name] || 'general'
}
