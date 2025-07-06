/**
 * # Daggerheart Fear Tracker
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * ### Any Player:
 * !fear                 Shows the current fear counter value.
 * !fear [on/off]        Turns fear notices (from duality rolls) on or off for the commanding player.
 * ### GM Only:
 * !fear reset           Resets the fear counter to 0.
 * !fear set [number]    Sets the fear counter to a specific value.
 * !fear reset known     Clears the known player list (players will re-receive the welcome message).
 */

const BOT_NAME = 'The Game';
const VERSION = '1.0.0';

const sendNewPlayerNotice = (currentPlayer) => {
    sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" <strong>Welcome to Orbotik's Daggerheart Fear Tracker!</strong> <small>v${VERSION}</small><br>You may turn fear notices on and off using <strong>!fear on</strong> and <strong>!fear off</strong> commands.`);
    state.fear.known.push(currentPlayer.id);
    log(`New player known by fear: ${currentPlayer.get('displayname')}`);
};

const sendFearNotice = (currentPlayer) => {
    if (!state.fear.counter || state.fear.counter <= 0) {
        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" <br><strong>Have no fear.</strong> <em>There is none to be had.</em>`);
    } else if (state.fear.counter === 1) {
        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" <br>There is <em>a single</em> 💀 fear (<mark>1</mark>).`);
    } else if (state.fear.counter < 4) {
        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" <br>There is <em>some</em> 💀 fear (<mark>${state.fear.counter}</mark>).`);
    } else if (state.fear.counter < 8) {
        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" <br>There is <strong>much</strong> 💀 fear (<mark>${state.fear.counter}</mark>).`);
    } else {
        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" <br>There is <em><strong>intense</strong></em> 💀 fear (<mark>${state.fear.counter}</mark>).`);
    }
}

const sendFearIncreaseNotice = (currentPlayer) => {
    sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" <mark>+1</mark> 💀 Fear has <strong>increased!</strong><br><small>The total is now <mark>${state.fear.counter}</mark>.</small>`);
}

on('ready', () => {
    if (!state.fear || (typeof state.fear !== 'object')) {
        state.fear = {
            version: VERSION,
            counter: 0,
            known: [],
            off: []
        };
    }
    log(`@orbotik's Daggerheart fear script v${VERSION} started listening.`);
    on('chat:message', (msg) => {
        //capture duality roll with fear
        if (msg.type === 'advancedroll' && msg.content.match(/demiplane-dice-roll-daggerheart-character/gmi) && msg.content.match(/--roll-with-fear/gmi)) {
            state.fear.counter++;
            //send notices
            let players = findObjs({ _type: 'player' });
            for (let p of players) {
                if (state.fear.off.indexOf(p.id) === -1) {
                    if (state.fear.known.indexOf(p.id) === -1) {
                        sendNewPlayerNotice(p);
                    }
                    sendFearIncreaseNotice(p);
                }
            }
        }
        //show or reset fear
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
            if (command === 'fear') {
                let currentPlayer = getObj('player', msg.playerid);
                if (currentPlayer) {
                    let gm = playerIsGM(currentPlayer.id);
                    //check if new player
                    let forceKnow = (args.length && args[0] === 'knowme');
                    if (state.fear.known.indexOf(currentPlayer.id) === -1 || forceKnow) {
                        sendNewPlayerNotice(currentPlayer);
                        if (forceKnow) {
                            return;
                        }
                    }
                    if (args.length === 0) {
                        log(`Showing fear of ${state.fear.counter ?? 0} to ${currentPlayer.get('displayname')}.`);
                        sendFearNotice(currentPlayer);
                    } else if (args.length && args[0] === 'off') {
                        if (state.fear.off.indexOf(msg.playerid) === -1) {
                            state.fear.off.push(msg.playerid);
                            sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Your fear notices are now <mark>off</mark>.`);
                        } else {
                            sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Your fear notices are already <mark>off</mark>.`);
                        }
                    } else if (args.length && args[0] === 'on') {
                        if (state.fear.off.indexOf(msg.playerid) > -1) {
                            state.fear.off.splice(state.fear.off.indexOf(msg.playerid), 1);
                            sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Your fear notices are now <mark>on</mark>.`);
                        } else {
                            sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Your fear notices are already <mark>on</mark>.`);
                        }
                    } else if (gm && args.length === 1 && args[0] === 'reset') {
                        state.fear.counter = 0;
                        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Fear has been reset to <mark>0</mark>.`);
                    } else if (gm && args.length === 2 && args[0] === 'reset' && args[1] === 'known') {
                        state.fear.known = [];
                        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Known players for fear has been reset (cleared).`);
                    } else if (gm && args.length && args[0] === 'set' && isFinite(parseInt(args[1]))) {
                        state.fear.counter = parseInt(args[1]);
                        if (state.fear.counter < 0) {
                            state.fear.counter = 0;
                        } else if (state.fear.counter > 999) {
                            state.fear.counter = 999;
                        }
                        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Fear has been set to <mark>${state.fear.counter}</mark>.`);
                    } else {
                        sendChat(BOT_NAME, `/w "${currentPlayer.get('displayname')}" Invalid command or parameters (or you may not be the GM).`);
                    }
                }
            }
        }
    });
});