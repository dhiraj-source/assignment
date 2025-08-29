import { z } from "zod";

// Step 1: Description
export const basicInfoSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(50, 'Name must be less than 50 characters'),
  brand: z.string().min(2, 'Brand must be at least 2 characters').max(100, 'Brand must be less than 100 characters'),
  category: z.string().min(1, 'Please select a category'),
  image: z.string().url('Please provide a valid image URL'), 
});

// Step 2: Variants
export const variantOptionSchema = z.object({
  name: z.string().min(1, 'Option can’t be empty'),
  values: z.array(z.string().min(1, 'Value cannot be empty')).min(1, 'At least one value is required'),
});

// Step 3: Combinations
// export const combinationSchema = z.object({
//   name: z.string().min(1, 'Combination name is required'),
//   sku: z.string().min(1, 'SKU is required'),
//   quantity: z.number().int().min(1, 'Quantity must be 0 or greater').nullable(),
//   inStock: z.boolean().optional()
// });


export const combinationSchema = z.object({
  name: z.string().min(1, 'Combination name is required'),
  sku: z.string().min(1, 'SKU is required'),
  inStock: z.boolean(),
  quantity: z.number().nullable(), // allow null initially
}).superRefine((data, ctx) => {
  if (data.inStock && (data.quantity === null || data.quantity === undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter the quantity',
      path: ['quantity'], 
    });
  }
});


// // Step 4: Price Info
// export const pricingInventorySchema = z.object({
//   priceInr: z.number().min(0.01, 'Price must be greater than 0'),
//   discount: z.object({
//     method: z.enum(['pct', 'flat']),
//     value: z.number().min(0, 'Discount value must be positive')
//   }).optional(),
// });

export const pricingInventorySchema = z.object({
  priceInr: z
    .number()
    .refine(val => !isNaN(val), { message: 'Price is required' })
    .min(0.01, 'Price must be greater than 0'),
  discount: z
    .object({
      method: z.enum(['pct', 'flat']),
      value: z.number().min(0, 'Discount value must be positive')
    })
    .optional(),
});

// Removed image from here, only keeping status
export const mediaDetailsSchema = z.object({
  status: z.enum(['published', 'draft']),
});

// Category schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name must be less than 50 characters'),
});

// 🔥 Complete product schema
export const completeProductSchema = basicInfoSchema
  .merge(pricingInventorySchema)
  .merge(mediaDetailsSchema)
  .extend({
    variants: z.array(variantOptionSchema),
    combinations: z.array(combinationSchema),
  });

// ✅ Types
export type BasicInfoForm = z.infer<typeof basicInfoSchema>;
export type PricingInventoryForm = z.infer<typeof pricingInventorySchema>;
export type MediaDetailsForm = z.infer<typeof mediaDetailsSchema>;
export type CompleteProductForm = z.infer<typeof completeProductSchema>;
export type CategoryForm = z.infer<typeof categorySchema>;
