import { rest } from 'msw'; // msw supports graphql too!

const handlers = [
  rest.get(
    'https://folio-testing-okapi.dev.folio.org/bl-users/by-id/84954cee-c6f9-4478-8ebd-80f04bc8571d/open-transactions',
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
