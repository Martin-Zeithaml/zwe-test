import * as shell from '@RUNTIME@/bin/libs/shell';
import * as print from './print';

const TSO = [
    { debug: 'listMB', cmd: `LISTDS '@@@' MEMBERS` },
    { debug: 'listDS', cmd: `LISTDS '@@@'` },
    { debug: 'deleteDS', cmd: `DELETE '@@@'` },
    { debug: 'allocJCL', cmd: `ALLOCATE NEW DA('@@@') dsntype(library) dsorg(po) recfm(f b) lrecl(80) unit(sysallda) space(15,15) tracks` },
    { debug: 'allocLoad', cmd: `ALLOCATE NEW DA('@@@') dsntype(library) dsorg(po) recfm(u) lrecl(0) blksize(32760) unit(sysallda) space(30,15) tracks` },
]

function tsocmds(cmdNumber, ds) {
    let dsArray = [];
    let tso2Execute;
    if (ds !== undefined) {
        if (ds.constructor !== Array) {
            dsArray.push(ds);
        } else {
            dsArray = Array.from(ds);
        }
        for (let i = 0; i < dsArray.length; i++) {
            tso2Execute = TSO[cmdNumber].cmd.replace('@@@',print.escapeDollar(dsArray[i]));
            tso2Execute = `tsocmd "${tso2Execute}"`;
            print.debug(`ds.${TSO[cmdNumber].debug}`, tso2Execute);
            const result = shell.execOutSync('sh', '-c', `${tso2Execute}`);
            if (result.rc !== 0) {
                print.debug(`ds.${TSO[cmdNumber].debug}`, `failed rc=${result.rc}`);
                return 1;
            }
            print.debug(`ds.${TSO[cmdNumber].debug}`, result.out);
        }
    }
}

export function listMB(ds) {
    tsocmds(0, ds);
}

export function listDS(ds) {
    tsocmds(1, ds);
}

export function deleteDS(ds) {
    tsocmds(2, ds);
}

export function allocJCL(ds) {
    tsocmds(3, ds)
}

export function allocLoad(ds) {
    tsocmds(4, ds)
}

export function isDatasetExists(datasetName) {
    const result = shell.execSync('sh', '-c', `cat "//'${print.escapeDollar(datasetName)}'" 1>/dev/null 2>&1`);
    return result.rc === 0;
}
