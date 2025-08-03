/**
 * # Switch-to a Character
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * ### Any Player:
 * !switch-to [character name]                 Sets you as the active speaker of the specified character (name).
 * !switch-to @self                            Resets yourself as the active speaker.
 */

on('ready', () => {
    const BOT_NAME = 'The Game';
    const VERSION = '1.0.0';
    log('Switch-to script started listening.');
    on('chat:message', (msg) => {
        if (msg.type === 'api' && !msg.rolltemplate && msg.playerid) {
            let args;
            if (msg.content.indexOf('"') > -1 || msg.content.indexOf('\'') > -1) {
                let matches = msg.content.substring(1).matchAll(/[^\s"']+|["']([^"']*)["']/gi);
                args = [];
                for (let m of matches) {
                    if (m[0]) {
                        args.push(m.length > 1 && !!m[1] ? m[1] : m[0])
                    }
                }
            } else {
                args = msg.content.substring(1).split(' ');
            }
            let command = args[0].toLowerCase();
            args.splice(0, 1);
            args = args.map(v => v.replaceAll(/[^a-zA-Z0-9 \._=@\-()&+]/g, ''));
            if (command === 'switch-to') {
                let currentPlayer = getObj('player', msg.playerid);
                if (currentPlayer) {
                    if (args.length === 0 || args[0] === '@self') {
                        log(`Switching ${currentPlayer.get('displayname')} speaking-as back to self.`);
                        currentPlayer.set({ speakingas: '' }); //reset back to self
                    } else if (args.length === 1) {
                        let c = findObjs({
                            type: 'character',
                            id: args[0]
                        });
                        if (!c?.length) {
                            c = findObjs({ name: args[0], type: 'character' }, { caseInsensitive: true });
                        }
                        if (c?.length && c[0].get('id')) {
                            log(`Switching ${currentPlayer.get('displayname')} speaking-as to ${c[0].get('name')}.`);
                            currentPlayer.set({ speakingas: `character|${c[0].get('id')}` });
                        } else {
                            sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" No character found under name or ID "${args[0]}".`);
                        }
                    } else {
                        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Invalid number of arguments.`);
                    }
                }
            }
        }
    });
});