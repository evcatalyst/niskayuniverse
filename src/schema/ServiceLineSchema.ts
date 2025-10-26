import { z } from 'zod';

export const ServiceLineSchema = z.object({
  id: z.string(),
  address: z.string().min(1),
  town: z.string().optional(),
  zip: z.string().regex(/^\d{5}$/),
  private_type: z.enum(['lead', 'copper', 'galvanized', 'plastic', 'unknown']),
  public_type: z.enum(['lead', 'copper', 'galvanized', 'plastic', 'unknown']),
  verified: z.boolean(),
  confidence: z.number().min(0).max(1),
  last_verified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  position: z.array(z.number()).length(2).optional(), // [longitude, latitude]
});

export type ServiceLineFeature = z.infer<typeof ServiceLineSchema>;