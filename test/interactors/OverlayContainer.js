import { createInteractor } from '@bigtest/interactor';

export default createInteractor('overlay container')({
  selector: '#OverlayContainer',
  filters: {
    modal: element => !!element.querySelector('[role=dialog]')
  }
});
