import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Value of type is invalid');
    }

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Outcome value greater than total available');
    }

    const checkCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    let categoryId: string;
    if (!checkCategoryExists) {
      const newCategory = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(newCategory);

      categoryId = newCategory.id;
    } else {
      categoryId = checkCategoryExists.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
