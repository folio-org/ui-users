import baseConfig from './config';
import * as serializers from './serializers';
import * as models from './models';
import * as factories from './factories';

export default function createConfig(options) {
  return {
    baseConfig() {
      return baseConfig.call(this, { permissions: options });
    },
    serializers,
    models,
    factories
  };
}
