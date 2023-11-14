import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import { productList } from '../datastore';
import { Product } from '../models/products';
import sendErrorResponse from '../utils/Utilities';

export const filtertProductById = (productId: string): Product | undefined =>
  // eslint-disable-next-line implicit-arrow-linebreak
  productList.find((product) => product.id === productId);

export const getAllProducts = (req: Request, res: Response) => {
  try {
    const simulatedDay = Number(req.get('Simulated-Day'));

    let presentProducts: Product[] = [];

    presentProducts = cloneDeep(productList);

    const updatedProducts: Product[] = presentProducts.map((prod) => {
      let soldStock = 0;
      prod.saleDays.forEach((day) => {
        if (day <= simulatedDay) {
          soldStock += 1;
        }
      });
      // eslint-disable-next-line no-param-reassign
      delete prod.saleDays;

      return {
        ...prod,
        stock: prod.stock - soldStock,
      };
    });

    return res.status(200).json(updatedProducts);
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};

export const getProductById = (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    let currentProducts: Product[] = [];
    currentProducts = cloneDeep(productList);

    const product = currentProducts.find((p) => p.id === productId);

    if (!product) {
      return sendErrorResponse(res, 404);
    }

    let soldStock = 0;
    product.saleDays.forEach((day) => {
      if (day <= Number(req.get('Simulated-Day'))) {
        soldStock += 1;
      }
    });
    delete product.saleDays;

    const updatedProduct = {
      ...product,
      stock: product.stock - soldStock,
    };

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};

export const addProduct = (req: Request, res: Response) => {
  try {
    const {
      title, description, price, stock,
    } = req.body;

    if (!title || !description || !price || !stock) {
      return sendErrorResponse(res, 400);
    }

    const existingProduct = productList.find((p) => p.title === title);
    if (existingProduct) {
      return sendErrorResponse(res, 400);
    }

    const newProduct: Product = {
      id: uuidv4(),
      title,
      description,
      stock,
      price,
      saleDays: [],
    };

    productList.push(newProduct);

    let newProductList: Product[] = [];
    newProductList = cloneDeep(productList);

    const responseProducts = newProductList.map((prod) => ({
      id: prod.id,
      title: prod.title,
      description: prod.description,
      price: prod.price,
      stock: prod.stock,
    }));

    return res.status(201).json(responseProducts);
  } catch (error) {
    return sendErrorResponse(res, 500);
  }
};
