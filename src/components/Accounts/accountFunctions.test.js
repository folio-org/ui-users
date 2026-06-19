import account from 'fixtures/account';

import {
  count,
  calculateSelectedAmount,
  loadServicePoints,
  accountRefundInfo,
  calculateTotalPaymentAmount,
  calculateOwedFeeFines,
  isCancelAllowed,
  deleteOptionalActionFields,
} from './accountFunctions';
import {
  cancelledStatus,
  paymentStatusesAllowedToRefund,
} from '../../constants';


const tempArray = [{
  name: 'test'
}, {
  name: 'test2'
}];

describe('Account Functions', () => {
  it('If count works', async () => {
    const data = count(tempArray);
    expect(data.length).toBe(2);
  });
  it('If calculateSelectedAmount works', async () => {
    const data = calculateSelectedAmount([account], true);
    expect(data).toBe('90.00');
  });
  it('If loadServicePoints works', async () => {
    const owners = [
      {
        id: 'a152c90d-e94d-4784-ab4f-4208a0672673',
        metadata: {
          createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
          createdDate: '2021-12-27T12:08:53.639+00:00',
          updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
          updatedDate: '2021-12-27T12:09:22.973+00:00',
        },
        owner: 'TestOwner',
        defaultActionNoticeId: 'test123id',
        servicePointOwner: [
          {
            label: 'Online',
            value: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
          },
          {
            label: 'Circ 1',
            value: '6f7577f6-5acf-4cd1-9470-54b40153c1d7',
          }
        ]
      },
      {
        id: '6f7577f6-5acf-4cd1-9470-54b40153c1d7',
        metadata: {
          createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
          createdDate: '2021-12-27T12:08:53.639+00:00',
          updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
          updatedDate: '2021-12-27T12:09:22.973+00:00',
        },
        owner: 'test1',
        servicePointOwner: []
      }
    ];
    const values = {
      owners,
      defaultServicePointId: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
      servicePointsIds: ['7c5abc9f-f3d7-4856-b8d7-6712462ca007'],
    };
    const values1 = {
      owners,
      defaultServicePointId: '-',
      servicePointsIds: ['7c5abc9f-f3d7-4856-b8d7-6712462ca007'],
    };
    const values2 = {
      owners,
      defaultServicePointId: '-',
      servicePointsIds: ['7c5abc9f-f3d7-4856-b8d7-6712462ca007', '6f7577f6-5acf-4cd1-9470-54b40153c1d7'],
    };
    const ownerId = loadServicePoints(values);
    const ownerId1 = loadServicePoints(values1);
    const ownerId2 = loadServicePoints(values2);
    expect(ownerId).toBe('a152c90d-e94d-4784-ab4f-4208a0672673');
    expect(ownerId1).toBe('a152c90d-e94d-4784-ab4f-4208a0672673');
    expect(ownerId2).toBe('a152c90d-e94d-4784-ab4f-4208a0672673');
  });

  describe('accountRefundInfo', () => {
    const userAccount = {
      id: 'id',
      amount: 100,
      remaining: 20,
      paymentStatus: {
        name: '',
      },
    };

    describe('when "feeFineActions" is empty', () => {
      it('should return correct fee/fine information', () => {
        const expectedResult = {
          isCanceledAfterRefund: false,
          hasBeenPaid: false,
          paidAmount: 80,
        };
        const result = accountRefundInfo(userAccount);

        expect(result).toEqual(expectedResult);
      });
    });

    describe('when "feeFineActions" is not empty', () => {
      it('should return correct fee/fine information', () => {
        const expectedResult = {
          isCanceledAfterRefund: false,
          hasBeenPaid: true,
          paidAmount: 80,
        };
        const feeFineActions = [{
          accountId: userAccount.id,
          typeAction: paymentStatusesAllowedToRefund[0],
        }];
        const result = accountRefundInfo(userAccount, feeFineActions);

        expect(result).toEqual(expectedResult);
      });
    });

    describe('when remaining amount equals 0 and fee/fine was cancelled', () => {
      it('should return correct fee/fine information', () => {
        const expectedResult = {
          isCanceledAfterRefund: true,
          hasBeenPaid: true,
          paidAmount: 100,
        };
        const feeFineActions = [{
          accountId: userAccount.id,
          typeAction: paymentStatusesAllowedToRefund[0],
        }];
        const result = accountRefundInfo({
          ...userAccount,
          remaining: 0,
          paymentStatus: {
            name: cancelledStatus,
          },
        }, feeFineActions);

        expect(result).toEqual(expectedResult);
      });
    });

    describe('hasBeenPaid via account.paymentStatus.name', () => {
      it.each(paymentStatusesAllowedToRefund)(
        'should set hasBeenPaid to true when paymentStatus.name is "%s" and feeFineActions is empty',
        (statusName) => {
          const result = accountRefundInfo({
            ...userAccount,
            paymentStatus: { name: statusName },
          });

          expect(result.hasBeenPaid).toBe(true);
        }
      );

      it('should set hasBeenPaid to true when paymentStatus.name is in the allowed list and feeFineActions have no matching typeAction', () => {
        const feeFineActions = [{
          accountId: userAccount.id,
          typeAction: 'Waived fully',
        }];
        const result = accountRefundInfo({
          ...userAccount,
          paymentStatus: { name: paymentStatusesAllowedToRefund[1] },
        }, feeFineActions);

        expect(result.hasBeenPaid).toBe(true);
      });

      it('should set hasBeenPaid to false when paymentStatus.name is not in the allowed list and feeFineActions is empty', () => {
        const result = accountRefundInfo({
          ...userAccount,
          paymentStatus: { name: 'Outstanding' },
        });

        expect(result.hasBeenPaid).toBe(false);
      });

      it('should set hasBeenPaid to false when paymentStatus is undefined', () => {
        const result = accountRefundInfo({
          ...userAccount,
          paymentStatus: undefined,
        });

        expect(result.hasBeenPaid).toBe(false);
      });
    });

    describe('hasBeenPaid via feeFineActions (hasBeenPaidByActions)', () => {
      it.each(paymentStatusesAllowedToRefund)(
        'should set hasBeenPaid to true when feeFineAction typeAction is "%s"',
        (typeAction) => {
          const feeFineActions = [{ accountId: userAccount.id, typeAction }];
          const result = accountRefundInfo(userAccount, feeFineActions);

          expect(result.hasBeenPaid).toBe(true);
        }
      );

      it('should set hasBeenPaid to false when feeFineAction typeAction is not in the allowed list', () => {
        const feeFineActions = [{
          accountId: userAccount.id,
          typeAction: 'Waived fully',
        }];
        const result = accountRefundInfo(userAccount, feeFineActions);

        expect(result.hasBeenPaid).toBe(false);
      });

      it('should not count feeFineActions that belong to a different accountId', () => {
        const feeFineActions = [{
          accountId: 'different-account-id',
          typeAction: paymentStatusesAllowedToRefund[0],
        }];
        const result = accountRefundInfo(userAccount, feeFineActions);

        expect(result.hasBeenPaid).toBe(false);
      });

      it('should set hasBeenPaid to true when at least one feeFineAction matches typeAction among multiple actions', () => {
        const feeFineActions = [
          { accountId: userAccount.id, typeAction: 'Waived fully' },
          { accountId: userAccount.id, typeAction: paymentStatusesAllowedToRefund[2] },
          { accountId: userAccount.id, typeAction: 'Refunded fully' },
        ];
        const result = accountRefundInfo(userAccount, feeFineActions);

        expect(result.hasBeenPaid).toBe(true);
      });

      it('should set hasBeenPaid to true when both hasBeenPaidByActions and paymentStatus.name indicate payment', () => {
        const feeFineActions = [{
          accountId: userAccount.id,
          typeAction: paymentStatusesAllowedToRefund[0],
        }];
        const result = accountRefundInfo({
          ...userAccount,
          paymentStatus: { name: paymentStatusesAllowedToRefund[3] },
        }, feeFineActions);

        expect(result.hasBeenPaid).toBe(true);
      });
    });
  });

  it('If calculateTotalPaymentAmount works', async () => {
    const data = calculateTotalPaymentAmount([account]);
    expect(data).toBe(0);
  });
  it('If calculateOwedFeeFines works', async () => {
    const data = calculateOwedFeeFines([account]);
    expect(data).toBe(10);
  });
  it('If isCancelAllowed works', async () => {
    const data = isCancelAllowed(account);
    expect(data).toBeFalsy();
  });
  it('If deleteOptionalActionFields works', async () => {
    const fields = ['tempField'];
    const action = {
      'tempField': {},
      'tempField2': {}
    };
    const data = deleteOptionalActionFields(fields, action);
    expect(data).toBeUndefined();
  });
});

