import { interactor } from '@bigtest/interactor';

@interactor class SearchFieldInteractor {
  static defaultScope = '[data-test-user-search-input]';
}

export default SearchFieldInteractor;
