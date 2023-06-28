import getRenewalPatronBlocksFromPatronBlocks from './patronBlocks';

const patronBlocks = [{
  borrowing: true,
  desc: 'Sample',
  id: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',
  patronMessage: '',
  renewals: true,
  requests: true,
  staffInformation: '',
  type: 'Manual',
  userId: 'e6dc87a3-591b-43e0-a768-d3552b44878b',
  metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' }
},
{
  borrowing: false,
  blockRenewals: true,
  desc: 'Test2',
  id: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',
  patronMessage: '',
  renewals: false,
  requests: false,
  staffInformation: '',
  type: 'Manual',
  userId: 'e6dc87a3-591b-43e0-a768-d3552b44878b',
  metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' }
}];


const patronBlocks2 = [{
  borrowing: true,
  desc: 'Sample',
  id: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',
  patronMessage: '',
  renewals: false,
  requests: true,
  staffInformation: '',
  type: 'Manual',
  userId: 'e6dc87a3-591b-43e0-a768-d3552b44878b',
  metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' }
}];


describe('patronBlocks Filter component', () => {
  it('if it filters', () => {
    const data = getRenewalPatronBlocksFromPatronBlocks(patronBlocks);
    expect(data).toStrictEqual(patronBlocks);
  });
  it('if it filters renewal blocked data', () => {
    const data = getRenewalPatronBlocksFromPatronBlocks(patronBlocks2);
    expect(data).toStrictEqual([]);
  });
});
