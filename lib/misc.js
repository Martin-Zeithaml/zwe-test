import * as xplatform from 'xplatform';
import * as print from './print';
import * as shell from '@RUNTIME@/bin/libs/shell'

export function shellCmd(cmd) {
    if (cmd) {
        print.debug('misc.shellCmd', `${cmd}`);
        const result = shell.execOutSync('sh', '-c', `${cmd} 2>&1`);
        print.debug('misc.shellCmd', result.rc + "\n" + result.out);
        print.debug('misc.shellCmd', '-'.repeat(64));
    }
}

export function makeYaml(name, str) {
    shell.execSync('sh', '-c', `mkdir -p ./yaml 2>/dev/null 1>/dev/null`);
    const YAML_NAME = `./yaml/zowe.${name}.yaml`;
    if (Array.isArray(str)) {
        str = str.join("\n");
    }
    str += '\n'
    print.debug('misc.makeYaml', `${YAML_NAME}:\n${str}`);
    print.debug('misc.makeYaml', '-'.repeat(64));
    xplatform.storeFileUTF8(YAML_NAME, xplatform.AUTO_DETECT, str);
    return YAML_NAME;
}

export function makeParmlibYaml(dsn, name, str) {
    const DSN_NAME = `${dsn}(${name})`;
    if (!ds.isDatasetExists(dsn)) {
        ds.allocJCL(dsn);
    }
    if (Array.isArray(str)) {
        str = str.join("\n");
    }
    str += '\n'
    xplatform.storeFileUTF8('/tmp/zowe-tmp-zwe', xplatform.AUTO_DETECT, str);
    shell.execOutSync('sh', '-c', `cp /tmp/zowe-tmp-zwe "//'${print.escapeDollar(`${dsn}(${name})`)}'"`);
    print.debug('misc.makeParmlibYaml', `${DSN_NAME}:\n${str}`);
    print.debug('misc.makeParmlibYaml', '-'.repeat(64));

    return DSN_NAME;
}
