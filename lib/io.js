import * as std from 'cm_std';
import * as xplatform from 'xplatform';

import * as string from './string';
import * as print from './print';

import * as shell from './.zwe-test-zowe.runtimeDirectory/bin/libs/shell';

export function tsoCommand(cmd) {
    const result = shell.execOutSync('sh', '-c', `tsocmd "${cmd}"`);
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
    if (dsn) {
        tsoCommands(expandArrayViaTemplate(dsn, "LISTDS '${this.datasetName}' MEMBERS"));
    }
}

export function listDS(dsn) {
    if (dsn) {
        tsoCommands(expandArrayViaTemplate(dsn, "LISTDS '${this.datasetName}'"));
    }
}

export function deleteDS(dsn) {
    if (dsn) {
        tsoCommands(expandArrayViaTemplate(dsn, "DELETE '${this.datasetName}' MASK"));
    }
}

export function allocJCL(dsn) {
    if (dsn) {
        tsoCommands(expandArrayViaTemplate(dsn, "ALLOCATE NEW DA('${this.datasetName}') dsntype(library) dsorg(po) recfm(f b) lrecl(80) unit(sysallda) space(15,15) tracks"));
    }
}

export function allocLoad(dsn) {
    if (dsn) {
        tsoCommands(expandArrayViaTemplate(dsn, "ALLOCATE NEW DA('${this.datasetName}') dsntype(library) dsorg(po) recfm(u) lrecl(0) blksize(32760) unit(sysallda) space(30,15) tracks`"));
    }
}

export function isDatasetExists(datasetName) {
    const result = shell.execSync('sh', '-c', `cat "//'${string.escapeDollar(datasetName)}'" 1>/dev/null 2>&1`);
    return result.rc === 0;
}

let yamlDirectoryDone = false;
let yamlConfigsCreated = [];

export function makeYaml(fileName, yamlContent) {
    if (!yamlDirectoryDone) {
        shell.execSync('sh', '-c', `mkdir -p ./yaml 2>/dev/null 1>/dev/null`);
        yamlDirectoryDone = true;
    }
    const YAML_NAME = `./yaml/zowe.${fileName}.yaml`;

    if (!yamlConfigsCreated.includes(YAML_NAME)) {
        if (Array.isArray(yamlContent)) {
            yamlContent = yamlContent.join("\n");
        }
        yamlContent += '\n'
        xplatform.storeFileUTF8(YAML_NAME, xplatform.AUTO_DETECT, yamlContent);
        print.debug('io.makeYaml', `${YAML_NAME}:\n${print.simpleYamlSyntax(yamlContent)}`);
        yamlConfigsCreated.push(YAML_NAME);
    } else {
        print.debug('io.makeYaml', `${YAML_NAME}: Already created.\n`);
    }

    return YAML_NAME;
}

const TMP_DIR = std.getenv('ZWET_TMP_DIR') == '' ? './tmp' : std.getenv('ZWET_TMP_DIR');
const TMP_FILE = std.getenv('ZWET_TMP_FILE') == '' ? `${TMP_DIR}/zwet-test-tmp` : `${TMP_DIR}/${std.getenv('ZWET_TMP_FILE')}`;
print.debug(`io`, `temporary file=${TMP_FILE}`);
let tempDone = false;

export function makeParmlibYaml(dsn, memberName, yamlContent) {
    const DSN_NAME = `${dsn}(${memberName})`;
    if (!tempDone) {
        shell.execSync('sh', '-c', `[ ! -d "${TMP_DIR}" ] && mkdir -p "${TMP_DIR}" 2>/dev/null 1>/dev/null`);
        tempDone = true;
    }
    if (!isDatasetExists(dsn)) {
        allocJCL(dsn);
    }

    if (!yamlConfigsCreated.includes(DSN_NAME)) {
        if (Array.isArray(yamlContent)) {
            yamlContent = yamlContent.join("\n");
        }
        yamlContent += '\n'
        xplatform.storeFileUTF8(TMP_FILE, xplatform.AUTO_DETECT, yamlContent);
        shell.execOutSync('sh', '-c', `cp "${TMP_FILE}" "//'${string.escapeDollar(`${dsn}(${memberName})`)}'"`);
        yamlConfigsCreated.push(DSN_NAME);
        print.debug('io.makeParmlibYaml', `${DSN_NAME}:\n${print.simpleYamlSyntax(yamlContent)}`);
    } else {
        print.debug('io.makeParmlibYaml', `${DSN_NAME}: Already created.\n`);
    }

    return DSN_NAME;
}
