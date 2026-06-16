// Member Validation Schemas
// TODO: Implement with Zod when added as dependency

// Placeholder validation rules
export const memberValidation = {
  firstName: { required: true, minLength: 1, maxLength: 100 },
  lastName: { required: true, minLength: 1, maxLength: 100 },
  bio: { maxLength: 1000 },
  // TODO: Add date validation
  // TODO: Add gender enum validation
};

// TODO: Replace with Zod schema
// export const createMemberSchema = z.object({ ... });
// export const updateMemberSchema = z.object({ ... });
