import { createInteractor } from '@bigtest/interactor';
import Button from './Button';

export default createInteractor('overlay container')({
  selector: '#OverlayContainer',
  defaultLocator: () => '',
  filters: {
    modal: element => !!element.querySelector('[role=dialog]')
  }
});
