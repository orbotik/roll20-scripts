/**
 * Daggerheart Fear
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
 * !fear reset                    Resets the fear counter to 0.
 * !fear text-obj {id}            Registers a text object to be updated with fear amount as it changes. The {id} is
 *                                optional, and if omitted will set the selected text object. To stop the updating on
 *                                a specific object, run the command again.
 * !fear text-obj [number/tally]  Switches the text updated between using tallies or using numbers.
 * !fear whispers [on/off]        Globally sets whispers to players on or off when the fear amount changes.
 * !fear spend [number]           Decreases the fear counter by 1 or a specific number (to a minimum of 0).
 * !fear gain [number]            Increases the fear counter by 1 or a specific number.
 * !fear set [number]             Sets the fear counter to a specific value.
 * !fear reset text-obj           Clears all fear-tracking updates to all registered text objects.
 * !fear reset known              Clears the known player list (players will re-receive the welcome message).
 */
class DaggerheartFearScript {

    static VERSION = '1.0.1';

    static BOT_NAME = 'The Game';

    static MAXIMUM_FEAR = 12; //per daggerheart standard rules (pg.154 §Fear, Gaining Fear).

    constructor() {
        //init state
        if (!state.fear || (typeof state.fear !== 'object')) {
            state.fear = {
                version: DaggerheartFearScript.VERSION,
                counter: 0,
                known: [],
                off: []
            };
        }
        //upgrade
        if (state.fear?.version !== DaggerheartFearScript.VERSION) {
            state.fear.whispers = true;
            state.fear.version = DaggerheartFearScript.VERSION;
        }
        if (state.fear.counter > DaggerheartFearScript.MAXIMUM_FEAR) {
            state.fear.counter = DaggerheartFearScript.MAXIMUM_FEAR;
        }
        log(`state is: ${JSON.stringify(state.fear, null, 4)}`);
        //events
        on('chat:message', this.chatHandler.bind(this));
    }

    pm(playerObjOrID, message) {
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
        sendChat(DaggerheartFearScript.BOT_NAME, `/w "${playerObjOrID.get('displayname')}" ${message}`);
    }

    pmFear(playerObjOrID, whisperNotice = true, variant) {
        if (!playerObjOrID) {
            //handle called without a specific player, and notify everyone (that's not off).
            let players = findObjs({ _type: 'player' });
            for (let p of players) {
                if (whisperNotice === false || (state.fear.whispers && state.fear.off.includes(p.id) === false)) {
                    this.pmFear(p, whisperNotice, variant);
                }
            }
        } else {
            if (typeof playerObjOrID === 'string') {
                playerObjOrID = getObj('player', playerObjOrID);
            }
            if (whisperNotice === false || (state.fear.whispers && state.fear.off.includes(playerObjOrID.id) === false)) {
                let message = '';
                let varientVerb = '';
                if (variant === '+') {
                    message = '<br><strong>💀 Fear has increased!</strong>';
                    varientVerb = 'now ';
                } else if (variant === '-') {
                    message = '<br><strong>🌸 Fear has <em>been reduced</em>!</strong>';
                    varientVerb = 'still ';
                }
                if (!state.fear.counter || state.fear.counter <= 0) {
                    message += `<br><strong>Have no fear.</strong> There is none to be had (<mark>0</mark>).`;
                } else if (state.fear.counter === 1) {
                    message += `<br>There is ${varientVerb}<em>a single</em> fear (<mark>1</mark>).`;
                } else if (state.fear.counter < 4) {
                    message += `<br>There is ${varientVerb}<em>some</em> fear (<mark>${state.fear.counter}</mark>).`;
                } else if (state.fear.counter < 7) {
                    message += `<br>There is ${varientVerb}<strong>much</strong> fear (<mark>${state.fear.counter}</mark>).`;
                } else if (state.fear.counter < 10) {
                    message += `<br>There is ${varientVerb}<em><strong>strong</strong></em> fear (<mark>${state.fear.counter}</mark>).`;
                } else if (state.fear.counter < DaggerheartFearScript.MAXIMUM_FEAR) {
                    message += `<br>There is ${varientVerb}<em><strong>intense</strong></em> fear (<mark>${state.fear.counter}</mark>).`;
                } else {
                    message += `<br>There is ${varientVerb}<em><strong>maximum</strong></em> fear (<mark>${state.fear.counter}</mark>).`;
                }
                this.pm(playerObjOrID, message);
            }
        }
    }

    registerPlayer(playerObjOrID) {
        if (!playerObjOrID) {
            throw new Error('Player is required to register.');
        }
        if (typeof playerObjOrID === 'string') {
            playerObjOrID = getObj('player', playerObjOrID);
        }
        let knownIndex = state.fear.known.indexOf(playerObjOrID.id);
        let offIndex = state.fear.off.indexOf(playerObjOrID.id);
        if (knownIndex < 0 || offIndex >= 0) {
            if (knownIndex < 0) {
                state.fear.known.push(playerObjOrID.id);
            }
            if (offIndex >= 0) {
                state.fear.off.splice(offIndex, 1);
            }
            this.pm(playerObjOrID, `Your fear notices are now <mark>on</mark>.`);
            log(`Player "${playerObjOrID.get('displayname')}" registered for fear whispers.`);
        } else {
            log(`Player "${playerObjOrID.get('displayname')}" is already registered for fear whispers.`);
        }
    }

