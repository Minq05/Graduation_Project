export const wishlistKeys = {
  all: ['wishlist'] as const,
  lists: () => [...wishlistKeys.all, 'list'] as const,
  list: (filters: string) => [...wishlistKeys.lists(), { filters }] as const,
  details: () => [...wishlistKeys.all, 'detail'] as const,
  detail: (id: string) => [...wishlistKeys.details(), id] as const,
  check: (productId: string) => [...wishlistKeys.all, 'check', productId] as const,
};