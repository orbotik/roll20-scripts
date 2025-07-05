/**
 * # WhatIs
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * ### Any Player:
 * !whatis                                Show the whatis handout's intro section content.
 * !whatis @subjects                      Show a list of all known subjects with buttons to jump to their respective topics.
 * !whatis [subject] [topic]              Show the contents of a specific subject and/or topic (use quotes if they have spaces).
 * !whatis [...search terms]              Perform a general search with one or more search terms.
 * !whatis @search [...search terms]      Same as above, but forces the search, even if a term directly matches a subject/topic.
 * !whatis to@[playername] […]            Send the results of a following !whatis command to the specified player. You can also specify "everyone" to send to everyone in the game, or "gm" to send to the GM of the game.
 * !whatis @table [tablename] [# or #-#]  Examine a rollable table and show contents, optionally specifying a specific roll at the given entry number (or range).
 * ### GM Only:
 * !whatis @reload                        GM-only. Attempts to reload (re-parse) your whatis document.
 */

const WHATIS_HANDOUT_ID = null;
const WHATIS_HANDOUT_NAME = 'whatis';
const WHATIS_PARAM_TO_REGEX = /to@/i;
const WHATIS_PARAM_AFTER_REGEX = /after@([0-9]+)/i;
const WHATIS_PARAM_SEARCH_REGEX = /@search/i;
const WHATIS_PARAM_SUBJECTS_REGEX = /@subjects/i;
const WHATIS_PARAM_TABLE_REGEX = /@table/i;
const WHATIS_ARG_INDEX_OR_RANGE = /^([0-9]+)(?:-([0-9]+))?$/i;
const MAXIMUM_SEARCH_RESULTS = 8;
const MAXIMUM_SEARCH_CONTENT_LENGTH = 128;

