const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  assignedTo: z.string().min(1, 'Assigned student is required'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
  internship: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'reviewed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
  feedback: z.string().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema };
