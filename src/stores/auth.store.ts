import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

export interface Subscription {
  id: string
  user_id: string
  status: string
  current_period_end: string
  created_at: string
}

export interface Purchase {
  id: string
  user_id: string
  product_id: string
  variant_id: string
  created_at: string
}

interface AuthStore {
  // Auth state
  user: User | null
  session: Session | null
  loading: boolean
  lastAuthEmail: string | null
  isAuthenticating: boolean

  // Payment state
  subscription: Subscription | null
  purchases: Purchase[]
  isSubscribed: boolean

  // Cache management
  lastFetchTime: number | null
  cacheDuration: number // 5 minutes par défaut

  // Setters
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setLastAuthEmail: (email: string | null) => void
  setIsAuthenticating: (isAuthenticating: boolean) => void
  setSubscription: (subscription: Subscription | null) => void
  setPurchases: (purchases: Purchase[]) => void
  setLastFetchTime: (time: number) => void

  // Helpers
  hasAccessToProduct: (productId: string) => boolean
  canAccess: () => boolean
  needsRefresh: () => boolean
  reset: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Auth state
  user: null,
  session: null,
  loading: true,
  lastAuthEmail: null,
  isAuthenticating: false,

  // Payment state
  subscription: null,
  purchases: [],
  isSubscribed: false,

  // Cache management
  lastFetchTime: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes

  // Setters
  setUser: user => set({ user }),
  setSession: session => set({ session }),
  setLoading: loading => set({ loading }),
  setLastAuthEmail: lastAuthEmail => set({ lastAuthEmail }),
  setIsAuthenticating: isAuthenticating => set({ isAuthenticating }),

  setSubscription: subscription =>
    set({
      subscription,
      isSubscribed: subscription?.status === 'active',
    }),

  setPurchases: purchases => set({ purchases }),
  setLastFetchTime: time => set({ lastFetchTime: time }),

  // Helpers
  hasAccessToProduct: productId => {
    const { purchases } = get()
    return purchases.some(p => p.product_id === productId)
  },

  canAccess: () => {
    const { isSubscribed, purchases } = get()
    return isSubscribed || purchases.length > 0
  },

  needsRefresh: () => {
    const { lastFetchTime, cacheDuration } = get()
    if (!lastFetchTime) return true
    return Date.now() - lastFetchTime > cacheDuration
  },

  reset: () =>
    set({
      user: null,
      session: null,
      loading: false,
      lastAuthEmail: null,
      isAuthenticating: false,
      subscription: null,
      purchases: [],
      isSubscribed: false,
      lastFetchTime: null,
    }),
}))