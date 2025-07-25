/**
 * ScriptName
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * ### Any Player:
 * !sample                 Sample description.
 * !sample [on/off]        Sample description.
 * ### GM Only:
 * !sample reset           Sample description.
 */

const VERSION = '1.0.0';

class ScriptClassScript {
    constructor() {
        //ready
    }

}

on('ready', () => {
    log(`ScriptName script v${VERSION} initalizing.`);
    new ScriptClassScript();
    log(`ScriptName script initialized.`);
});
