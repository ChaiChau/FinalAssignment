import express from 'express';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Account } from './account';
import products, { Product } from './products';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Initialize local cache
const accounts: Account[] = [];
const productList: Product[] = products;

// Parse incoming json requests
app.use(express.json());

// Implementation to create new accounts
app.post('/accounts', (req, res) => {
  const { name } = req.body;

  // Validate if name is a single word consisting of only alphabets
  const nameRegex = /^[A-Za-z]+$/;

  if (!name || !nameRegex.test(name)) {
    return res.status(400).send();
  }

  // Create a new account
  const newAccount: Account = {
    id: uuidv4(),
    name,
    balance: 0,
    deposits: [],
    purchase: { totalPurchaseCost: 0 },
  };

  // Store accounts in local cache
  accounts.push(newAccount);

  return res.status(200).json({
    id: newAccount.id,
    name: newAccount.name,
    balance: newAccount.balance,
  });
});

// Implementation to get all accounts
app.get('/accounts', (req, res) => {
  const simulatedDay = Number(req.get('Simulated-Day'));

  let updatedAccounts: Account[] = [];

  updatedAccounts = cloneDeep(accounts);

  if (simulatedDay === 0) {
    updatedAccounts.forEach((acc) => {
      acc.balance = 0;
      delete acc.deposits;
      delete acc.purchase;
    });
  }

  if (simulatedDay > 0) {
    updatedAccounts.forEach((acc) => {
      acc.balance = 0;
      acc.deposits.forEach((dep) => {
        if (dep.depositDay <= Number(simulatedDay)) {
          acc.balance += dep.amount;
        }
      });
      delete acc.deposits;
      if (acc.purchase?.lastPurchaseDay <= simulatedDay) {
        acc.balance -= acc.purchase.totalPurchaseCost;
      }
      delete acc.purchase;
    });
  }

  return res.status(201).json(updatedAccounts);
});

// Implementation to retrieve account by account id
app.get('/accounts/:accountId', (req, res) => {
  const { accountId } = req.params;
  const simulatedDay = Number(req.get('Simulated-Day'));
  let accountList: Account[] = [];
  accountList = cloneDeep(accounts);
  const account = accountList.find((acc) => acc.id === accountId);

  if (!account) {
    return res.status(404).send();
  }

  if (simulatedDay === 0) {
    account.balance = 0;
    delete account.deposits;
    delete account.purchase;
  }

  if (simulatedDay > 0) {
    account.balance = 0;
    account.deposits.forEach((dep) => {
      if (dep.depositDay <= Number(simulatedDay)) {
        account.balance += dep.amount;
      }
    });
    delete account.deposits;
    if (account.purchase?.lastPurchaseDay <= simulatedDay) {
      account.balance -= account.purchase.totalPurchaseCost;
    }
    delete account.purchase;
  }

  return res.status(200).json(account);
});

// Implementation to register deposits
app.post('/accounts/:accountId/deposits', (req, res) => {
  const { amount } = req.body;
  const { accountId } = req.params;
  const simulatedDay = Number(req.get('Simulated-Day'));

  const account: Account = accounts.find((acc) => acc.id === accountId);
  if (!account) {
    return res.status(400).send();
  }

  if (account.deposits.find((dep) => dep.depositDay > simulatedDay)) {
    return res.status(400).send();
  }

  const deposit = {
    depositId: uuidv4(),
    depositDay: simulatedDay + 1,
    amount,
  };

  account.deposits.push(deposit);
  account.balance += amount;

  return res.status(201).json({
    depositId: deposit.depositId,
    name: account.name,
    balance: account.balance,
  });
});

// Implementation to register product purchases
app.post('/accounts/:accountId/purchases', (req, res) => {
  const { productId } = req.body;
  const { accountId } = req.params;
  const simulatedDay = Number(req.get('Simulated-Day'));

  const account: Account = accounts.find((acc) => acc.id === accountId);
  const product = products.find((prod) => prod.id === productId);
  if (!account || !product) {
    return res.status(400).send();
  }

  if (product.stock - 1 < 0) {
    return res.status(409).send();
  }

  let bal = 0;
  account.deposits.forEach((dep) => {
    if (dep.depositDay <= Number(simulatedDay)) {
      bal += dep.amount;
    }
  });
  if (bal - product.price - account.purchase.totalPurchaseCost <= 0) {
    return res.status(409).send();
  }

  if (simulatedDay <= account.purchase?.lastPurchaseDay) {
    return res.status(400).send();
  }

  account.balance -= product.price;
  account.purchase.lastPurchaseDay = simulatedDay;
  account.purchase.totalPurchaseCost += product.price;
  product.stock -= 1;

  return res.status(200).send();
});

// Implementation to register products
app.post('/products', (req, res) => {
  // eslint-disable-next-line object-curly-newline
  const { title, description, price, stock } = req.body;

  // Create a new product
  const newProduct: Product = {
    id: uuidv4(),
    title,
    description,
    price,
    stock,
  };

  // Store products in local cache
  productList.push(newProduct);

  return res.status(201).json(productList);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
