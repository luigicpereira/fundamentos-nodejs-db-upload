import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeTransactions = await this.find({ where: { type: 'income' } });
    const outcomeTransactions = await this.find({ where: { type: 'outcome' } });

    const income = incomeTransactions
      .map(transaction => transaction.value)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

    const outcome = outcomeTransactions
      .map(transaction => transaction.value)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
