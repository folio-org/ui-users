import { createInteractor } from '@bigtest/interactor';

export default createInteractor('overlay container')({
  selector: '#OverlayContainer',
  defaultLocator: () => '',
  filters: {
    modal: element => !!element.querySelector('[role=dialog]')
  }
});
