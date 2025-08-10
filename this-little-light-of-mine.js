///<reference path="./roll20.d.js" />

/**
 * This Little Light of Mine
 * 
 * WIP CHECK BACK LATER
 * 
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * https://github.com/orbotik
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * ### Any Player:
 * !llom [help/?]          Show this command reference.
 * !llom [on/off]          Light or douse your torch
 *                         GM Only: Does the same but for the selected token. Note that for NPCs and dynamic lighting
 *                         torches the "swap" option just renews the torch timer on that token.
 * !llom swap [match/candle/torch/lantern]
 *                         Swap your source of light to another. The color, brightness, and length of time the 
 *                         light source lasts will adjust with the type. If for a PC, the PC is required to have the
 *                         item in their inventory.
 *                         - Match: Lasts 3% of torch time. 5ft Distance. 25% Brightness.
 *                         - Candle: Lasts 25% of torch time. 15ft Distance. 50% Brightness.
 *                         - Torch: Lasts 100% of torch time (duh).
 *                         - Lantern: Lasts 100% of torch time (requires and drains Oil Flask). 2x Distance.
 * !llom status            Tells you the general amount of time remaining on the selected token's torch.
 *                         GM Only: Does the same tells you the exact amount of time remaining. 
 * ### GM Only:
 * #### Torch (Light Source) Control
 * In these commands the {id} is the target token's ID. The token may be any token on the map, including a dynamic
 * lighting torch token. You may omit this argument and the selected token will be used.
 * If "all" is used (where applicable), then all torch tokens on the active GM page are targeted.
 * 
 * Note that dynamic lighting torches are ignored unless a command is run targeting them, or they are "registered"
 * via the `grant` commands.
 * 
 * !llom {id/all} more               Adds 5% more (of total torch time) time to the (or all) token's torch.
 * !llom {id/all} less               Subtracts 5% (of total torch time) from the (or all) token's torch.
 * !llom {id} set [number][h/m]      Sets the exact time remaining on the token's torch.
 * !llom {id} set all [number][h/m]  Sets the exact time remaining on all torches in the token's inventory. This 
 *                                   command only works for character tokens.
 * !llom {id} [infinite/forever]     Sets the torch time for selected token's torch to infinity.
 * !llom {id} reset                  Resets the token's torch time back to the configured maximum.
 * !llom pc reset                    Resets ALL PC's active torches to the maximum configured torch time.
 * !llom pc reset inventory          Resets ALL PC's torches in inventory to the maximum configured torch time.
 * !llom npc reset                   Resets ALL NPC's active torches to the maximum configured torch time.
 * !llom env reset                   Resets ALL registered dynamic lighting torches to the maximum configured torch
 *                                   time.
 * !llom env register [page/game]    Registers ALL dynamic lighting torches in the page or game and sets them to the
 *                                   maximum configured torch time.
 * !llom env unregister [page/game]  Unregisters ALL dynamic lighting torches in the page or game. They will no longer
 *                                   be tracked or affected by the torch timer, and all configuration information on
 *                                   them will be removed.
 * 
 * #### Shadowdark Fun
 * These can target a specific torch token, the selected token, or ALL torch tokens on the active GM page.
 * 
 * !llom {id/all} dud                The active torch expires (even those marked as infinite).
 * !llom {id/all} duddles            The active torch expires (EXCEPT those marked as infinite).
 * !llom {id/all} wind               The active torch shows FX of smoke and sparks blowing in a random direction.
 * !llom {id/all} spark              The active torch shows FX of smoke and fire & sparks.
 * 
 * #### Game Control
 * The following commands help control how LLOM works in your game. Torches last 60 minutes by default. The torch
 * timer always starts "off" until set to "on" by the GM. Environmental torches will only be reduced when the
 * page is active (by players OR the GM!) when the torch timer is "on".
 * 
 * !llom torch timer [on/off]           Starts or stops the automatic torch brightness auto-adjustment (dimming) timer.
 * !llom pc torch time [number(h/m)/infinite/forever]   Changes how long fresh torches held by player-characters last.
 * !llom env torch time [number(h/m)/infinite/forever]  Changes how long fresh torches on the map last.
 * !llom npc torch time [number(h/m)/infinite/forever]  Changes how long fresh torches on held by NPCs last.
 * !llom fx smoke [on/off]              Torches nearing the end-of-life will start to emit more and more smoke FX.
 * !llom fx sparks [on/off]             Torches will occasionally emit sparks.
 * !llom status text {id} [all/pc/npc/env] 
 *                                      Registers a text object as a "status box" which shows the time remaining on the
 *                                      current page's registered and active torches. This can be for all tokens, just
 *                                      PCs, NPCs, or only the environment (dynamic lighting registered torches).
 * !llom torch style [grim/fluffy-bunnies] 
 *                                      Toggle the relative brightness of torches.
 *                                      - Grim is Shadowdark, low level brightness, enough to crawl the dungeon, but
 *                                        you wish you had more.
 *                                        Low light 60%, 30ft.
 *                                      - Fluffy-bunnies is Daggerheart, brighter, easy play, but still reasonable.
 *                                        Low light 100%, 30ft. Bright Light 10ft.
 */

