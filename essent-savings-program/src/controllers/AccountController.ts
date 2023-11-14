import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
// eslint-disable-next-line object-curly-newline
import { accounts, productList, getInterestRateForDay } from '../datastore';
import { Account } from '../models/account';
import sendErrorResponse from '../utils/Utilities';

export const createAccount = (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    // Validate if name is a single word consisting of only alphabets
    const nameRegex = /^[A-Za-z]+$/;
    if (!name || !nameRegex.test(name)) {
      return sendErrorResponse(res, 400);
    }

    // Create and store the new account
    const newAccount: Account = {
      id: uuidv4(),
      name,
      balance: 0,
      deposits: [],
      purchase: { totalPurchaseCost: 0 },
    };

    accounts.push(newAccount);

    return res.status(200).json({
      id: newAccount.id,
      name: newAccount.name,
      balance: newAccount.balance,
    });
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};

const updateAccountBalance = (
  account: Account,
  simulatedDay: number,
): Account => {
  const accountCopy = { ...account, deposits: [...account.deposits] };
  accountCopy.balance = 0;

  accountCopy.deposits.forEach((deposit) => {
    if (deposit.depositDay <= simulatedDay) {
      accountCopy.balance += deposit.amount;
    }
  });

  if (simulatedDay >= 30) {
    const payPeriods = Math.floor(simulatedDay / 30);
    const interestRate = getInterestRateForDay(simulatedDay);
    const accuredInterest = (30 / 365) * interestRate * accountCopy.balance * payPeriods;
    accountCopy.balance += Number(accuredInterest.toFixed(2));
  }

  if (
    accountCopy.purchase
    && accountCopy.purchase.lastPurchaseDay <= simulatedDay
  ) {
    accountCopy.balance -= Number((accountCopy.purchase.totalPurchaseCost).toFixed(2));
    accountCopy.balance = Number(accountCopy.balance.toFixed(2));
  }

  delete accountCopy.deposits;
  delete accountCopy.purchase;

  return accountCopy;
};

export const getAllAccounts = (req: Request, res: Response) => {
  try {
    const simulatedDay = Number(req.get('Simulated-Day'));
    const updatedAccounts = accounts.map((account) => updateAccountBalance(account, simulatedDay));

    return res.status(201).json(updatedAccounts);
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};

const calculateUpdatedBalance = (
  account: Account,
  simulatedDay: number,
): number => {
  let newBalance = 0;
  account.deposits.forEach((deposit) => {
    if (deposit.depositDay <= simulatedDay) {
      newBalance += deposit.amount;
    }
  });

  if (simulatedDay >= 30) {
    const payPeriods = Math.floor(simulatedDay / 30);
    const interestRate = getInterestRateForDay(simulatedDay);
    const accuredInterest = (30 / 365) * interestRate * newBalance * payPeriods;
    newBalance += Number(accuredInterest.toFixed(2));
  }

  if (account.purchase?.lastPurchaseDay <= simulatedDay
  ) {
    newBalance -= account.purchase.totalPurchaseCost;
  }

  newBalance = Number(newBalance.toFixed(2));

  return Number(newBalance.toFixed(2));
};

export const getAccountById = (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const simulatedDay = Number(req.get('Simulated-Day'));
    const latestAccount = accounts.find((acc) => acc.id === accountId);

    if (!latestAccount) {
      return sendErrorResponse(res, 404);
    }

    const accountCopy: Account = cloneDeep(latestAccount);
    accountCopy.balance = calculateUpdatedBalance(accountCopy, simulatedDay);
    delete accountCopy.deposits;
    delete accountCopy.purchase;

    return res.status(200).json(accountCopy);
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};

export const registerDeposit = (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { amount } = req.body;
    const depositDay = Number(req.get('Simulated-Day'));

    const account = accounts.find((acc) => acc.id === accountId);
    if (!account) {
      return sendErrorResponse(res, 404);
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return sendErrorResponse(res, 400);
    }

    if (typeof depositDay !== 'number' || depositDay < 0) {
      return sendErrorResponse(res, 400);
    }

    const newDeposit = {
      depositId: uuidv4(),
      depositDay: depositDay + 1,
      amount,
    };

    account.deposits.push(newDeposit);
    account.balance += amount;

    return res.status(201).json({
      id: newDeposit.depositId,
      name: account.name,
      balance: account.balance,
    });
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};

export const registerPurchase = (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { productId } = req.body;
    const purchaseDay = Number(req.get('Simulated-Day'));

    const account = accounts.find((acc) => acc.id === accountId);
    const product = productList.find((prod) => prod.id === productId);

    if (!account || !product) {
      return sendErrorResponse(res, 404);
    }

    if (product.stock - product.saleDays.length - 1 < 0) {
      return sendErrorResponse(res, 409);
    }

    let balanceAfterDeposit = 0;
    account.deposits.forEach((dep) => {
      if (dep.depositDay <= purchaseDay) {
        balanceAfterDeposit += dep.amount;
      }
    });

    if (purchaseDay >= 30) {
      const payPeriods = Math.floor(purchaseDay / 30);
      const interestRate = getInterestRateForDay(purchaseDay);
      const accruedInterest = (30 / 365) * interestRate * balanceAfterDeposit * payPeriods;
      balanceAfterDeposit += Number(accruedInterest.toFixed(2));
    }

    if (balanceAfterDeposit - product.price < 0) {
      return sendErrorResponse(res, 409);
    }

    if (purchaseDay <= account.purchase?.lastPurchaseDay) {
      return res.status(400).send();
    }

    account.balance = balanceAfterDeposit - product.price;
    account.purchase.lastPurchaseDay = purchaseDay;
    account.purchase.totalPurchaseCost += product.price;
    product.saleDays.push(purchaseDay);

    return res.status(201).json();
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};
