import * as std from 'cm_std';

import * as print from './print';

export const KEEP = 1;
export const RESTORE = 2;

export function exportEnv(env, value) {
    if (env !== undefined) {
        print.debug('misc.exportEnv', `${env}=${value}`);
        std.setenv(`${env}`, `${value}`);
    }
}