    unregisterPlayer(playerObjOrID) {
        if (!playerObjOrID) {
            throw new Error('Player is required to unregister.');
        }
        if (typeof playerObjOrID === 'string') {
            playerObjOrID = getObj('player', playerObjOrID);
        }
        if (state.fear.off.indexOf(playerObjOrID.id) < 0) {
            state.fear.off.push(playerObjOrID.id);
            this.pm(playerObjOrID, `Your fear notices are now <mark>off</mark>.`);
            log(`Player "${playerObjOrID.get('displayname')}" unregistered from fear whispers.`);
        } else {
            log(`Player "${playerObjOrID.get('displayname')}" is already unregistered from fear whispers.`);
        }
    }

    registerTextObject(obj) {

    }

    chatCommand(msg) {
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
            let player = getObj('player', msg.playerid);
            let gm = playerIsGM(msg.playerid);
            return { command, args, player, gm };
        }
        return null;
    }

    chatHandler(msg) {
        //check if new player
        if ((msg.type === 'general' || msg.type === 'api') && msg.playerid && state.fear.known.includes(msg.playerid) === false) {
            let p = getObj('player', msg.playerid);
            this.pm(p, `<strong>Welcome to Orbotik's Daggerheart Fear Tracker!</strong> <small>v${DaggerheartFearScript.VERSION}</small><br>You may turn fear notices on and off using <strong>!fear on</strong> and <strong>!fear off</strong> commands.`);
            this.registerPlayer(p);
        }
        //capture duality roll with fear
        if (msg.type === 'advancedroll' && msg.content.match(/demiplane-dice-roll-daggerheart-character/gmi) && msg.content.match(/--roll-with-fear/gmi)) {
            state.fear.counter = Math.min(DaggerheartFearScript.MAXIMUM_FEAR, state.fear.counter + 1);
            this.pmFear(null, true, '+');
        } else {
            let chat = this.chatCommand(msg);
            if (chat?.command === 'fear') {
                if (chat.args.length === 0) {
                    log(`Showing fear of ${state.fear.counter ?? 0} to ${chat.player.get('displayname')}.`);
                    this.pmFear(chat.player, false);
                } else {
                    switch (chat.args[0]) {
                        case 'off':
                            this.unregisterPlayer(chat.player);
                            break;
                        case 'on':
                            this.registerPlayer(chat.player);
                            break;
                        case 'spend':
                        case 'gain':
                            if (chat.gm) {
                                let amount = 1;
                                if (chat.args.length > 1 && chat.args[1] && isFinite(parseInt(chat.args[1]))) {
                                    amount = parseInt(chat.args[1]);
                                }
                                if (chat.args[0] === 'spend' && state.fear.counter >= amount) {
                                    state.fear.counter -= amount;
                                    if (state.fear.counter < 0) {
                                        state.fear.counter = 0;
                                    }
                                    //send notices
                                    this.pmFear(null, true, '-');
                                    this.pm(chat.player, `Fear has been spent. New value is <mark>${state.fear.counter}</mark>.`);
                                } else if (chat.args[0] === 'gain' && state.fear.counter + amount <= DaggerheartFearScript.MAXIMUM_FEAR) {
                                    state.fear.counter += amount;
                                    //send notices
                                    this.pmFear(null, true, '+');
                                    this.pm(chat.player, `Fear has been gained. New value is <mark>${state.fear.counter}</mark>.`);
                                } else {
                                    this.pm(chat.player, `Unable to ${chat.args[0]} <mark>${amount}</mark> fear, fear is currently: <mark>${state.fear.counter}</mark>.`);
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        case 'set':
                            if (chat.gm) {
                                let originalCounter = state.fear.counter;
                                let newCounter = Math.min(DaggerheartFearScript.MAXIMUM_FEAR, Math.max(0, parseInt(chat.args[1])));
                                if (originalCounter != newCounter) {
                                    state.fear.counter = newCounter;
                                    this.pmFear(null, true, originalCounter < newCounter ? '+' : '-');
                                    this.pm(chat.player, `Fear has been set to <mark>${state.fear.counter}</mark>.`);
                                } else {
                                    this.pm(chat.player, `Fear is already set to <mark>${state.fear.counter}</mark>.`);
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        case 'reset':
                            if (chat.gm) {
                                if (chat.args.length === 1) {
                                    if (state.fear.counter !== 0) {
                                        state.fear.counter = 0;
                                        this.pm(chat.player, 'Fear has been reset to <mark>0</mark>.');
                                        this.pmFear(null, true, '-');
                                    } else {
                                        this.pm(chat.player, 'Fear is already at <mark>0</mark>.');
                                    }
                                } else if (chat.args[1] === 'known') {
                                    state.fear.known = [];
                                    this.pm(chat.player, 'Known players for fear has been reset (cleared).');
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        default:
                            this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            break;
                    }
                }
            }
        }
    }
}

on('ready', () => {
    log(`Daggerheart Fear script v${DaggerheartFearScript.VERSION} initializing.`);
    new DaggerheartFearScript();
    log(`Daggerheart Fear script initialized.`);
});