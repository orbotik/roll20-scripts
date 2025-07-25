/**
 * Daggerheart Fear
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
const BOT_NAME = 'The Game';

class DaggerheartFearScript {
    constructor() {
        //ready
    }

    sendChat(playerObjOrID, message) {
        if (!playerObjOrID || !message) {
            throw new Error('Player and message are required to send chat.');
        }
        if (typeof playerObjOrID === 'string') {
            playerObjOrID = getObj('player', playerObjOrID);
        }
        if (!playerObjOrID) {
            throw new Error(`Player not found: ${playerObjOrID}`);
        }
        if (typeof message !== 'string') {
            throw new Error('Message must be a string.');
        }
        sendChat(BOT_NAME, `/w "${playerObjOrID.get('displayname')}" ${message}`);
    }

}

on('ready', () => {
    log(`Daggerheart Fear script v${VERSION} initalizing.`);
    new DaggerheartFearScript();
    log(`Daggerheart Fear script initialized.`);
});
