import { Router } from 'express';
import { getTasks, updateTaskStatus } from '../controllers/taskController.js';
import { validateBody, updateTaskSchema } from '../middlewares/validate.js';

const router = Router();

router.get('/', getTasks);
router.patch('/:id/status', validateBody(updateTaskSchema), updateTaskStatus);

export default router;
