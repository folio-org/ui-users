import { screen } from '@testing-library/react';
import '__mock__/stripesComponents.mock';
import UserLoans from './UserLoans';
import renderWithRouter from 'helpers/renderWithRouter';
const toggleMock = jest.fn();
jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');
const renderUserLoans = (props) => renderWithRouter(<UserLoans {...props} />);

const mutator = {
  loansHistory: {
    DELETE: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
  }
};

const notEmptyRecords = [{
  loanId: 'b6475706-4505-4b20-9ed0-aadcda2b72ee',
  amount: 25,
  barcode: '10101',
  callNumber: 'TK5105.88815 . A58 2004 FT MEADE Copy 2',
  contributors: [],
  feeFineId: '9d4e45a9-e2bc-4105-83cd-2caef09157b5',
  feeFineOwner: 'MyO',
  feeFineType: 'MyFF',
  holdingsRecordId: 'e3ff6133-b9a2-4d4c-a1c9-dc1867d4df19',
  id: 'e0a8cfcf-4939-4815-9217-4032121edafb',
  instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
  itemId: '7212ba6a-8dcf-45a1-be9a-ffaa847c4423',
  location: 'Main Library',
  materialType: 'book',
  materialTypeId: '1a54b431-2e4f-452d-9cae-9cee66c9a892',
  metadata: {
    createdDate: '2022-06-06T07:25:37.639+00:00',
    createdByUserId: 'd784470b-2e2d-528d-9641-b81fd924a4a8',
    updatedDate: '2022-06-06T07:26:37.032+00:00',
    updatedByUserId: 'd784470b-2e2d-528d-9641-b81fd924a4a8'
  },
  ownerId: 'f5fe5c18-fa38-4e1b-b65d-1b214f736987',
  paymentStatus: { name: 'Cancelled as error' },
  remaining: 0,
  status: { name: 'Closed' },
  title: 'A semantic web primer',
  userId: 'bec20636-fb68-41fd-84ea-2cf910673599',
  totalRecords:1
},
{ loanId: 'b6475706-4505-4b20-9ed0-aadcda2b72ee',
  amount: 25,
  barcode: '10101',
  callNumber: 'TK5105.88815 . A58 2004 FT MEADE Copy 2',
  contributors: [],
  feeFineId: '9d4e45a9-e2bc-4105-83cd-2caef09157b5',
  feeFineOwner: 'MyO',
  feeFineType: 'MyFF',
  holdingsRecordId: 'e3ff6133-b9a2-4d4c-a1c9-dc1867d4df19',
  id: 'e0a8cfcf-4939-4815-9217-4032121edafb',
  instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
  itemId: '7212ba6a-8dcf-45a1-be9a-ffaa847c4423',
  location: 'Main Library',
  materialType: 'book',
  materialTypeId: '1a54b431-2e4f-452d-9cae-9cee66c9a892',
  metadata: {
    createdDate: '2022-06-06T07:25:37.639+00:00',
    createdByUserId: 'd784470b-2e2d-528d-9641-b81fd924a4a8',
    updatedDate: '2022-06-06T07:26:37.032+00:00',
    updatedByUserId: 'd784470b-2e2d-528d-9641-b81fd924a4a8'
  },
  ownerId: 'f5fe5c18-fa38-4e1b-b65d-1b214f736987',
  paymentStatus: { name: 'Cancelled as error' },
  remaining: 0,
  status: { name: 'Closed' },
  title: 'A semantic web primer',
  userId: 'bec20636-fb68-41fd-84ea-2cf910673599',
  totalRecords:1 }
];

  function props(expanded,pending, claimedReturnedCount) {
  return {
    accordionId: 'userLoansSection',
    expanded: expanded,
    onToggle: toggleMock,
    match:  { params: { id: 'mock-match-params-id' } },
    location: {
       seacrh : 'mention any string',
       pathname: 'mentionAnyOfTheString'
    },
    resources: {
      closedLoansCount:{
        resource: 'closedLoansCount',
        isPending: pending,
        records: [
          {
            loans: [{
              fulfilmentPreference: 'Hold Shelf',
              id: '9b120742-bd00-43db-9b72-477902f5cec7',
              instance: { title: 'A semantic web primer' },
              instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
              pickupServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
              position: 6,
              loanDate: '2022-05-16T07:25:44.000+00:00',
              loanLevel: 'Title',
              loanType: 'Hold',
              loanId: '578a8413-dec9-4a70-a2ab-10ec865399f6',
              status: 'Open - Not yet filled'
            }],
            totalRecords: 1
          }
        ]
      },
      openLoansCount: {
        resource: 'openLoansCount',
        isPending: pending,
        records: [
          {
            loans: [{
              fulfilmentPreference: 'Hold Shelf',
              id: '9b120742-bd00-43db-9b72-477902f5cec7',
              instance: { title: 'A semantic web primer' },
              instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
              pickupServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
              position: 6,
              loanDate: '2022-05-16T07:25:44.000+00:00',
              loanLevel: 'Title',
              loanType: 'Hold',
              loanId: '578a8413-dec9-4a70-a2ab-10ec865399f6',
              status: 'Open - Not yet filled'
            }],
            totalRecords: 1
          }
        ]
      },
      claimedReturnedCount: {
        resource: 'claimedReturnedCount',
        isPending: pending,
        records: [
          {
            loans: [{
              id: '9b120742-bd00-43db-9b72-477902f5cec7',
              instance: { title: 'A semantic web primer' },
              instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
              pickupServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
              position: 6,
              loanDate: '2022-05-16T07:25:44.000+00:00',
              loanLevel: 'Title',
              loanType: 'Hold',
              loanId: '578a8413-dec9-4a70-a2ab-10ec865399f6',
              status: 'Open - Not yet filled'
            }],
            totalRecords: claimedReturnedCount,
          }
        ]
      },
      loansHistory: {
        records: []
      },
      } 
    }
  
  }

     describe('Render User Loans component', () => {
    it('open accordion, loansLoaded is false', () => {
      renderUserLoans(props(true,true));
      expect(screen.queryByText('ui-users.loans.numOpenLoans')).not.toBeInTheDocument();
    });

    it('open accordion, loansLoaded is true', () => {
      renderUserLoans(props(true,false));
      expect(screen.getByText('ui-users.loans.numOpenLoans')).toBeInTheDocument();
    });

    it('closed accordion, loansLoaded is false', () => {
      renderUserLoans(props(false,true));
      expect(screen.queryByText('ui-users.loans.numOpenLoans')).not.toBeInTheDocument();
    });
     
    it('ClosedLoanCount when closed is true', () => {
      renderUserLoans(props(true,false));
      expect(screen.getByText('ui-users.loans.numClosedLoans')).toBeInTheDocument();
    });

   
    it('claimed return count is > 0', () =>{
      renderUserLoans(props(true,false,1));
      expect(screen.getByText('ui-users.loans.numClaimedReturnedLoans')).toBeInTheDocument();
    })
   

 it('claimed return count is < 0', () =>{
      renderUserLoans(props(true,false,0));
      expect(screen.queryByText('ui-users.loans.numClaimedReturnedLoans')).not.toBeInTheDocument();
    })
  });


