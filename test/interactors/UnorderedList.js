import { createInteractor } from '@bigtest/interactor';

export default createInteractor('ul')({
  selector: 'ul',
  filters: {
    itemCount: element => element.childElementCount
  }
});
