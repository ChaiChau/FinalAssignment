import { Router } from 'express';
import updateInterestRate from '../controllers/InterestController';

const router = Router();

// Route to register new interest rates
router.post('/', updateInterestRate);

export default router;
