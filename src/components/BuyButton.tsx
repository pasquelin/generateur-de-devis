import { type FC, type PropsWithChildren } from 'react'
import { useSettingsStore } from '../features/settings/settings.store.ts'
import { cn } from '../utils/cn.util.ts'
import { useAuthStore } from '../stores/auth.store.ts'

interface BuyButtonProps {
  link: string
  className?: string
}

export const BuyButton: FC<PropsWithChildren<BuyButtonProps>> = ({
  link,
  className,
  children,
}) => {
  const { settings } = useSettingsStore()
  const { user } = useAuthStore()

  const handlePurchase = () => {
    const checkoutUrl = `https://boutique.generateur-de-devis.fr/checkout/buy/${link}?checkout[custom][user_id]=${user?.id}&checkout[email]=${settings.company.email}&checkout[name]=${settings.company.name}&checkout[billing_address][zip]=${settings.company.postalCode}&checkout[billing_address][country]=FR`

    window.LemonSqueezy.Url.Open(checkoutUrl)
  }

  return (
    <button onClick={handlePurchase} className={cn('btn btn-primary', className)}>
      {children || 'Acheter'}
    </button>
  )
}
