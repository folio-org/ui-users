import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

import { Loading } from '@folio/stripes/components';

// This effectively becomes analogous to Pluggable, except happening at the dependency load stage -- should almost certainly belong to stripes-core
// This protects feature sets such as NumberGenerator, brought in as peer dependencies and therefore present in all platform-core builds, but not necessarily
// in all builds with Users present.
const ConditionalLoad = ({
  children,
  FallbackComponent = () => <div>Feature not available</div>,
  importString,
  importSuccess = m => m,
  suppressConsoleErrors = false,
  importError = err => {
    if (!suppressConsoleErrors) {
      console.error('Cannot import, using fallback component', err);
    }
    return Promise.resolve({ default: FallbackComponent });
  },
}) => {
  const dynamicModuleMap = {
    '@folio/stripes/components': () => import('@folio/stripes/components'),
    '@folio/service-interaction': () => import('@folio/service-interaction'),
  };

  const Component = lazy(() => {
    // Both try/catch and promise catch are necessary here for reasons I don't quite understand, but it triggers in sonar so I'm disabling for now
    try { // NOSONAR
      return dynamicModuleMap[importString]()
        .then(importSuccess)
        .catch(importError);
    } catch (e) {
      return importError(e);
    }
  });


  return (
    <Suspense fallback={<Loading />}>
      {children({ Component })}
    </Suspense>
  );
};

ConditionalLoad.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
  FallbackComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  importString: PropTypes.string.isRequired,
  importSuccess: PropTypes.func,
  importError: PropTypes.func,
  suppressConsoleErrors: PropTypes.bool.isRequired,
};

export default ConditionalLoad;
