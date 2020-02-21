import {
  interactor,
  clickable,
  collection,
} from '@bigtest/interactor';

@interactor class HeaderInteractor {
  selectAll = collection('[class*=mclHeader---]', { click : clickable() });
}

export default HeaderInteractor;
