import { createBrowser, createBrowserPage } from '../puppeteer';
import loginAdapter from './login';
import {
  maybeTestCompanyAPI, extendAsyncTimeout, getTestsConfig,
  getDistFolder, saveAccountsAsCSV,
} from '../../../tests/tests-utils';
import scrapeTransactionsAdapter from './scrape-transactions';
import runner from '../runner';

const COMPANY_ID = 'leumi';
const TEST_CATEGORY = 'transactions';
const testsConfig = getTestsConfig();

describe('Leumi scrape transactions', () => {
  beforeAll(() => {
    extendAsyncTimeout(); // The default timeout is 5 seconds per async test, this function extends the timeout value
  });

  maybeTestCompanyAPI(COMPANY_ID, TEST_CATEGORY)('should scrape transactions', async () => {
    const options = {
      onProgress: (name, status) => {
        console.log(`[${name}] ${status}`);
      },
    };

    const result = await runner(options,
      [
        createBrowser({
          verbose: true,
          showBrowser: true,
        }),
        createBrowserPage(),
        loginAdapter({
          credentials: testsConfig.credentials.leumi,
        }),
        scrapeTransactionsAdapter({}),
      ]);


    if (!result.success) {
      throw new Error(result.errorMessage);
    }
    const csvDistFolder = getDistFolder(TEST_CATEGORY);
    saveAccountsAsCSV(csvDistFolder, COMPANY_ID, result.data.leumi.transactions.accounts || []);
  });
});
