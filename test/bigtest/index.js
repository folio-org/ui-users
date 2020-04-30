import 'core-js/stable';
import 'regenerator-runtime/runtime';

import './helpers/monkey-patch-run';

// require all modules ending in "-test" from the current directory and
// all subdirectories
const requireTest = require.context('./tests/', true, /-test/);
requireTest.keys().forEach(requireTest);
