import {
  interactor,
  text,
} from '@bigtest/interactor';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor'; // eslint-disable-line

import SelectInteractor from './select-section';

@interactor class NoticeInteractor {
  ownerChargeNotice = new SelectInteractor('#defaultChargeNoticeId');
  ownerActionNotice = new SelectInteractor('#defaultActionNoticeId');
  ownerChargeNoticeValue = text('#defaultChargeNoticeId');
  ownerActionNoticeValue = text('#defaultActionNoticeId');
  primaryButton = new ButtonInteractor('#charge-notice-primary');
  cancelNotice = new ButtonInteractor('#charge-notice-cancel');
}

export default NoticeInteractor;
