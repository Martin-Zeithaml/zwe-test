import * as yaml from './yamlFiles';
import * as misc from './lib/misc';
import * as print from './lib/print';
import * as env from './lib/env'

const EXAMPLE = {
    test1: {
        desc: "Description of the test scenario",
        environment: [
            [ 'ZWE_CLI_PARAMETER_CONFIG', `${print.wrap('./file', 'ZOWE.PARMLIB(XYZ)')}`, env.KEEP ],   // Keep env for next text
            [ 'NODE_HOME', '/dev/null', env.RESTORE ]                                                   // Restore to original value
        ],
        before: {
            listMB: 'ZOWE.PARMLIB',                             // List memnbers
            deleteDS: 'ZOWE.TMP',                               // Delete
            shellCmd: 'cat ./zowe.yaml && echo "Hello, world"'  // Shell command
        },
        expected: {
            rc: 123,                      // If not specified => 0
            out: 'File not found',        // Entire output
            substr: ['To be found 1', 'To be found 2'],             // Substring in output
            substrx: ['Not to be found 1', 'Not to be found 2']     // Substring not in output
        },
        parms: `init -c "${print.wrapAndEscape('./file$1', './file$2')}"`,   // Parameters, wrapAndEscape will escape \$
        after: {
            listMB: 'ZOWE.SZWESAMP',
            deleteDS: 'ZOWE.TMP',
            shellCmd: 'rm ./zowe.yaml'
        }
    }
}

export const ALL = {
    zweHelp: {
        expected: 100,
        parms: '--help'
    }
};
