import { useAuthStore } from '../stores/auth.store'

/**
 * IDs des produits Lemon Squeezy
 * À configurer selon vos produits réels
 */
export const PRODUCT_IDS = {
  GOLD: {
    link: '0bed5d6e-05ea-4aa3-b68a-401a95057061',
    product_id: '777745',
  },
  NO_SIGNE: {
    link: 'a64e5bf5-d76f-4016-a602-db07c6a981d5',
    product_id: '777585',
  },
}

/**
 * Vérifie si l'utilisateur a accès à une feature premium
 *
 * @param productId - L'ID du produit Lemon Squeezy (optionnel)
 * @returns true si l'utilisateur est abonné OU a acheté le produit spécifique
 *
 * @example
 * ```ts
 * // Vérifier l'accès général (abonné ou au moins un achat)
 * if (hasAccess()) {
 *   // Feature premium accessible
 * }
 *
 * // Vérifier l'accès à un produit spécifique
 * if (hasAccess(PRODUCT_IDS.PREMIUM_TEMPLATE)) {
 *   // Template premium accessible
 * }
 * ```
 */
export const hasAccess = (productId?: string): boolean => {
  const store = useAuthStore.getState()

  // Si abonné, accès total
  if (store.isSubscribed) {
    return true
  }

  // Si un produit spécifique est demandé, vérifier l'achat
  if (productId) {
    return store.hasAccessToProduct(productId)
  }

  // Sinon, vérifier si au moins un produit a été acheté
  return store.purchases.length > 0
}

/**
 * Hook React pour vérifier l'accès à une feature
 * Version reactive qui se met à jour automatiquement
 *
 * @example
 * ```tsx
 * const PremiumFeature = () => {
 *   const { hasAccess, isSubscribed } = useAccessControl()
 *
 *   if (!hasAccess()) {
 *     return <Paywall />
 *   }
 *
 *   return <PremiumContent />
 * }
 * ```
 */
export const useAccessControl = () => {
  const { isSubscribed, purchases } = useAuthStore()

  return {
    isSubscribed,
    purchases,
    hasAccess: (productId?: string) => {
      if (isSubscribed) return true
      if (productId) {
        return purchases.some(p => p.product_id === productId)
      }
      return purchases.length > 0
    },
    hasProduct: (productId: string) => {
      return purchases.some(p => p.product_id === productId)
    },
  }
}
