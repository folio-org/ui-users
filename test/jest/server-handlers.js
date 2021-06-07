import { rest } from 'msw'; // msw supports graphql too!

const handlers = [
  rest.get(
    'https://folio-testing-okapi.dev.folio.org/bl-users/by-id/74d6a937-c17d-4045-b294-ab7458988a33/open-transactions',
    async (req, res, ctx) => {
      const { userId } = req.params;
      const hasNoOpenTransactions = {
        'userId' : userId,
        'hasOpenTransactions' : false,
        'loans' : 0,
        'requests' : 0,
        'feesFines' : 0,
        'proxies' : 0,
        'blocks' : 0
      };

      return res(ctx.json(hasNoOpenTransactions));
    }
  ),
  rest.get(
    'https://folio-testing-okapi.dev.folio.org/bl-users/by-id/:userId/open-transactions',
    async (req, res, ctx) => {
      const { userId } = req.params;
      const hasOpenTransactions = {
        'userId' : userId,
        'hasOpenTransactions' : true,
        'loans' : 0,
        'requests' : 0,
        'feesFines' : 0,
        'proxies' : 0,
        'blocks' : 2
      };

      return res(ctx.json(hasOpenTransactions));
    }
  ),
];

export default handlers;
