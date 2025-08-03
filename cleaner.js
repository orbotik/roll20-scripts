/**
 * # Handout Notes HTML Normalizer
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * ### GM Only:
 * !cleaner [handout]                 Cleans (normalizes) the notes (& GM notes) of the named handout.
 */

class OrbotikCleaner {

    VERSION = '1.0.0';

    constructor() {

        this.tagAttributes = {
            h1: ['style="font-variant: small-caps; font-family: Garamond;"'],
            h2: ['style="font-variant: small-caps; font-family: Garamond;"'],
            h3: ['style="font-variant: small-caps; font-family: Garamond;"'],
            h4: ['style="font-variant: small-caps; font-family: Garamond;"'],
            h5: ['style="font-variant: small-caps; font-family: Garamond;"'],
            h6: ['style="font-variant: small-caps; font-family: Garamond;"'],
            mark: ['style="padding: 0"'],
            table: ['style="font-size:0.875em;line-height:1.125em;border: 1px solid #AAA" border="1"']
        }

        this.htmlTransforms = [
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout"/i,
                matchInner: /<div.+userscript-callout-title-inner[^>]*>\s*note\s*<\/div>/i,
                replaceTag: 'blockquote',
                replaceAttributes: 'style="border-color: #0E6388; background-color: #ECFFFF;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout"/i,
                matchInner: /<div.+userscript-callout-title-inner[^>]*>\s*tip\s*<\/div>/i,
                replaceTag: 'blockquote',
                replaceAttributes: 'style="border-color: #87790F; background-color: #FFFFED;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout"/i,
                matchInner: /<div.+userscript-callout-title-inner[^>]*>\s*important\s*<\/div>/i,
                replaceTag: 'blockquote',
                replaceAttributes: 'style="border-color: #0E6F2A; background-color: #CFF8DF;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout"/i,
                matchInner: /<div.+userscript-callout-title-inner[^>]*>\s*warning\s*<\/div>/i,
                replaceTag: 'blockquote',
                replaceAttributes: 'style="border-color: #6C0B18; background-color: #FFE9F4;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout"/i,
                matchInner: /<div.+userscript-callout-title-inner[^>]*>\s*caution\s*<\/div>/i,
                replaceTag: 'blockquote',
                replaceAttributes: 'style="border-color: #6C0B18; background-color: #FFF2EF;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout"/i,
                replaceTag: 'blockquote',
                replaceAttributes: ''
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout-title-inner"/i,
                matchInner: /note/i,
                replaceTag: 'strong',
                replaceAttributes: 'style="color: #0E6388; font-variant: small-caps;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout-title-inner"/i,
                matchInner: /tip/i,
                replaceTag: 'strong',
                replaceAttributes: 'style="color: #87790F; font-variant: small-caps;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout-title-inner"/i,
                matchInner: /important/i,
                replaceTag: 'strong',
                replaceAttributes: 'style="color: #0E6F2A; font-variant: small-caps;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout-title-inner"/i,
                matchInner: /warning/i,
                replaceTag: 'strong',
                replaceAttributes: 'style="color: #87790F; font-variant: small-caps;"'
            },
            {
                tag: 'div',
                matchAttributes: /class="userscript-callout-title-inner"/i,
                matchInner: /caution/i,
                replaceTag: 'strong',
                replaceAttributes: 'style="color: #6C0B18; font-variant: small-caps;"'
            }
        ];

