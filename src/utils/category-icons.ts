import { getCategoryKey } from './category-utils'

export function getCategoryImageUrl(category?: { imageUrl?: string | null } | string | null): string | null {
  if (!category) return null
  if (typeof category === 'object' && category?.imageUrl) return category.imageUrl
  return null
}

export { getCategoryKey }
