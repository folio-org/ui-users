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
  isLocal = false,
}) => {
  const dynamicModuleMap = {
    '@folio/stripes/components': () => import('@folio/stripes/components'),
    '@folio/service-interaction': () => import('@folio/service-interaction'),
  };


  const Component = lazy(() => {
    let importFunc;
    if (isLocal) {
      importFunc = () => import(importString);
    } else {
      importFunc = dynamicModuleMap[importString];
    }

    return importFunc()
      .then(importSuccess)
      .catch(importError);
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
  isLocal: PropTypes.bool,
  suppressConsoleErrors: PropTypes.bool,
};

export default ConditionalLoad;
