const products = [
  {
    id: 'solar',
    title: 'Solar Panel',
    description: 'Super duper Essent solar panel',
    stock: 10,
    price: 750,
    saleDays: [],
  },
  {
    id: 'insulation',
    title: 'Insulation',
    description: 'Cavity wall insulation',
    stock: 10,
    price: 2500,
    saleDays: [],
  },
  {
    id: 'heatpump',
    title: 'Awesome Heatpump',
    description: 'Hybrid heat pump',
    stock: 3,
    price: 5000,
    saleDays: [],
  },
];

export default products;

export interface Product {
  id: string;
  title: string;
  description: string;
  stock: number;
  price: number;
  saleDays?: number[];
}
