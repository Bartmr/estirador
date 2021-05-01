require('ts-node/register/transpile-only');
require('tsconfig-paths/register');

require('../../src/internals/environment/load-environment-variables');
require('../../test-environment-impl/base/set-tests-global-setup-process-context');
