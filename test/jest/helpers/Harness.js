import { IntlProvider } from 'react-intl';
import { Router as DefaultRouter } from 'react-router-dom';
import {
  QueryClientProvider,
  QueryClient,
} from 'react-query';
import noop from 'lodash/noop';
import { createMemoryHistory } from 'history';

import {
  CalloutContext,
  StripesContext,
} from '@folio/stripes/core';

import { buildStripes } from '../__mock__/stripesCore.mock';
import translationsProperties from './translationProperties';

const STRIPES = buildStripes();
const defaultHistory = createMemoryHistory();
const client = new QueryClient();

const _translations = translationsProperties.reduce((acc, { prefix, translations }) => {
  Object.keys(translations).forEach(key => {
    acc[`${prefix}.${key}`] = translations[key];
  });

  return acc;
}, {});

const Harness = ({
  Router = DefaultRouter,
  stripes = STRIPES,
  history = defaultHistory,
  children,
}) => {
  const defaultRichTextElements = ['b', 'i', 'em', 'strong', 'span', 'div', 'p', 'ul', 'ol', 'li', 'code'].reduce((res, Tag) => {
    res[Tag] = chunks => <Tag>{chunks}</Tag>;

    return res;
  }, {});

  return (
    <QueryClientProvider client={client}>
      <CalloutContext.Provider value={{ sendCallout: noop }}>
        <StripesContext.Provider value={stripes}>
          <Router history={history}>
            <IntlProvider
              locale="en"
              key="en"
              timeZone="UTC"
              onWarn={noop}
              onError={noop}
              defaultRichTextElements={defaultRichTextElements}
              messages={_translations}
            >
              {children}
            </IntlProvider>
          </Router>
        </StripesContext.Provider>
      </CalloutContext.Provider>
    </QueryClientProvider>
  );
};

export default Harness;