const HTML = {
    /**
     * Check if the value appears to have HTML tags in it.
     */
    is(value) {
        return !!(value?.length && value.match(/<\/?[a-z][\s\S]*>/i));
    },

    strip(input) {
        if (input) {
            return input
                .replace(/<br\s*\/?>/gi, ' ') //turn breaks into spaces
                .replace(/\[.+\]\(\!.+?\)/gm, '') //strip markdown macro links
                .replace(/<a.*href=['"]![^>]*>(?:.|\r|\n)*?<\/a>/gm, '') //strip macro HTML links
                .replace(/<[^>]*>?/gm, '') //strip all html
                .replaceAll(/\r|\n/g, '')
                .replace(/&amp;|&#38;/gim, '&') //amperstand
                .trim();
        }
        return input;
    },

    /**
     * Checks if the string contains the specified HTML tag (opening or closing).
     * @param {String} value 
     * @param {String} tag 
     * @returns {Boolean}
     */
    hasTag(value, tag) {
        return new RegExp(`<${tag}[^>]*>?`, 'i').test(value);
    },

    /**
     * Extracts an array of HTML where that chunk of text begins with a
     * specific HTML tag(s).
     * @param {String} text 
     * @param {String | Array.<String>} tag 
     */
    extractByTag(text, tag) {
        //walk the text finding any tags
        let blocks = [];
        if (text) {
            if (tag && Array.isArray(tag) === false) {
                tag = [tag];
            }
            for (let thing of text.matchAll(new RegExp(`<(?:${tag.join('|')})[^>]*>`, 'gim'))) {
                blocks.push(thing.index);
            }
            //update to grab text blocks for each H1 section
            for (let x = 0; x < blocks.length; x++) {
                if (x < blocks.length) {
                    blocks[x] = text.substring(blocks[x], blocks[x + 1]);
                } else {
                    blocks[x] = text.substring(blocks[x]);
                }
            }
        }
        return blocks;
    },

    /**
     * Finds and extracts the HTML for a first found element with the given tag. If the tag is not found
     * (either starting or closing) then a `null` value is returned.
     * @returns {{startIndex:Number, endIndex:Number, innerHTML:String}}
     */
    innerHTML(text, tag) {
        if (text) {
            if (tag && Array.isArray(tag) === false) {
                tag = [tag];
            }
            let match = text.match(new RegExp(`<(?:${tag.join('|')})[^>]*>((?:.|\r|\n)*?)<\/(?:${tag.join('|')})>`, 'i'));
            if (match) {
                return {
                    startIndex: match.index,
                    endIndex: match.index + match[0].length,
                    innerHTML: match[1]
                };
            }
        }
        return null;
    },

    /**
     * Trims extraneous characters and newlines and blank paragraphs/divs from the given string/HTML value.
     */
    clean(value) {
        if (value) {
            value = value
                //add style-fix to mark
                .replace(/<mark([^>]*)>/gi, '<mark style="padding: 0" $1>')
                //add style-fix to table
                .replace(/<table([^>]*)>/gi, '<table style="font-size:0.75em;line-height:1.125em;border: 1px solid #AAA" border="1">')
                //remove surrounding p or div tag (optional leading colon from lists as well)
                .replace(/^<p>:?\s*|\s*<\/p>$/gi, '')
                //replace dead-end breaks
                .replace(/<br\s*\/?>{1,}<\/p>\s*$/gi, '</p>')
                .replace(/<br\s*\/?>{1,}\s*$/gi, '')
                // //replace empty paragraphs with breaks
                .replace(/<p>\s*<\/p>/gim, '<br>')
                // //replace 4+ newline breaks with a two
                .replace(/(?:<br\s*\/?>){4,}/gim, '<br><br>')
                // //trim start
                .replace(/^(\s|\n|<p><br\s*\/?><\/p>|<p><\/p>|<br\s*\/?>|:)+/gi, '')
                // //trim end
                .replace(/(\s|\n|<p><br\s*\/?><\/p>|<p><\/p>|<br\s*\/?>|:)+$/gi, '')
        }
        return value;
    },

    styled: {
        indexRef(number) {
            return `<small style="font-family: monospace">${(number + 1).toString().padStart(3, '0')}</small>`
        },
        listItemOpen() {
            return '<li style="padding-bottom: 0.5rem; margin-bottom: 0.5rem; border-bottom: 1px dashed #AAA;">';
        }
    }
}

const Strings = {
    /**
     * Truncates a given string from the tail-end (reverse truncate) up to the max. length, and adds an ellipsis if
     * necessary.
     * @param {String} input - The string to (potentially) truncate.
     * @param {Number} max - The max. length of the input string allowed before it is truncated.
     * @returns {String}
     */
    truncate(input, max) {
        return (input.length < max) ? input : input.substring(0, max).replace(/.{3}$/gi, '...');
    },

    escapeRegExp(input) {
        return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
};

class WhatIs {
    'use strict';
    constructor() {
        /**
         * @type {{
         *  loaded:Boolean,
         *  handoutID:String,
         *  help:String,
         *  dictionary:Map.<String, {name:String, topics:Map.<String, {name:String, subject:String, definition:String, aliasTo:String}>}>
         * }}
         */
        this.whatis = {};

        //init
        log('Initialized WhatIs');
        this.loadWhatIs();
        on('chat:message', this.onChatMessage.bind(this));
    }

    /**
     * Kicks off the loading of the WhatIs command.
     */
    loadWhatIs() {
        let wio = null;
        if (this.whatis?.handoutID) {
            log('INFO: Attempting to load previously known handout: ' + this.whatis.handoutID);
            wio = getObj('handout', this.whatis.handoutID);
        }
        if (!wio) {
            if (!WHATIS_HANDOUT_ID) {
                log('WARN: Script does not have a whatis handout ID defined. Searching by name instead.');
                wio = findObjs({ name: WHATIS_HANDOUT_NAME, _type: 'handout' }, { caseInsensitive: true });
                if (wio.length) {
                    wio = wio[0];
                }
            } else {
                log('INFO: Attempting to load constant known handout: ' + WHATIS_HANDOUT_ID);
                wio = getObj('handout', WHATIS_HANDOUT_ID);
            }
        }
        if (!wio?.id) {
            log('ERROR: Missing WhatIs handout. No information will be available.');
            return;
        } else {
            log('INFO: WhatIs handout ID is: ' + wio.id);
        }
        //start parsing content.
        this.whatis.object = wio;
        this.whatis.handoutID = wio.id;
        this.whatis.dictionary = new Map();
        this.whatis.loaded = false;
        wio.get('notes', this.parseWhatIs.bind(this));
    }

    /**
     * Parses the text of the WhatIs handout document.
     */
    parseWhatIs(html) {
        let topicCount = 0;
        let topicAliasCount = 0;
        if (html && typeof html === 'string') {
            let startIndex = 0;
            //an hr can be used to remove anything prior from consideration, so
            //that instructions can be included at the top of the document.
            let start = html.match(/<hr\s*\/?>/i);
            if (start) {
                this.whatis.help = html.substring(0, start.index);
                startIndex = start.index + start[0].length;
            }
            html = html.substring(startIndex); //discard instructions
            //walk the text finding any H1's - these are "subjects".
            let subjectBlocks = HTML.extractByTag(html, 'h1');
            //now iterate the subjects text and find "topics".
            for (let sb of subjectBlocks) {
                let subject = HTML.innerHTML(sb, 'h1');
                if (subject && subject.innerHTML && HTML.is(subject.innerHTML) === false) {
                    let subjectName = HTML.strip(subject.innerHTML);
                    //does this look like a bullet-point list or a
                    //documenation-style list (H2's as the "definition")?
                    let topicBlocks = [];
                    let topicListingType = 'unknown';
                    if (HTML.hasTag(sb, 'h2')) { //doc-style
                        topicBlocks = HTML.extractByTag(sb, 'h2');
                        topicListingType = 'doc';
                    } else if (HTML.hasTag(sb, 'li')) { //bullet or ordered list
                        let list = HTML.innerHTML(sb, ['ul', 'ol']);
                        if (list) {
                            topicBlocks = HTML.extractByTag(sb, 'li');
                            topicListingType = 'list';
                        } else {
                            log(`WARN: Found an empty list under subject "${subjectName}".`);
                        }
                    } else {
                        //ignore, likely something incomplete...
                        log(`WARN: Found incomplete list under subject "${subjectName}".`);
                    }
                    for (let r = 0; r < topicBlocks.length; r++) {
                        //now we get to the actual topic definitions...
                        let raw = topicBlocks[r];
                        let topic, definition;
                        if (topicListingType === 'doc') {
                            topic = HTML.innerHTML(raw, 'h2');
                            if (topic) {
                                definition = raw.slice(0, topic.startIndex) + raw.slice(topic.endIndex);
                                definition = HTML.clean(definition);
                            }
                        } else if (topicListingType === 'list') {
                            topic = HTML.innerHTML(raw, ['b', 'strong']);
                            if (topic) {
                                definition = raw.slice(0, topic.startIndex) + raw.slice(topic.endIndex);
                                definition = HTML.clean(HTML.innerHTML(definition, 'li')?.innerHTML ?? '');
                            }
                        }
                        if (topic && topic.innerHTML) {
                            let topicNameHasHTML = HTML.is(topic.innerHTML);
                            if (topicNameHasHTML) {
                                log(`WARN: Found incomplete topic under subject "${subjectName}" (entry #${r + 1}) which contains HTML in it's name. The topic (name) must be a plain H2 or b/strong element with no inner HTML.`);
                            } else {
                                let topicName = HTML.strip(topic.innerHTML);
                                let aliases = [];
                                if (topicName.indexOf('/') > -1) {
                                    aliases = topicName.split('/').filter(v => v && v.trim());
                                    topicName = aliases[0];
                                    aliases.splice(0, 1);
                                }
                                this.addWhatIs(subjectName, topicName, definition);
                                topicCount++;
                                if (aliases.length) {
                                    for (let alias of aliases) {
                                        this.addWhatIs(
                                            subjectName,
                                            alias,
                                            `<i>"${alias}" is an alias of "${topicName}".</i><br><a href='!whatis "${subjectName}" "${topicName}"'>${topicName}</a>`,
                                            topicName
                                        );
                                        topicAliasCount++;
                                    }
                                }
                            }
                        } else {
                            log(`WARN: Found incomplete topic under subject "${subjectName}" on entry #${r + 1}.`);
                        }
                    }
                }
            }
        }
        //sort it all
        this.whatis.dictionary = new Map([...this.whatis.dictionary.entries()].sort());
        for (let [k, v] of this.whatis.dictionary) {
            v.topics = new Map([...v.topics.entries()].sort());
        }
        log(`INFO: WhatIs dictionary loaded with ${this.whatis.dictionary.size} subjects and ${topicCount} topics with ${topicAliasCount} aliases.`);
        this.whatis.loaded = true;
    }

    /**
     * Adds a new WhatIs subject & topic to the WhatIs dictionary.
     */
    addWhatIs(subjectName, topic, topicDefinition, aliasTo) {
        let subjectKey = subjectName.toLowerCase().trim();
        if (this.whatis.dictionary.has(subjectKey) === false) {
            this.whatis.dictionary.set(subjectKey, {
                name: subjectName,
                topics: new Map()
            });
        }
        let subject = this.whatis.dictionary.get(subjectKey);
        subject.topics.set(topic.toLowerCase().trim(), {
            name: topic,
            subject: subjectName,
            definition: topicDefinition,
            aliasTo
        });
    }

    /**
     * Returns a message that lists out available subjects in the !whatis dictionary.
     */
    whatisSubjectList() {
        let message = `<h2>Subjects</h2><small>${this.whatis.dictionary.size} subjects in the !whatis dictionary.</small><ul>`;
        for (let [k, v] of this.whatis.dictionary) {
            message += `<li>[${v.name}](!whatis '${v.name}') ${this.whatis.dictionary.get(k).topics.size} topics.</li>`
        }
        message += '</ul><h4>Ready to start digging?</h4><p>Try <mark style="padding: 0">!whatis [subject]</mark> to explore a subject.</p>'
        return message;
    }

    /**
     * Returns a message that lists the items in a rollable table, possibly at the specified range or index.
     */
    whatisTableLookup(playerID, tableName, rangeSearch) {
        let tn = HTML.strip(tableName);
        let rTables = findObjs({ name: tn, _type: 'rollabletable' }, { caseInsensitive: true });
        let isGM = playerIsGM(playerID);
        let message = `<h3>Not Found</h3><br><small>A rollable table with name "${tn}" was not found.</small>`;
        if (rTables.length === 1 && (isGM || rTables[0].get('showplayers'))) {
            let items = findObjs({ _rollabletableid: rTables[0].id, _type: 'tableitem' }, { caseInsensitive: true });
            message = `<h2>${rTables[0].get('name')}</h2><small>Rollable table contains ${items?.length ?? 0} entries.</small><ul>`;
            let minIndex = 0;
            let maxIndex = items.length;
            if (WHATIS_ARG_INDEX_OR_RANGE.test(rangeSearch)) {
                let range = rangeSearch.match(WHATIS_ARG_INDEX_OR_RANGE);
                log(range);
                if (range[1]) {
                    minIndex = parseInt(range[1]) - 1;
                    maxIndex = minIndex + 1;
                }
                if (range[2]) {
                    maxIndex = parseInt(range[2]);
                }
            }
            if (isNaN(minIndex) || !isFinite(minIndex) || minIndex < 0 || isNaN(maxIndex) || !isFinite(maxIndex) || maxIndex < 0 || maxIndex < minIndex) {
                message = `<h3>Invalid Table Range</h3><br><small>The index or range specified is not valid.</small>`;
            } else {
                for (let i = minIndex; i < Math.min(items.length, maxIndex); i++) {
                    message += `${HTML.styled.listItemOpen()}${HTML.styled.indexRef(i)} ${items[i].get('name')}`;
                    if (isGM) {
                        message += `<br><small>Weight: ${items[i].get('weight')}</small>`;
                    }
                    message += '</li>';
                }
                message += '</ul>';
            }
        } else if (rTables.length > 1) {
            message = `<h3>Excessive Matches</h3><br><small>Multiple rollable tables with name "${tn}" were found. Please be more specific.</small>`;
        }
        return message;
    }

    /**
     * Crafts an HTML ordered list of search results for the WhatIs command.
     * @param {String} subjectName 
     * @param {Number} pageAfter 
     * @param {Array.<{name:String, subject:String, definition:String, aliasTo:String}>} matches 
     * @param {String | Array.<String>} [keywords]
     * @param {String} [notice]
     * @returns {String}
     */
    whatisSearchResult(subjectName, pageAfter, matches, keywords, notice) {
        //prep keywords
        if (typeof keywords === 'string') {
            keywords = [keywords];
        }
        if (keywords?.length) {
            keywords = keywords.filter(v => v && v.length && v.trim().length); //no blank keywords
        }
        //handle the subtext notice
        let resultCountNotice = `Showing ${matches.length} result${matches.length !== 1 ? 's' : ''}.`;
        if (matches.length === 0) {
            resultCountNotice = 'No results found.'
        } else if (matches.length > MAXIMUM_SEARCH_RESULTS) {
            resultCountNotice = `Showing results ${pageAfter + 1} to ${Math.min(pageAfter + MAXIMUM_SEARCH_RESULTS, matches.length)} of ${matches.length} total.`;
        }
        if (keywords?.length) {
            resultCountNotice += `<br>"${keywords.join('" <i>AND</i> "')}"`;
        }
        let message;
        if (subjectName) {
            message = `<h2>${subjectName}</h2><small>${notice ? notice + '<br>' : ''}${resultCountNotice}</small><ul>`;
        } else {
            message = `<h2>Search Results</h2><small>${notice ? notice + '<br>' : ''}${resultCountNotice}</small>`;
        }
        let currentSubject;
        for (let di = pageAfter; di < matches.length; di++) {
            let { name, subject, definition, aliasTo } = matches[di];
            let content = HTML.strip(definition);
            //let's see if we're on a new subject
            if (!subjectName && currentSubject !== subject) {
                if (currentSubject) {
                    message += '</ul>'; //close out the last subject list
                }
                message += `<h3>${subject}</h3><ul>`;
                currentSubject = subject;
            }
            //highlight keywords
            let highlightedName = name;
            if (keywords && keywords.length) {
                if (content.length > MAXIMUM_SEARCH_CONTENT_LENGTH) {
                    //move shown content to an area where it actually begins matching keywords.
                    let firstIndex = -1;
                    for (let kw of keywords) {
                        if (firstIndex === -1) {
                            let match = content.match(new RegExp(kw, 'i'));
                            if (match) {
                                firstIndex = match.index ?? -1;
                                break;
                            }
                        }
                    }
                    //adjust starting point for content.
                    if (firstIndex > '<mark style="padding: 0">'.length + MAXIMUM_SEARCH_CONTENT_LENGTH / 2) {
                        content = '...' + content.substring(firstIndex - MAXIMUM_SEARCH_CONTENT_LENGTH / 2);
                    } else if (firstIndex > '<mark style="padding: 0">'.length + MAXIMUM_SEARCH_CONTENT_LENGTH / 4) {
                        content = '...' + content.substring(firstIndex - MAXIMUM_SEARCH_CONTENT_LENGTH / 4);
                    }
                }
                content = Strings.truncate(content, MAXIMUM_SEARCH_CONTENT_LENGTH);
                //highlight it all.
                for (let kw of keywords) {
                    content = content.replaceAll(new RegExp(kw, 'gi'), `<mark style="padding: 0">${kw}</mark>`);
                    highlightedName = highlightedName.replaceAll(new RegExp(kw, 'gi'), `<mark style="padding: 0">${kw}</mark>`);
                }
            } else {
                content = Strings.truncate(content, MAXIMUM_SEARCH_CONTENT_LENGTH);
            }
            //definition message
            message += HTML.styled.listItemOpen();
            if (aliasTo) {
                message += `${HTML.styled.indexRef(di)} <a href='!whatis "${subject}" "${aliasTo}"'>${highlightedName} ⧽ ${aliasTo} »</a><br>${content}`;
            } else {
                message += `${HTML.styled.indexRef(di)} <a href='!whatis "${subject}" "${name}"'>${highlightedName} »</a><br>${content}`;
            }
            message += '</li>';
            if (di - pageAfter + 1 >= MAXIMUM_SEARCH_RESULTS) {
                break;
            }
        }
        message += '</ul>';
        if (matches.length > pageAfter + MAXIMUM_SEARCH_RESULTS) {
            message += `<a href='!whatis after@${pageAfter + MAXIMUM_SEARCH_RESULTS} `;
            if (subjectName) {
                message += `"${subjectName}" `;
            }
            if (keywords && keywords.length) {
                message += `"${keywords.join('" "')}"`;
            }
            message += `'>Show More</a>`;
        } else if (pageAfter > 0) {
            message += `<small>No more results.</small>`;
        }
        return message;
    }

    whatisCommand(characterName, playerID, ...args) {
        log(`${characterName} (${playerID}): whatis("${args.join('", "')}")`);
        args = args.filter(v => v && v.length && v.trim().length); //skip blank arguments.
        if (characterName && playerID && args.length) {
            if (args.length > 10) {
                this.sendChatMessage('WhatIs', `/w ${characterName} Oops! The <mark>!whatis</mark> command is limited to a total of 10 arguments. Try shortening your query.`);
            } else if (args.some(a => a && a.length > 192)) {
                this.sendChatMessage('WhatIs', `/w ${characterName} Oops! The <mark>!whatis</mark> command cannot accept any arguments longer than 192 characters. Try shortening your query.`);
            } else if (args.findIndex(v => WHATIS_PARAM_TO_REGEX.test(v)) > 0) {
                this.sendChatMessage('WhatIs', `/w ${characterName} Oops! The <mark>!whatis</mark> command requires the <mark>to@</mark> argument be the first in the list.`);
            } else if (args.length === 1 && playerIsGM(playerID) && /@reload/i.test(args[0])) {
                this.sendChatMessage('WhatIs', `/w ${characterName} Reloading WhatIs document.`);
                this.loadWhatIs();
            } else {
                let sender = 'WhatIs';
                let recipient = characterName;
                let subjectList = false;
                let searchForced = false;
                let tableLookup = false;
                let searchTermArgIndex = 0;
                let pageAfter = 0;
                let message;
                //check for a "to@"
                if (WHATIS_PARAM_TO_REGEX.test(args[0])) {
                    sender = characterName;
                    if (args[0].length === 3) { //a quoted character name comes in as the next argument.
                        recipient = args[1];
                        searchTermArgIndex = 2;
                    } else {
                        recipient = args[0].substring(3); //skip the "to@"
                        searchTermArgIndex = 1;
                    }
                }
                //look for other arguments that modify function/output
                let readModifierParams = true;
                while (readModifierParams) {
                    readModifierParams = false;
                    if (WHATIS_PARAM_AFTER_REGEX.test(args[searchTermArgIndex])) {
                        let after = parseInt(args[0].match(WHATIS_PARAM_AFTER_REGEX)[1]);
                        if (isNaN(after) === false && after >= 0) {
                            pageAfter = after;
                        } else {
                            log(`WARN: Bad "after:" argument. Could not parse integer from "${args[0]}"`)
                        }
                        searchTermArgIndex++;
                        readModifierParams = true;
                    }
                    if (WHATIS_PARAM_SEARCH_REGEX.test(args[searchTermArgIndex])) {
                        searchForced = true;
                        searchTermArgIndex++;
                        readModifierParams = true;
                    }
                    if (WHATIS_PARAM_SUBJECTS_REGEX.test(args[searchTermArgIndex])) {
                        subjectList = true;
                        searchTermArgIndex++;
                        readModifierParams = true;
                    }
                    if (WHATIS_PARAM_TABLE_REGEX.test(args[searchTermArgIndex])) {
                        tableLookup = true;
                        searchTermArgIndex++;
                        readModifierParams = true;
                    }
                }
                //handle odd params
                if (subjectList && (tableLookup || searchForced || pageAfter)) {
                    this.sendChatMessage('WhatIs', `/w ${characterName} Oops! The <mark>!whatis</mark> command with @subjects cannot be combined with @table, @search, or @after.`);
                    return;
                } else if (tableLookup && (subjectList || searchForced || pageAfter)) {
                    this.sendChatMessage('WhatIs', `/w ${characterName} Oops! The <mark>!whatis</mark> command with @table cannot be combined with @subjects, @search, or @after.`);
                    return;
                } else if (subjectList) {
                    message = this.whatisSubjectList();
                } else if (tableLookup) {
                    if (args.length - searchTermArgIndex === 1) {
                        message = this.whatisTableLookup(playerID, args[searchTermArgIndex]);
                    } else if (args.length - searchTermArgIndex === 2) {
                        message = this.whatisTableLookup(playerID, args[searchTermArgIndex], args[searchTermArgIndex + 1]);
                    } else {
                        this.sendChatMessage('WhatIs', `/w ${characterName} Oops! The <mark>!whatis</mark> command with @table must include no more than 2 arguments (the rollable table name and an optional index or range).`);
                        return;
                    }
                } else if (searchForced === false) { //only do this if the user explicitly doesn't want to search.
                    if (args.length - searchTermArgIndex === 1) {
                        //look for matching subject only
                        let subject = this.whatis.dictionary.get(args[searchTermArgIndex].toLowerCase());
                        if (subject) {
                            if (subject.topics.size === 0) {
                                message = `Found subject "${subject.name}" but it has no topics.`;
                            } else {
                                message = this.whatisSearchResult(subject.name, pageAfter, Array.from(subject.topics.values()));
                            }
                        }
                    } else if (args.length - searchTermArgIndex === 2) {
                        //attempt a direct lookup by subject and name
                        let subject = this.whatis.dictionary.get(args[searchTermArgIndex].toLowerCase());
                        if (subject && subject.topics.size > 0) {
                            let keyword = args[searchTermArgIndex + 1];
                            let def = subject.topics.get(keyword.toLowerCase());
                            if (def) {
                                message = `<h4><em>${subject.name}</em></h4><h2>${def.name}</h2>${def.definition.replaceAll(/\r|\n/g, ' ')}`;
                            } else {
                                //search the subject for keyword
                                let matches = [];
                                let keywordRegExp = new RegExp(keyword, 'gi');
                                for (let [k, v] of subject.topics) {
                                    let content = HTML.strip(v.definition);
                                    if (keywordRegExp.test(k) || keywordRegExp.test(content)) {
                                        matches.push(v);
                                    }
                                }
                                message = this.whatisSearchResult(subject.name, pageAfter, matches, keyword, `No direct name match for "${keyword}" under subject "${subject.name}". Looking for the closest matches.`);
                            }
                        }
                    }
                }
                if (!message) {
                    //ok, nothing so far, let's search
                    //search the subject for keyword
                    let matches = [];
                    let keywords = args.slice(searchTermArgIndex);
                    log(`Searching for keywords: "${keywords.join('", "')}"`);
                    for (let [sk, sv] of this.whatis.dictionary) {
                        for (let [k, v] of sv.topics) {
                            let content = HTML.strip(v.definition);
                            let matched = true;
                            for (let keyword of keywords) {
                                let keywordRegExp = new RegExp(keyword, 'gi');
                                if (keywords.length > 1) {
                                    if (keywordRegExp.test(sk) === false && keywordRegExp.test(k) === false && keywordRegExp.test(content) === false) {
                                        matched = false;
                                        break;
                                    }
                                } else if (keywordRegExp.test(k) === false && keywordRegExp.test(content) === false) {
                                    matched = false;
                                    break;
                                }
                            }
                            if (matched) {
                                matches.push(v);
                            }
                        }
                    }
                    message = this.whatisSearchResult(null, pageAfter, matches, keywords);
                }
                log(`Sending message as ${sender} to ${recipient}:\n${message}`);
                if (recipient === 'everyone') {
                    this.sendChatMessage(sender, message);
                } else {
                    this.sendChatMessage(sender, `/w ${recipient} ${message}`);
                }
            }
        } else {
            if (this.whatis.help) {
                this.sendChatMessage('WhatIs', `/w ${characterName} ${HTML.clean(this.whatis.help).replaceAll(/\r|\n/g, ' ')}`);
            } else {
                this.sendChatMessage('WhatIs', `/w ${characterName} WhatIs Help<br>Try using whatis [subject] [topic]<br>or<br>whatis @topics<br><small>Note: Use an exclamation mark before the whatis command.</small>`);
            }
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
            // log(`command=${command}, args=${args}`);
            if (command === 'whatis') {
                if (!this.whatis.loaded) {
                    //oh no, not ready!
                    log('WARN: WhatIs chat query made, but loading is incomplete.');
                    this.sendChatMessage(msg.playerid, 'Oops! The WhatIs dictionary has not loaded yet. Please wait a few seconds!');
                    return;
                } else {
                    this.whatisCommand(msg.who, msg.playerid, ...args);
                }
            }
        }
    }

}

on('ready', async function () {
    'use strict';
    new WhatIs();
});