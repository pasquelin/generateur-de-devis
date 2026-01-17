import { useEffect, useRef } from 'react'
import { useSettingsStore } from '../features/settings/settings.store'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../stores/auth.store'

/**
 * Hook principal pour gérer l'authentification transparente
 *
 * Fonctionnalités :
 * - Initialise la session au montage
 * - Authentifie automatiquement quand un email est présent
 * - Se synchronise avec les changements d'email dans company settings
 * - Gère intelligemment le cache pour éviter les appels redondants
 */
export const useAuth = () => {
  const companyEmail = useSettingsStore(state => state.settings.company.email)
  const { user, loading, isAuthenticating, isSubscribed, purchases } = useAuthStore()
  const isInitialized = useRef(false)
  const lastProcessedEmail = useRef<string | null>(null)

  // 🚀 Initialisation au montage
  useEffect(() => {
    if (!isInitialized.current) {
      console.log("🚀 Initialisation de l'auth...")
      void authService.initializeAuth()
      isInitialized.current = true
    }
  }, [])

  // 📧 Synchronisation avec l'email company
  useEffect(() => {
    // Attendre que l'initialisation soit terminée
    if (!isInitialized.current || loading) {
      return
    }

    // Pas d'email configuré
    if (!companyEmail || companyEmail.trim() === '') {
      console.log("⚠️ Pas d'email configuré")
      return
    }

    // Email déjà traité
    if (lastProcessedEmail.current === companyEmail) {
      return
    }

    // L'utilisateur est déjà connecté avec cet email
    if (user?.email === companyEmail) {
      console.log('✅ Déjà authentifié avec cet email')
      lastProcessedEmail.current = companyEmail
      return
    }

    // Authentification nécessaire
    console.log('🔐 Authentification automatique pour:', companyEmail)
    lastProcessedEmail.current = companyEmail
    void authService.authenticateWithEmail(companyEmail)
  }, [companyEmail, user, loading])

  return {
    user,
    loading,
    isAuthenticating,
    isAuthenticated: !!user,
    isSubscribed,
    purchases,
    hasAccessToProduct: authService.hasAccessToProduct.bind(authService),
    canAccess: authService.canAccess.bind(authService),
    refreshPaymentData: authService.refreshPaymentData.bind(authService),
  }
}
