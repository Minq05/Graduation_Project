export const PRODUCT_QUERY_KEYS = {
  FETCH_ALL: 'fetch-all-products',
  FETCH_INFO: 'fetch-info-product',
  CREATE: 'create-product',
  UPDATE: 'update-product',
  DELETE: 'delete-product'
}

export const ATTRIBUTE_QUERY_KEYS = {
  FETCH_ALL: 'fetch-all-attributes',
  FETCH_INFO: 'fetch-info-attribute',
  CREATE: 'create-attribute',
  UPDATE: 'update-attribute',
  DELETE: 'delete-attribute'
}

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const
}