        //init
        log('Initialized Orbotik Cleaner...');
        on('chat:message', this.onChatMessage.bind(this));
    }

    /**
     * Goodby dirty HTML.
     */
    clean(html) {
        if (html) {
            //transform special content
            for (let transform of this.htmlTransforms) {
                let openTagMatch = new RegExp(`<${transform.tag}[^>]*>`, 'i');
                let closingTagMatch = new RegExp(`</\s*${transform.tag}[^>]*>`, 'i');
                let openTagMatchAll = new RegExp(`<${transform.tag}[^>]*>`, 'gi');
                let closingTagMatchAll = new RegExp(`</\s*${transform.tag}[^>]*>`, 'gi');
                let openTagMatches = html.matchAll(openTagMatchAll);
                let closingTagMatches = html.matchAll(closingTagMatchAll);
                let matches = [...openTagMatches, ...closingTagMatches].sort((a, b) => a.index - b.index);
                let offset = 0;
                for (let mi = 0; mi < matches.length; mi++) {
                    if (
                        openTagMatch.test(matches[mi][0])
                        && (
                            !transform.matchAttributes
                            || (transform.matchAttributes && transform.matchAttributes.test(matches[mi][0]))
                        )
                    ) {
                        let openingTag = {
                            start: matches[mi].index + offset,
                            end: matches[mi].index + matches[mi][0].length + offset
                        };
                        let closingTag = { start: -1, end: -1 }
                        //walk ahead and find closing tag
                        let punt = 0;
                        for (let wai = mi + 1; wai < matches.length; wai++) {
                            if (openTagMatch.test(matches[wai][0])) {
                                punt++;
                            } else if (closingTagMatch.test(matches[wai][0])) {
                                if (punt <= 0) { //found our closing tag!
                                    closingTag.start = matches[wai].index + offset;
                                    closingTag.end = matches[wai].index + matches[wai][0].length + offset;
                                    break;
                                }
                                punt--;
                            }
                        }
                        if (closingTag.start > -1 && closingTag.end > -1) {
                            let innerHTML = html.substring(openingTag.end, closingTag.start);
                            if (
                                !transform.matchInner
                                || (transform.matchInner && transform.matchInner.test(innerHTML))
                            ) {
                                let originalLen = html.length;
                                html = html.substring(0, openingTag.start)
                                    + `<${transform.replaceTag ?? transform.tag}${transform.replaceAttributes ? ' ' + transform.replaceAttributes : ''}>`
                                    + innerHTML
                                    + `</${transform.replaceTag ?? transform.tag}>`
                                    + html.substring(closingTag.end);
                                offset += html.length - originalLen;
                            }
                        } else {
                            log(`Found no closing tag "${transform.tag}" for matching result of transform at index ${this.htmlTransforms.indexOf(transform)}.`)
                        }
                    }
                }
            }
            //cleanup
            html = html
                //strip all attributes (except from a tags)
                .replace(/<((?:(?!a)[a-zA-Z0-9]+))[^>]*>/gi, (substring, m1) => {
                    //don't touch transformed html tags
                    for (let transform of this.htmlTransforms) {
                        let tm = new RegExp(`<${transform.replaceTag ?? transform.tag}${transform.replaceAttributes ? ' ' + transform.replaceAttributes : ''}>`, 'i');
                        if (tm.test(substring)) {
                            return substring;
                        }
                    }
                    return `<${m1}>`;
                })
                //strip all divs
                .replace(/<div>|<\/div>/gi, '')
                //replace dead-end breaks
                .replace(/<br\s*\/?>{1,}<\/p>\s*$/gi, '</p>')
                .replace(/<br\s*\/?>{1,}\s*$/gi, '')
                //replace empty paragraphs with breaks
                .replace(/<p>\s*<\/p>/gim, '<br>')
                //remove empty spans
                .replace(/<span>\s*<\/span>/gim, '')
                //replace 4+ newline breaks with a two
                .replace(/(?:<br\s*\/?>){4,}/gim, '<br><br>')
                //trim start
                .replace(/^(\s|\n|<p><br\s*\/?><\/p>|<p><\/p>|<br\s*\/?>|:)+/gi, '')
                //trim end
                .replace(/(\s|\n|<p><br\s*\/?><\/p>|<p><\/p>|<br\s*\/?>|:)+$/gi, '');
            //add clean styles
            for (let tag in this.tagAttributes) {
                let attrs = this.tagAttributes[tag];
                if (attrs && attrs.length && Array.isArray(attrs)) {
                    html = html.replace(new RegExp(`<(${tag})([^>]*)>`, 'gi'), `<$1 ${attrs.join(' ')}>`);
                }
            }
        }
        return html;
    }

    cleanerCommand(characterName, playerID, ...args) {
        log(`${characterName} (${playerID}): cleaner("${args.join('", "')}")`);
        args = args.filter(v => v && v.length && v.trim().length); //skip blank arguments.
        if (characterName && playerID) {
            let sender = 'Cleaner';
            let recipient = characterName;
            let message;
            if (playerIsGM(playerID) === false) {
                message = 'Sorry, only GMs can do that.'
            } else if (args.length > 1) {
                message = 'Only one argument is accepted, which must be the name or ID of the handout to clean. Use quotes for names with spaces.';
            } else if (args.length === 1) {
                log(`INFO: Attempting to load handout: "${args[0]}"`);
                let hos = findObjs({
                    type: 'handout',
                    name: args[0]
                }, { caseInsensitive: true });
                if (hos) {
                    if (hos.length > 1) {
                        message = `More than 1 handout was found with the name "${args[0]}" (case-insensitive). Please be more specific.`;
                    } else {
                        let ho = hos[0];
                        let hoName = ho.get('name');
                        ho.get('notes', (html) => {
                            log('Cleaning notes...');
                            html = this.clean(html);
                            if (html) {
                                ho.set('notes', html);
                            }
                        });
                        ho.get('gmnotes', (html) => {
                            log('Cleaning GM notes.');
                            html = this.clean(html);
                            if (html) {
                                ho.set('gmnotes', html);
                            }
                        });
                        message = `Handout ${hoName} has been cleaned.`;
                    }
                } else {
                    message = `A handout with the name or ID "${args[0]}" was not found.`;
                    log(`A handout with the name or ID "${args[0]}" was not found.`);
                }
            } else {
                message = `<h1>Cleaner Help</h1><p>This script cleans the HTML in a handout - transforming it into a normalized style.</p><p><mark>!cleaner [handout id <em>or</em> name]</mark></p>`;
            }
            this.sendChatMessage(sender, `/w ${recipient} ${message}`);
        }
    }

    /**
     * Sends a chat message.
     */
    sendChatMessage(playerNameOrID, message, archive = false) {
        if (playerNameOrID && message) {
            if (playerNameOrID.match(/^-[A-z0-9]+$/)) {
                playerNameOrID = `player|${playerNameOrID}`;
            }
            sendChat(playerNameOrID, message, null, { noarchive: !archive });
        }
    }

    /**
     * Handle incoming chat messages with the `!whatis` command.
     */
    onChatMessage(msg) {
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
            args = args.map(v => v.replaceAll(/[^a-zA-Z0-9 _=@\-()&+]/g, ''));
            if (command === 'cleaner') {
                this.cleanerCommand(msg.who, msg.playerid, ...args);
            }
        }
    }

}

on('ready', function () {
    'use strict';
    new OrbotikCleaner();
});