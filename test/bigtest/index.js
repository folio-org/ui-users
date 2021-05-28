import 'core-js/stable';
import 'regenerator-runtime/runtime';

import turnOffWarnings from './helpers/turn-off-warnings';
import './helpers/monkey-patch-run';

turnOffWarnings();

// require all modules ending in "-test" from the current directory and
// all subdirectories
const requireTest = require.context('./tests/', true, /-test/);
requireTest.keys().forEach(requireTest);
