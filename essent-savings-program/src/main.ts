import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Account } from './account';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Initialize local cache
const accounts: Account[] = [];

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
  };

  // Store accounts in local cache
  accounts.push(newAccount);

  return res.status(200).json(newAccount);
});

// Implementation to get all accounts
app.get('/accounts', (req, res) => {
  res.status(201).json(accounts);
});

// Implementation to retrieve account by account id
app.get('/accounts/:accountId', (req, res) => {
  const { accountId } = req.params;
  const account = accounts.find((acc) => acc.id === accountId);

  if (!account) {
    return res.status(404).send();
  }
  return res.status(200).json(account);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
