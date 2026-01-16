import { z } from 'zod'

import { apiSchema } from './schemas/api.schema'
import { bankingSchema } from './schemas/banking.schema'
import { companySchema } from './schemas/company.schema'
import { discountsSchema } from './schemas/discounts.schema'
import { insuranceSchema } from './schemas/insurance.schema'
import { productsSchema } from './schemas/products.schema'
import { templateInfoSchema } from './schemas/template.schema'
import { termsSchema } from './schemas/terms.schema'

export const settingsSchema = z.object({
  company: companySchema,
  banking: bankingSchema,
  insurance: insuranceSchema,
  terms: termsSchema,
  api: apiSchema,
  products: productsSchema,
  discounts: discountsSchema,
  template: templateInfoSchema,
})

export type SettingsFormData = z.infer<typeof settingsSchema>