class ThisLittleLightOfMineScript {

    static VERSION = '0.0.1';

    static BOT_NAME = 'The Game';

    static FX_TORCH = {
        angle: 0,
        angleRandom: 90,
        duration: 50,
        emissionRate: 20,
        endColour: [0, 0, 0, 0],
        endColourRandom: [0, 0, 0, 0],
        gravity: { "x": 0.01, "y": -5 },
        lifeSpan: 12,
        lifeSpanRandom: 10,
        maxParticles: 400,
        sharpness: 0,
        size: 1,
        sizeRandom: 5,
        speed: 0.25,
        speedRandom: 0.5,
        startColour: [150, 90, 50, 1],
        startColourRandom: [30, 20, 0, 0]
    }

    static FX_SPARKS = {
        angle: 0,
        angleRandom: 360,
        duration: -1,
        emissionRate: 1000,
        endColour: [130, 65, 41, 1],
        endColourRandom: [20, 10, 0, 0.15],
        gravity: { x: 0.01, y: 0.01 },
        lifeSpan: 35,
        lifeSpanRandom: 20,
        maxParticles: 50,
        sharpness: 0,
        size: 1,
        sizeRandom: 4,
        speed: 0.2,
        speedRandom: 0.9,
        startColour: [250, 228, 98, 1],
        startColourRandom: [5, 0, 0, 0.15]
    };

    static FX_SMOKE = {
        angle: 0,
        angleRandom: 90,
        duration: 20,
        emissionRate: 30,
        endColour: [10, 10, 10, 0],
        endColourRandom: [12, 12, 12, 0],
        gravity: { "x": 15, "y": 0 },
        gravityRandom: { "x": 25, "y": 0 },
        lifeSpan: 12,
        lifeSpanRandom: 10,
        maxParticles: 75,
        sharpness: 0,
        size: 8,
        sizeRandom: 8,
        speed: 0.1,
        speedRandom: 0.5,
        startColour: [30, 30, 30, 1],
        startColourRandom: [0, 10, 30, 0]
    };

    static RENDER_INTERVAL = 200;

    /**
     * Retains the (ephemeral) rendering state.
     * This information is not retained on restarts, and updates each render.
     */
    rendering = {
        /**
         * Indicates the number of ticks since the last render in milliseconds.
         */
        ticks: 0,
        /**
         * High-resolution timer interval value in milliseconds which increases over time.
         */
        now: 0,
        /**
         * Custom FX references.
         * @type {{ smokeID:String, sparksID:String, torchID:String }}
         */
        fx: null,
        /**
         * Dictionary to track render-time considerations by a key value (typically a Roll20 Object ID).
         */
        tracker: new Map(),
        /**
         * The running game interval for rendering.
         * @type {Number}
         */
        interval: null
    };

    constructor() {
        //init state
        // if (!state.littleLightOfMine || (typeof state.littleLightOfMine !== 'object')) {
        state.littleLightOfMine = {
            version: '0.0.1',
            chance: {
                missedWaitRandom: 750,
                successWaitRandom: 1000,
                smoke: 0.05,
                spark: 0.45
            }
        };
        // }
        //upgrade current version to latest
        // let cvb = this.versionBits(state.fear.version);
        // if (cvb.major <= 0 && cvb.minor <= 0 && cvb.patch < 1) {
        //     state.littleLightOfMine = Object.assign({
        //         //TODO: new features
        //     }, state.littleLightOfMine);
        // }
        state.littleLightOfMine.version = ThisLittleLightOfMineScript.VERSION;
        log(`ThisLittleLightOfMineScript startup state is: ${JSON.stringify(state.littleLightOfMine, null, 4)}`);
        //init objects
        this.rendering.fx = this.loadFX();
        //events
        on('chat:message', this.chatHandler.bind(this));
        this.rendering.interval = setInterval(this.render.bind(this), ThisLittleLightOfMineScript.RENDER_INTERVAL);
    }

    /**
     * @typedef Settings
     * @property {String} version - The semantic version of this script.
     * @property {Object} chance
     * @property {Number} chance.missedWaitRandom - A maximum number of milliseconds to randomly wait if a second has
     * elapsed, but no effect chance occurred. This can help fx appear more random. Maximum is 3s (3000ms).
     * @property {Number} chance.successWaitRandom - A maximum number of milliseconds to randomly wait if a second has
     * elapsed, and effect was generated. Maximum is 3s (3000ms).
     * @property {Number} chance.smoke - The chance that a torch will emanate smoke in 1 second.
     * @property {Number} chance.spark - The chance that a torch will emanate sparks in 1 second.
     */

    /**
     * @type {Settings}
     */
    get settings() {
        return state.littleLightOfMine;
    }

    /**
     * Parses a semantic version string into it's major, minor, and patch components.
     * @param {String} semver 
     * @returns {{major: Number, minor: Number, patch: Number}} Returns the parsed version components.
     */
    versionBits(semver) {
        if (!semver || typeof semver !== 'string') {
            throw new Error('A valid semver string is required.');
        }
        if (!semver.match(/^\d+\.\d+\.\d+$/)) {
            throw new Error('Invalid semver format, expected "major.minor.patch" format.');
        }
        let bits = semver.split('.').map(v => parseInt(v, 10));
        return { major: bits[0], minor: bits[1], patch: bits[2] };
    }

