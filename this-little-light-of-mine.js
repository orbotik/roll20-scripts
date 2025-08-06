/**
 * This Little Light of Mine
 * 
 * WIP CHECK BACK LATER
 * 
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
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

    constructor() {
        //ready
    }

}

on('ready', () => {
    log(`This Little Light of Mine script v${ThisLittleLightOfMineScript.VERSION} initializing.`);
    new ThisLittleLightOfMineScript();
    log(`This Little Light of Mine script initialized.`);
});
