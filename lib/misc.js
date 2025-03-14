import * as print from './print';

import * as shell from './.zwe-test-zowe.runtimeDirectory/bin/libs/shell'

export const SEVERITY_NUM = { INFO: 0, OTHER: 1, ERROR: 2 }

export function shellCmd(cmd) {
    if (cmd) {
        print.debug('misc.shellCmd', `${cmd}`);
        const result = shell.execOutSync('sh', '-c', `${cmd} 2>&1`);
        print.debug('misc.shellCmd', result.rc + "\n" + result.out + "\n");
    }
}

export function subStringInResult(expected, included, output, testResults, counter, printMsg) {
    if (expected) {
        const INCLUDED_INFO = included == true ? SEVERITY_NUM.INFO : SEVERITY_NUM.ERROR;
        const INCLUDED_ERROR = included == true ? SEVERITY_NUM.ERROR : SEVERITY_NUM.INFO;
        let expectedArray = [];
        if (Array.isArray(expected)) {
            expectedArray = expected;
        } else {
            expectedArray[0] = expected;
        }
        for (let str in expectedArray) {
            if (output.includes(expectedArray[str])) {
                testResults.push(print.formatMsg(INCLUDED_INFO, printMsg, counter, `'${expectedArray[str]}' found`, ''));
            } else {
                testResults.push(print.formatMsg(INCLUDED_ERROR, printMsg, counter, `'${expectedArray[str]}' not found`, ''));
            }
        }
    }
}