    /**
     * Send a player a private message (whisper).
     * @param {String | Object} playerObjOrID 
     * @param {String} message 
     */
    pm(playerObjOrID, message) {
        if (!message) {
            throw new Error('A message is required to send chat.');
        }
        if (typeof playerObjOrID === 'string') {
            playerObjOrID = getObj('player', playerObjOrID);
        }
        if (typeof message !== 'string') {
            throw new Error('Message must be a string.');
        }
        if (!playerObjOrID) {
            sendChat(ThisLittleLightOfMineScript.BOT_NAME, message);
        } else {
            sendChat(ThisLittleLightOfMineScript.BOT_NAME, `/w "${playerObjOrID.get('displayname')}" ${message}`, null, { noarchive: true });
        }
    }

    /**
     * Ensure that the LLOM custom FX are present and accounted for, if not, create them.
     * @return {{ smokeID:String, sparksID:String, torchID:String }}
     */
    loadFX() {
        let fx = {};
        let fxObjs = filterObjs(v => v.get('type') === 'custfx' && v.get('name').match(/^llom_/i));
        let loadFx = (name, definition) => {
            let o;
            if (!fxObjs || !fxObjs.length || fxObjs.some(v => v.get('name') === name) === false) {
                log(`Creating ${name} FX.`);
                o = createObj('custfx', { name, definition });
            } else {
                o = fxObjs.find(v => v.get('name') === name);
            }
            return o.id;
        }
        fx.smokeID = loadFx('llom_smoke', ThisLittleLightOfMineScript.FX_SMOKE);
        fx.sparksID = loadFx('llom_sparks', ThisLittleLightOfMineScript.FX_SPARKS);
        fx.torchID = loadFx('llom_torch', ThisLittleLightOfMineScript.FX_TORCH);
        return fx;
    }

    /**
     * Parses a Roll20 Chat Message.
     * @param {ChatMessage} msg 
     * @returns {{command:String, args:Array.<String>, player:Player, gm:Boolean }}
     */
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

    /**
     * Handles the LLOM render interval, meant to process random events and updates to LLOM tracked objects.
     */
    render() {
        //update ticks
        let now = Date.now();
        this.rendering.ticks = now - this.rendering.now;
        this.rendering.now = now;
        //do renders
        if (this.rendering.fx) {
            this.renderEnvironment(now, this.rendering.ticks, this.rendering.tracker);
        }
    }

    /**
     * Renders environmental torches.
     * @param {Number} now 
     * @param {Number} ticks 
     * @param {Map.<String, *>} tracker 
     */
    renderEnvironment(now, ticks, tracker) {
        //handle environmental lighting effects
        let envTorches = filterObjs((obj) =>
            obj.get('_type') === 'graphic' &&
            obj.get('imgsrc') === '/images/editor/torch.svg'
        );
        for (let t of envTorches) {
            let torchTracker = tracker.get(t.id);
            if (!torchTracker) {
                torchTracker = {};
                tracker.set(t.id, torchTracker);
            }
            //relight burnt out torches (effect lasts about 2s)
            if (!torchTracker?.torchBurn || now - torchTracker.torchBurn >= 700) {
                spawnFx(t.get('left'), t.get('top'), this.rendering.fx.torchID);
                torchTracker.torchBurn = now;
            }
            //torch random effect (spark, smoke).
            if (!torchTracker?.randomEffect || now - torchTracker.randomEffect >= 1000) {
                let nextNow = now;
                let triggered = false;
                if (Math.random() <= this.settings.chance.spark) {
                    spawnFx(t.get('left'), t.get('top'), this.rendering.fx.sparksID);
                    triggered = true;
                } else if (Math.random() <= this.settings.chance.smoke) {
                    spawnFx(t.get('left'), t.get('top'), this.rendering.fx.smokeID);
                    triggered = true;
                }
                if (triggered && this.settings.chance.successWaitRandom > 0) {
                    nextNow += Math.min(3000, (Math.random() * this.settings.chance.successWaitRandom));
                } else if (triggered === false && this.settings.chance.missedWaitRandom > 0) {
                    nextNow += Math.min(3000, (Math.random() * this.settings.chance.missedWaitRandom));
                }
                //we set the tracker updated time even if the chance occurrence didn't happen, so that there is a
                //wait to the next interval (1s) for a weighted chance.
                torchTracker.randomEffect = nextNow;
            }
        }
    }

    /**
     * Handles Roll20 chat messages and parses them for more information.
     * @param {ChatMessage} msg 
     */
    chatHandler(msg) {
        let chat = this.chatCommand(msg);
        if (chat?.command === 'llom') {
            this.pm(chat.player, 'hi!');
        }
    }

}

on('ready', () => {
    log(`This Little Light of Mine script v${ThisLittleLightOfMineScript.VERSION} initializing.`);
    new ThisLittleLightOfMineScript();
    log(`This Little Light of Mine script initialized.`);
});
