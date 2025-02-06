import * as std from 'cm_std';

export const KEEP = 1;
export const RESTORE = 2;

export function exportEnv(env, value) {
    if (env !== undefined) {
        print.debug('misc.exportEnv', `${env}=${value}`);
        std.setenv(`${env}`, `${value}`);
    }
}

export function unExportEnv(env) {
    if (env !== undefined) {
        print.debug('misc.unExportEnv', `${env}=`);
        std.setenv(`${env}`, ``);
    }
}
