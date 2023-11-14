import express from 'express';
import accountRoutes from './routes/AccountRoutes';
import productRoutes from './routes/ProductRoutes';
import interestRoutes from './routes/InterestRoutes';

const app = express();
app.use(express.json());

// Rest of your server setup code...
app.use('/accounts', accountRoutes);
app.use('/interest', interestRoutes);
app.use('/products', productRoutes);

// ... rest of the server initialization code ...

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
