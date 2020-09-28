import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store, routes } from '../helpers/server';

import {
  Button,
  Div,
  TableCell,
  TableRowGroup,
  TextField
} from '../interactors';

export default test('patron automated blocks', { permissions: ['automated-patron-blocks.collection.get'] })
  .step('seed data', async () => {
    const user = store.create('user', { id: 'user1' });
    return { user };
  })
  .step('configure routes', async ({ user }) => {
    const patronBlock = {
      automatedPatronBlocks: {
        patronBlockConditionId: '1',
        blockBorrowing: true,
        blockRenewals: false,
        blockRequests: false,
        message: 'Patron has reached maximum allowed number of items charged out'
      },
      totalRecords: 1,
    };
    routes.get(`/automated-patron-blocks/${user.id}`, patronBlock);
  })
  .step(App.visit('/users/view/user1'))
  .assertion(Button('Patron blocks').exists())
  .assertion(TextField.findById('patron-block-place').has({ value: 'Patron has block(s) in place'}))
  .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-patronBlocksSection')
    .find(TableRowGroup())
    .has({ dataRowContainerCount: 1 }))
  .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-patronBlocksSection')
    .find(TableCell('Automated (cannot be edited)', { rowNumber: 0 }))
    .exists())
  .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-patronBlocksSection')
    .find(TableCell('Patron has reached maximum allowed number of items charged out', { rowNumber: 0 }))
    .exists())
  .assertion(Div.findByAriaLabelledBy('accordion-toggle-button-patronBlocksSection')
    .find(TableCell('Borrowing', { rowNumber: 0 }))
    .exists());
