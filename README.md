# zwe-test

Simple testing framework for `zwe` command

## Requirements
* z/OS 2.5+
* Unix system services
* Existing `zowe.runtimeDirectory`
  * Convenience build

## Start

Clone this repository to `uss`.

## Initialization

You need to set environment variable `ZWET_ZOWE_RUNTIME_DIRECTORY=/path/to/zowe/runtime`, there are several options:
* Update `zwe-test.conf` file
* Add this variable to your shell profile
* Start the script with export, for example `export ZWET_ZOWE_RUNTIME_DIRECTORY=/path/to/zowe/runtime && ./run_test.sh`

## Verify zwe-test

Run `run_test.sh`, there are 2 tests: help for `zwe` command and `helloWorld.js` script.
If you can see the help and `Hello, world!`, everything was set correctly.

## Adding new tests

### Test cases

`testCases.js` is used for defining the tests.

```javascript
export const ALL = {
    // This is the default test
    zweHelp: {
        expected: 100,
        parms: '--help'
    },
    zweInstallExample: {
        desc: 'zwe install',
        environment: [
            [ 'NODE_HOME', '' , env.KEEP ]
        ],
        expected: {
            rc: 0,
            substr: [
                'Install Zowe MVS data sets',
                'Zowe MVS data sets are installed successfully.'
                ]
        },
        parms: `install -c ${misc.makeYaml('install', yaml.INSTALL)}`,
        after: {
            listDS: 'ZOWE.TEST.*'
        }
    }
};
```

#### Supported
* `desc` - description of a test
* `before` and `after` actions
  * `listDS`, `listMB`, `deleteDS`, `allocJCL`, `allocLoad` and `shellCmd`
    * _Note: `deleteDS` supports `MASK`_
* `environment` variables, keep, restore or unset at the end of the current test
* `expected` - if omitted, it is expected `rc=0`
  * `rc` - return code
  * `substr` - substring to be found
  * `substrx` - substring NOT to be found
  * `out` - entire output to match
* `parms` of the `zwe` command, `parms: "install --ds-prefix ZOWE --trace"`
* `script` - path to the script, which will be executed by `configmgr`

