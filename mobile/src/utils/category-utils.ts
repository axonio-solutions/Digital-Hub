import type { TaxCategory } from '../types/taxonomy'

/**
 * Maps database category names to i18n translation keys.
 * Handles both web app naming conventions ("Engine & Parts") and mobile/legacy names ("engine").
 */
const CATEGORY_MAP: Record<string, string> = {
  // Web app canonical names
  'Engine & Parts': 'engine',
  'Braking System': 'brakes',
  'Suspension & Steering': 'suspension',
  'Transmission & Gearbox': 'transmission',
  'Electrical & Lighting': 'electrical',
  'Body & Panels': 'body',
  'Cooling & Heating': 'cooling',
  'Filters & Fluids': 'filters',
  'Exhaust System': 'exhaust',
  'Wheels & Tires': 'wheels',
  'Interior & Accessories': 'interior',
  'Tools & Workshop': 'accessories',

  // Mobile/legacy names (lowercase)
  engine: 'engine',
  brakes: 'brakes',
  suspension: 'suspension',
  transmission: 'transmission',
  transmision: 'transmission', // typo variant
  electrical: 'electrical',
  electric: 'electrical',
  body: 'body',
  cooling: 'cooling',
  filters: 'filters',
  exhaust: 'exhaust',
  wheels: 'wheels',
  interior: 'interior',
  lighting: 'lighting',
  fuel: 'fuel',
  accessories: 'accessories',
  other: 'other',

  // Additional variations (capitalized)
  Engine: 'engine',
  Brakes: 'brakes',
  Suspension: 'suspension',
  Transmission: 'transmission',
  Electrical: 'electrical',
  Electric: 'electrical',
  Body: 'body',
  Cooling: 'cooling',
  Filters: 'filters',
  Exhaust: 'exhaust',
  Wheels: 'wheels',
  Interior: 'interior',
  Lighting: 'lighting',
  Fuel: 'fuel',
  Accessories: 'accessories',
  Other: 'other',
}

/**
 * Maps database category names to i18n translation keys for descriptions.
 */
const CATEGORY_DESCRIPTION_MAP: Record<string, string> = {
  // Web app canonical names
  'Engine & Parts': 'engine',
  'Braking System': 'brakes',
  'Suspension & Steering': 'suspension',
  'Transmission & Gearbox': 'transmission',
  'Electrical & Lighting': 'electrical',
  'Body & Panels': 'body',
  'Cooling & Heating': 'cooling',
  'Filters & Fluids': 'filters',
  'Exhaust System': 'exhaust',
  'Wheels & Tires': 'wheels',
  'Interior & Accessories': 'interior',
  'Tools & Workshop': 'accessories',

  // Mobile/legacy names (lowercase)
  engine: 'engine',
  brakes: 'brakes',
  suspension: 'suspension',
  transmission: 'transmission',
  transmision: 'transmission',
  electrical: 'electrical',
  electric: 'electrical',
  body: 'body',
  cooling: 'cooling',
  filters: 'filters',
  exhaust: 'exhaust',
  wheels: 'wheels',
  interior: 'interior',
  lighting: 'lighting',
  fuel: 'fuel',
  accessories: 'accessories',
  other: 'other',

  // Additional variations (capitalized)
  Engine: 'engine',
  Brakes: 'brakes',
  Suspension: 'suspension',
  Transmission: 'transmission',
  Electrical: 'electrical',
  Electric: 'electrical',
  Body: 'body',
  Cooling: 'cooling',
  Filters: 'filters',
  Exhaust: 'exhaust',
  Wheels: 'wheels',
  Interior: 'interior',
  Lighting: 'lighting',
  Fuel: 'fuel',
  Accessories: 'accessories',
  Other: 'other',
}

/**
 * Translates a category name using the provided i18next translate function.
 * Falls back to the original name if no translation key is found.
 *
 * @param category - Category object or category name string
 * @param t - i18next translate function
 * @returns Translated category name
 */
export function tCategory(
  category: TaxCategory | string | null | undefined,
  t: (key: string) => string,
): string {
  if (!category) return t('partCategories.other')

  // Extract name from object if necessary
  const name = typeof category === 'string' ? category : category.name

  if (!name) return t('partCategories.other')

  const key = CATEGORY_MAP[name]

  if (key) {
    const translationKey = `partCategories.${key}`
    const translated = t(translationKey)
    // Return translation if it exists and is not the key itself
    if (translated && translated !== translationKey) {
      return translated
    }
  }

  // Fallback to original name if not in map or translation missing
  return name
}

/**
 * Translates a category description using the provided i18next translate function.
 * Returns null if no translation key is found, allowing caller to fall back to DB description.
 *
 * @param category - Category object or category name string
 * @param t - i18next translate function
 * @returns Translated category description or null
 */
export function tCategoryDescription(
  category: TaxCategory | string | null | undefined,
  t: (key: string) => string,
): string | null {
  if (!category) return null

  const name = typeof category === 'string' ? category : category.name

  if (!name) return null

  const key = CATEGORY_DESCRIPTION_MAP[name]

  if (key) {
    const translationKey = `partCategoriesDesc.${key}`
    const translated = t(translationKey)
    // Return translation if it exists and is not the key itself
    if (translated && translated !== translationKey) {
      return translated
    }
  }

  // Return null to allow fallback to database description
  return null
}
