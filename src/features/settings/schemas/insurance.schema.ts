import { z } from 'zod'

export const insuranceSchema = z.object({
  insurerName: z.string().optional(),
  policyNumber: z.string().optional(),
  coverageZone: z.string().optional(),
})
