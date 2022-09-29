import { screen } from '@testing-library/react';
import '__mock__/stripesComponents.mock';
import UserLoans from './UserLoans';
import renderWithRouter from 'helpers/renderWithRouter';
const toggleMock = jest.fn();
jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');
const renderUserLoans = (props) => renderWithRouter(<UserLoans {...props} />);


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


