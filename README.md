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

Run `initTemplate.sh` with path to `zowe.runtimeDirectory` as a parameter:
```
$ ./initTemplate.sh /u/charles/zowe/
```

## Verify zwe-test

Run `run_test.sh`, there is one predefined test: help for `zwe` command.
If you can see the help, it was set correctly.

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
            [ 'NODE_HOME', '' , ENV_KEEP]
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
* `environment` variables, keep, restored or unset at the end of the current test
* `expected` - if omitted, it is expected `rc=0`
  * `rc` - return code
  * `substr` - substring to be found
  * `substrx` - substring NOT to be found
  * `out` - entire output to match
* `parms` of the `zwe` command, `parms: "install --ds-prefix ZOWE --trace"`

### YAML

`yaml.js` is used for creating YAML files, it is possible to save it as unix file or member. YAML is created from text, it is up to you to follow YAML syntax (no schema validation).

Corresponding definition for previous test example:

```javascript
export const INSTALL = [
    "zowe:",
    "  setup:",
    "    dataset:",
    "      prefix: ZOWE.TEST"
]
```
