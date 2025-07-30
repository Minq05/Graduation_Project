export const FLASH_SALE_QUERY_KEYS = {
  FETCH_ALL: 'fetch-all-flash-sales',
  FETCH_INFO: 'fetch-info-flash-sale',
  CREATE: 'create-flash-sale',
  UPDATE: 'update-flash-sale',
  DELETE: 'delete-flash-sale'
}

export const FLASH_SALE_ITEM_QUERY_KEYS = {
  FETCH_ALL: 'fetch-all-flash-sale-items',
  FETCH_BY_FLASH_SALE: 'fetch-by-flash-sale',
  FETCH_INFO: 'fetch-info-flash-sale-item',
  CREATE: 'create-flash-sale-item',
  UPDATE: 'update-flash-sale-item',
  DELETE: 'delete-flash-sale-item'
}

export const flashSaleKeys = {
  all: ['flash-sales'] as const,
  lists: () => [...flashSaleKeys.all, 'list'] as const,
  list: (filters: string) => [...flashSaleKeys.lists(), { filters }] as const,
  details: () => [...flashSaleKeys.all, 'detail'] as const,
  detail: (id: string) => [...flashSaleKeys.details(), id] as const
}

export const flashSaleItemKeys = {
  all: ['flash-sale-items'] as const,
  lists: () => [...flashSaleItemKeys.all, 'list'] as const,
  list: (filters: string) => [...flashSaleItemKeys.lists(), { filters }] as const,
  byFlashSale: (flashSaleId: string) => [...flashSaleItemKeys.lists(), { flashSaleId }] as const,
  details: () => [...flashSaleItemKeys.all, 'detail'] as const,
  detail: (id: string) => [...flashSaleItemKeys.details(), id] as const
}