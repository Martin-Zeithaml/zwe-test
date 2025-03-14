import * as std from 'cm_std';
import * as xplatform from 'xplatform';

import * as string from './string';
import * as print from './print';

import * as shell from './.zwe-test-zowe.runtimeDirectory/bin/libs/shell';

export function tsoCommand(cmd) {
    const result = shell.execOutSync('sh', '-c', `${cmd}`);
    print.debug(`io.tsocmd`, `rc=${result.rc} for '${cmd}'`);
}

export function tsoCommands(cmds) {
    for (let i = 0; i < cmds.length; i++) {
        tsoCommand(cmds[i]);
    }
}

function expandArrayViaTemplate(arrayToExpand, template) {
    if (Array.isArray(arrayToExpand) == false) {
        arrayToExpand = [ `${arrayToExpand}` ];
    }
    let expandedArray = [];
    for (let i = 0; i < arrayToExpand.length; i++) {
        const dsn = arrayToExpand[i];
        expandedArray.push(string.resolveTemplate(template, { datasetName: string.escapeDollar(dsn) }));
    }
    return expandedArray;
}

export function listMB(dsn) {
    tsoCommands(expandArrayViaTemplate(dsn, "LISTDS '${this.datasetName}' MEMBERS"));
}

export function listDS(dsn) {
    tsoCommands(expandArrayViaTemplate(dsn, "LISTDS '${this.datasetName}'"));
}

export function deleteDS(dsn) {
    tsoCommands(expandArrayViaTemplate(dsn, "DELETE '${this.datasetName}' MASK"));
}

export function allocJCL(dsn) {
    tsoCommands(expandArrayViaTemplate(dsn, "ALLOCATE NEW DA('${this.datasetName}') dsntype(library) dsorg(po) recfm(f b) lrecl(80) unit(sysallda) space(15,15) tracks"));
}

export function allocLoad(dsn) {
    tsoCommands(expandArrayViaTemplate(dsn, "ALLOCATE NEW DA('${this.datasetName}') dsntype(library) dsorg(po) recfm(u) lrecl(0) blksize(32760) unit(sysallda) space(30,15) tracks`"));
}

export function isDatasetExists(datasetName) {
    const result = shell.execSync('sh', '-c', `cat "//'${string.escapeDollar(datasetName)}'" 1>/dev/null 2>&1`);
    return result.rc === 0;
}

let yamlDone = false;

export function makeYaml(name, str) {
    if (!yamlDone) {
        shell.execSync('sh', '-c', `mkdir -p ./yaml 2>/dev/null 1>/dev/null`);
        yamlDone = true;
    }
    const YAML_NAME = `./yaml/zowe.${name}.yaml`;
    if (Array.isArray(str)) {
        str = str.join("\n");
    }
    str += '\n'
    print.debug('io.makeYaml', `${YAML_NAME}:\n${str}\n`);
    xplatform.storeFileUTF8(YAML_NAME, xplatform.AUTO_DETECT, str);
    return YAML_NAME;
}

const TMP_DIR = std.getenv(ZWET_TMP_DIR) == '' ? './tmp' : std.getenv(ZWET_TMP_DIR);
const TMP_FILE = std.getenv(ZWET_TMP_FILE) == '' ? `${TMP_DIR}/zwet-test-tmp` : `${TMP_DIR}/${TMP_FILE}`;
let tempDone = false;

export function makeParmlibYaml(dsn, name, str) {
    const DSN_NAME = `${dsn}(${name})`;
    if (!tempDone) {
        shell.execSync('sh', '-c', `[ ! -d "${TMP_DIR}" ] && mkdir -p "${TMP_DIR}" 2>/dev/null 1>/dev/null`);
        tempDone = true;
    }
    if (!isDatasetExists(dsn)) {
        allocJCL(dsn);
    }
    if (Array.isArray(str)) {
        str = str.join("\n");
    }
    str += '\n'
    xplatform.storeFileUTF8(TMP_FILE, xplatform.AUTO_DETECT, str);
    shell.execOutSync('sh', '-c', `cp "${TMP_FILE}" "//'${string.escapeDollar(`${dsn}(${name})`)}'"`);
    print.debug('io.makeParmlibYaml', `${DSN_NAME}:\n${str}\n`);

    return DSN_NAME;
}
