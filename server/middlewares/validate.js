import { z } from 'zod';

// Schema for POST /api/requests
export const submitRequestSchema = z.object({
  rawText: z
    .string({ required_error: 'rawText is required' })
    .min(10, 'Request description must be at least 10 characters long.'),
  requesterId: z
    .string({ required_error: 'requesterId is required' })
    .uuid('requesterId must be a valid UUID.')
});

// Schema for PATCH /api/tasks/:id/status
export const updateTaskSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED'], {
    errorMap: () => ({ message: 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED, ESCALATED' })
  })
});

/**
 * Generic Zod validation middleware factory
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(err);
    }
  };
}
