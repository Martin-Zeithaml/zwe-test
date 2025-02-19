import * as std from 'cm_std';
import * as shell from '@RUNTIME@/bin/libs/shell'
import * as testCases from './testCases';
import * as print from './lib/print';
import * as ds from './lib/ds';
import * as misc from './lib/misc';
import * as env from './lib/env';

const RUNTIME = '@RUNTIME@'
const ZWE = `${RUNTIME}/bin/zwe`;
const CONFIGMGR = `${RUNTIME}/bin/utils/configmgr`;
const CONFIGMGR_SCRIPT = `${CONFIGMGR} -script`;
const EXPORT = `export ZWE_PRIVATE_CLI_LIBRARY_LOADED=''`;  // Bypassing the bug
const SEVERITY = { INFO: 0, OTHER: 1, ERROR: 2 }
const PRINT = true;

const TESTS = {
    ...testCases.ALL
}

function subStringInResult(expected, included, result, results, skipCounter) {
    if (expected) {
        const INCLUDED_INFO = included == true ? SEVERITY.INFO : SEVERITY.ERROR;
        const INCLUDED_ERROR = included == true ? SEVERITY.ERROR : SEVERITY.INFO;
        let expectedArray = [];
        if (typeof expected == 'object') {
            expectedArray = expected;
        } else {
            expectedArray[0] = expected;
        }
        for (let str in expectedArray) {
            if (result.out.includes(expectedArray[str])) {
                results.push(print.formatMsg(INCLUDED_INFO, PRINT, skipCounter, `'${expectedArray[str]}' found`, ''));
            } else {
                results.push(print.formatMsg(INCLUDED_ERROR, PRINT, skipCounter, `'${expectedArray[str]}' not found`, ''));
            }
        }
    }
}

let results = [];
const total = Object.keys(TESTS).length;
const totalLength = total.toString().length;
let currentTest = 1;
let afterEnvironment = [];

// For sure, unset ZWE_CLI_PARAMETER_CONFIG
env.exportEnv('ZWE_CLI_PARAMETER_CONFIG', '');

const loopStart = Date.now();

for (let test in TESTS) {

    let counter = `${currentTest.toString().padStart(totalLength)}/${total}`;
    currentTest++
    let rest;
    // parms XOR script
    if (Boolean(TESTS[test].parms) !== Boolean(TESTS[test].script)) {
        if (TESTS[test].parms) {
            rest = `${ZWE} ${TESTS[test].parms}`;
        } else {
            rest = `${CONFIGMGR_SCRIPT} ${TESTS[test].script}`;
        }
    } else {
        console.log('Only one must be defined: "parms" and "script"');
        std.exit(1);
    }

    let expectedRC = 0;
    let expectedOut = undefined;
    let expectedSubStr = undefined;
    let expectedSubStrX = undefined;
    let description = undefined;

    if (typeof TESTS[test].expected == 'number') {
        expectedRC = TESTS[test].expected % 256;
    }
    if (typeof TESTS[test].expected == 'object') {
        expectedRC = TESTS[test].expected.rc == undefined ? 0 : (TESTS[test].expected.rc % 256);
        expectedOut = TESTS[test].expected.out;
        expectedSubStr = TESTS[test].expected.substr;
        expectedSubStrX = TESTS[test].expected.substrx;
    }
    if (TESTS[test].desc) {
        description = TESTS[test].desc;
    }

    // *** Before actions ***
    print.debug(`${counter}`, rest, print.YELLOW);
    if (TESTS[test].environment) {
        TESTS[test].environment.forEach(env => {
            if (env[2] === undefined) {
                afterEnvironment.push([env[0], '']);
            }
            if (env[2] === ENV_RESTORE) {
                afterEnvironment.push([env[0], `${std.getenv(`${env[0]}`)}`]);
            }
            env.exportEnv(env[0], env[1]);
        })
    }
    if (TESTS[test].before) {
        ds.allocJCL(TESTS[test].before.allocJCL);
        ds.allocLoad(TESTS[test].before.allocLoad);
        ds.listMB(TESTS[test].before.listMB);
        ds.listDS(TESTS[test].before.listDS)
        ds.deleteDS(TESTS[test].before.deleteDS);
        misc.shellCmd(TESTS[test].before.shellCmd);
    }

    let result;
    if (TESTS[test].parms) {
        result = shell.execOutSync('sh', '-c', `${EXPORT} && ${ZWE} ${TESTS[test].parms}`);
    } else {
        result = shell.execOutSync('sh', '-c', `${CONFIGMGR_SCRIPT} ${TESTS[test].script}`);
    }

    print.debug('Output', "\n" + result.out);

    let info = `expected rc=${expectedRC.toString().padStart(3)}, result rc=${result.rc.toString().padStart(3)}`;

    if (result.rc == expectedRC) {
        results.push(print.formatMsg(SEVERITY.INFO, PRINT, counter, info, rest));
    } else {
        results.push(print.formatMsg(SEVERITY.ERROR, PRINT, counter, info, rest));
    }
    const skipCounter = ' '.repeat(counter.length);
    if (expectedOut || expectedOut == '') {
        if (result.out == expectedOut) {
            results.push(print.formatMsg(SEVERITY.INFO, PRINT, skipCounter, 'output match', ''));
        } else {
            results.push(print.formatMsg(SEVERITY.ERROR, PRINT, skipCounter, 'output not matched', ''));
        }
    }
    if (description) {
        results.push(print.formatMsg(SEVERITY.OTHER, PRINT, skipCounter, 'Description', description));
    }
    subStringInResult(expectedSubStr, true, result, results, skipCounter);
    subStringInResult(expectedSubStrX, false, result, results, skipCounter);

    // *** After actions ***
    if (afterEnvironment.length) {
        afterEnvironment.forEach(env => {
            env.exportEnv(env[0], env[1]);
        })
    }
    if (TESTS[test].after) {
        ds.allocJCL(TESTS[test].after.allocJCL);
        ds.allocLoad(TESTS[test].after.allocLoad);
        ds.listMB(TESTS[test].after.listMB);
        ds.listDS(TESTS[test].after.listDS)
        ds.deleteDS(TESTS[test].after.deleteDS);
        misc.shellCmd(TESTS[test].after.shellCmd);
    }
    print.debug(`${counter}`, '-'.repeat(32) + "\n", print.YELLOW);

}

const loopEnd = Date.now();
print.debug('Time elapsed', `${new Date(loopEnd-loopStart).toISOString().slice(11,19)}`)

console.log(print.CYAN + `${print.decorate('test overview')}` + print.RESET);
results.forEach(res => {
    console.log(res);
})
