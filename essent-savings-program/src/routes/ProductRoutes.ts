import { Router } from 'express';
import * as ProductController from '../controllers/ProductController';

const router = Router();

// Route to get all products
router.get('/', ProductController.getAllProducts);

// Route to get a specific product by ID
router.get('/:productId', ProductController.getProductById);

// Route to add a new product
router.post('/', ProductController.addProduct);

export default router;
