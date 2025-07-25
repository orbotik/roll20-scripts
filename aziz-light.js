/**
 * Aziz Light!
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * ### GM Only:
 * !azeez light              90% daytime light.
 * !azeez eve                20% daytime light.
 * !azeez dark               daytime light off.
 * !azeez exactly [number]   +5% daytime light.
 * !azeez more               +5% daytime light.
 * !azeez less               -5% daytime light.
 */

class AzizLightScript {

    VERSION = '1.0.0';

    constructor() {
        on('chat:message', this.onMessage.bind(this));
    }

    onMessage(msg) {
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
            if (command === 'aziz') {
                let currentPlayer = getObj('player', msg.playerid);
                if (currentPlayer) {
                    let gm = playerIsGM(currentPlayer.id);
                    if (gm) {
                        let page = getObj('page', currentPlayer.get('lastpage'));
                        let subCommand = (args[0] ?? '').replace('!', '');
                        switch (subCommand) {
                            case 'light': {
                                page.set({
                                    showlighting: true,
                                    daylight_mode_enabled: true,
                                    daylightModeOpacity: 0.9
                                });
                                break;
                            }
                            case 'eve': {
                                page.set({
                                    showlighting: true,
                                    daylight_mode_enabled: true,
                                    daylightModeOpacity: 0.20
                                });
                                break;
                            }
                            case 'dark': {
                                page.set({
                                    showlighting: true,
                                    daylight_mode_enabled: false,
                                    daylightModeOpacity: 0.05
                                });
                                break;
                            }
                            case 'exactly': {
                                let level = parseInt(args[1] || 0);
                                if (isFinite(level) && level >= 0 && level <= 100) {
                                    page.set({
                                        showlighting: true,
                                        daylight_mode_enabled: true,
                                        daylightModeOpacity: Math.max(0.05, Math.min(1, Math.round(level) / 100))
                                    });
                                }
                                break;
                            }
                            case 'less':
                            case 'more': {
                                let level = page.get('daylightModeOpacity');
                                level += subCommand === 'more' ? 0.05 : -0.05;
                                page.set({
                                    showlighting: true,
                                    daylight_mode_enabled: true,
                                    daylightModeOpacity: Math.max(0.05, Math.min(1, level))
                                });
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

}

on('ready', () => {
    log(`Aziz Light! script v${VERSION} initializing.`);
    new AzizLightScript();
    log(`Aziz Light! script initialized.`);
});
