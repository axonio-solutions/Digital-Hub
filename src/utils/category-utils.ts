import { TFunction } from 'i18next'

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
export function tCategory(category: any, t: TFunction): string {
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
 * Returns the correct i18n key for a given category name.
 * Useful for selectors and forms.
 */
export function getCategoryKey(name: string): string {
  return CATEGORY_MAP[name] || 'general'
}
