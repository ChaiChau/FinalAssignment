import { Router } from 'express';
import * as AccountController from '../controllers/AccountController';

const router = Router();

// Route to create a new account
router.post('/', AccountController.createAccount);

// Route to get all accounts
router.get('/', AccountController.getAllAccounts);

// Route to get a specific account by ID
router.get('/:accountId', AccountController.getAccountById);

// Route to register a deposit to a specific account
router.post('/:accountId/deposits', AccountController.registerDeposit);

// Route to register a product purchase for a specific account
router.post('/:accountId/purchases', AccountController.registerPurchase);

export default router;
