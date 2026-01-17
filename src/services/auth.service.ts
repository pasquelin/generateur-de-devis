import type { Purchase, Subscription } from '../stores/auth.store'
import { useAuthStore } from '../stores/auth.store'
import supabase from '../utils/supabase.util'

class AuthService {
  /**
   * Authentifie l'utilisateur avec OTP de manière transparente
   * L'utilisateur recevra un lien magic dans son email
   */
  async authenticateWithEmail(email: string): Promise<boolean> {
    try {
      const store = useAuthStore.getState()

      // Éviter les appels redondants si déjà en cours d'auth avec le même email
      if (store.isAuthenticating && store.lastAuthEmail === email) {
        console.log('🔄 Authentification déjà en cours pour cet email')
        return false
      }

      store.setIsAuthenticating(true)
      store.setLastAuthEmail(email)

      // Vérifier si une session existe déjà avec cet email
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user?.email === email) {
        console.log('✅ Session déjà active pour cet email')
        store.setSession(session)
        store.setUser(session.user)
        store.setIsAuthenticating(false)
        return true
      }

      // Envoyer l'OTP
      console.log('📤 Tentative d\'envoi du magic link à:', email)
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'OTP:', error)
        console.error('❌ Détails de l\'erreur:', {
          message: error.message,
          status: error.status,
          code: error.code,
        })
        store.setIsAuthenticating(false)
        return false
      }

      console.log('✅ Réponse Supabase:', data)
      console.log('📧 Magic link envoyé à:', email)
      console.log('⚠️ IMPORTANT: Vérifiez vos emails (et spam) pour le magic link')
      store.setIsAuthenticating(false)
      return true
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification:', error)
      useAuthStore.getState().setIsAuthenticating(false)
      return false
    }
  }

  /**
   * Initialise la session au démarrage de l'app
   * Écoute les changements d'état d'authentification
   */
  async initializeAuth(): Promise<void> {
    const store = useAuthStore.getState()

    try {
      // Récupérer la session actuelle
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        store.setSession(session)
        store.setUser(session.user)
        console.log('✅ Session restaurée:', session.user.email)

        // Charger les données de paiement
        await this.fetchPaymentData()
      }

      // Écouter les changements d'état d'auth
      supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log('🔄 Auth state changed:', _event)

        if (session) {
          store.setSession(session)
          store.setUser(session.user)

          // Charger les données de paiement
          await this.fetchPaymentData()
        } else {
          store.reset()
        }
      })
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error)
    } finally {
      store.setLoading(false)
    }
  }

  /**
   * Récupère les données de paiement (subscription + purchases)
   * Utilise le cache pour éviter les appels redondants
   */
  async fetchPaymentData(): Promise<void> {
    const store = useAuthStore.getState()

    // Vérifier le cache
    if (!store.needsRefresh()) {
      console.log('✨ Utilisation du cache pour les données de paiement')
      return
    }

    try {
      console.log('🔍 Récupération des données de paiement...')

      // Récupération en parallèle
      const [subscriptionResult, purchasesResult] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('*')
          .eq('status', 'active')
          .maybeSingle(),

        supabase
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      // Gérer les erreurs
      if (subscriptionResult.error) {
        console.error('❌ Erreur subscriptions:', subscriptionResult.error)
      }

      if (purchasesResult.error) {
        console.error('❌ Erreur purchases:', purchasesResult.error)
      }

      // Mettre à jour le store
      store.setSubscription((subscriptionResult.data as Subscription) || null)
      store.setPurchases((purchasesResult.data as Purchase[]) || [])
      store.setLastFetchTime(Date.now())

      console.log('✅ Données de paiement chargées:', {
        isSubscribed: store.isSubscribed,
        purchasesCount: store.purchases.length,
      })
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error)
    }
  }

  /**
   * Vérifie si l'utilisateur a accès à un produit spécifique
   */
  hasAccessToProduct(productId: string): boolean {
    return useAuthStore.getState().hasAccessToProduct(productId)
  }

  /**
   * Vérifie si l'utilisateur a accès (abonné OU a acheté au moins un produit)
   */
  canAccess(): boolean {
    return useAuthStore.getState().canAccess()
  }

  /**
   * Force le rafraîchissement des données de paiement
   */
  async refreshPaymentData(): Promise<void> {
    useAuthStore.getState().setLastFetchTime(0)
    await this.fetchPaymentData()
  }
}

export const authService = new AuthService()