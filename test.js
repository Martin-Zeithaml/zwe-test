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
const PRINT = true;

const TESTS = {
    ...testCases.ALL
}

function beforeOrAfterActions(actions) {
    if (actions) {
        ds.allocJCL(actions.allocJCL);
        ds.allocLoad(actions.allocLoad);
        ds.listMB(actions.listMB);
        ds.listDS(actions.listDS)
        ds.deleteDS(actions.deleteDS);
        misc.shellCmd(actions.shellCmd);
    }
}

let testResults = [];
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
    beforeOrAfterActions(TESTS[test].before);

    let result;
    if (TESTS[test].parms) {
        result = shell.execOutSync('sh', '-c', `${EXPORT} && ${ZWE} ${TESTS[test].parms}`);
    } else {
        result = shell.execOutSync('sh', '-c', `${CONFIGMGR_SCRIPT} ${TESTS[test].script}`);
    }

    print.debug('Output', "\n" + result.out);

    let info = `expected rc=${expectedRC.toString().padStart(3)}, result rc=${result.rc.toString().padStart(3)}`;

    if (result.rc == expectedRC) {
        testResults.push(print.formatMsg(misc.SEVERITY_NUM.INFO, PRINT, counter, info, rest));
    } else {
        testResults.push(print.formatMsg(misc.SEVERITY_NUM.ERROR, PRINT, counter, info, rest));
    }
    const skipCounter = ' '.repeat(counter.length);
    if (description) {
        testResults.push(print.formatMsg(misc.SEVERITY_NUM.OTHER, PRINT, skipCounter, 'Description', description));
    }
    if (expectedOut || expectedOut == '') {
        if (result.out == expectedOut) {
            testResults.push(print.formatMsg(misc.SEVERITY_NUM.INFO, PRINT, skipCounter, 'output match', ''));
        } else {
            testResults.push(print.formatMsg(misc.SEVERITY_NUM.ERROR, PRINT, skipCounter, 'output not matched', ''));
        }
    }

    misc.subStringInResult(expectedSubStr, true, result.out, testResults, skipCounter, PRINT);
    misc.subStringInResult(expectedSubStrX, false, result.out, testResults, skipCounter, PRINT);

    // *** After actions ***
    if (afterEnvironment.length) {
        afterEnvironment.forEach(env => {
            env.exportEnv(env[0], env[1]);
        })
    }
    beforeOrAfterActions(TESTS[test].after);

    print.debug(`${counter}`, '-'.repeat(32) + "\n", print.YELLOW);

}

const loopEnd = Date.now();
print.debug('Time elapsed', `${new Date(loopEnd-loopStart).toISOString().slice(11,19)}`)

console.log(print.CYAN + `${print.decorate('test overview')}` + print.RESET);
testResults.forEach(res => {
    console.log(res);
})
