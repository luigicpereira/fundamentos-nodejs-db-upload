import path from 'path';
import csvParse from 'csv-parse';
import fs from 'fs';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  transactionsFilename: string;
}

interface TransactionData {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ transactionsFilename }: Request): Promise<Transaction[]> {
    const transactionsCSVPath = path.join(
      uploadConfig.directory,
      transactionsFilename,
    );

    const readCSVStream = fs.createReadStream(transactionsCSVPath);

    const parseStream = csvParse({
      delimiter: ',',
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const parsedTransactions: TransactionData[] = [];

    parseCSV.on('data', row => {
      const [title, type, value, category] = row;
      parsedTransactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransactionService = new CreateTransactionService();

    const transactions: Transaction[] = [];

    for (const parsedTransaction of parsedTransactions) {
      const transaction = await createTransactionService.execute(
        parsedTransaction,
      );

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
