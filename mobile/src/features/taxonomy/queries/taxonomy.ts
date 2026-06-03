import { queryOptions } from '@tanstack/react-query'
import { getPublicTaxonomyFn } from '../../../lib/api-client'

export const taxonomyQueryOptions = queryOptions({
  queryKey: ['taxonomy'],
  queryFn: getPublicTaxonomyFn,
  staleTime: 10 * 60 * 1000,
})
