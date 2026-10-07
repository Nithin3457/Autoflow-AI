import { Router } from 'express';
import { createRequest, getRequests, getRequestById } from '../controllers/requestController.js';
import { validateBody, submitRequestSchema } from '../middlewares/validate.js';

const router = Router();

router.post('/', validateBody(submitRequestSchema), createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);

export default router;
