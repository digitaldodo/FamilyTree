// Tree Validation Schemas
// TODO: Implement with Zod when added as dependency

// Placeholder validation rules
export const treeValidation = {
  name: { required: true, minLength: 1, maxLength: 200 },
  description: { maxLength: 2000 },
};

// TODO: Replace with Zod schema
// export const createTreeSchema = z.object({ ... });
// export const updateTreeSchema = z.object({ ... });
