import {
  interactor,
  scoped,
  collection,
} from '@bigtest/interactor';

@interactor class BulkOverrideModal {
  static defaultScope = '#bulk-override-modal';

  dueDatePicker = scoped('[data-test-due-date-picker]');
  callNumbers = collection('[data-test-bulk-override-call-numbers]');
  columnHeaders = collection('div[role="columnheader"]');
}

export default BulkOverrideModal;
