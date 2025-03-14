import * as std from 'cm_std';

import * as print from './print';

export const KEEP = 1;
export const RESTORE = 2;

export function exportEnv(env, value) {
    if (env !== undefined) {
        print.debug('env.exportEnv', `${env}=${value}`);
        std.setenv(`${env}`, `${value}`);
    }
}

export function getenvWithDefaults(envName, validOptions, caseSensitive, defaultValue) {
    print.debug('env.getenvWithDefaults', `Check '${envName}' in ${validOptions} with default ${defaultValue == undefined ? validOptions[0] : defaultValue}`);
    let envValue = std.getenv(`${envName}`);
    if (!envValue) {
        return defaultValue == undefined ? validOptions[0] : defaultValue;
    }
    envValue = caseSensitive ? envValue : envValue.toLowerCase();
    let validOptionsCase = validOptions.map(opt => caseSensitive ? opt : opt.toLowerCase());
    for (let i = 0; i < validOptionsCase.length; i++) {
        if (envValue == validOptionsCase[i]) {
            return validOptions[i];
        }
    }
    return defaultValue == undefined ? validOptions[0] : defaultValue;
}
