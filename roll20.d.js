/**
 * Orbotik's Roll20 Type Definitions
 * https://orbotik.com
 * https://github.com/orbotik
 * This file was authored by Christopher Eaton (aka @orbotik) using publicly available documentation on Roll20's public
 * website. Please visit Rol20's documentation website for information.
 * https://help.roll20.net/hc/en-us/categories/360003712674-Mod-API-Development
 */

/**
 * @typedef ChatMessage
 * @property {String} who - The display name of the player or character that sent the message.
 * @property {String} playerID - The ID of the player that sent the message.
 * @property {String} type - One of "general", "rollresult", "gmrollresult", "emote", "whisper", "desc", or "api".
 * @property {String} content - The contents of the chat message. If type is "rollresult", this will be a JSON string 
 * of data about the roll.
 * @property {String} [origRoll] - (type "rollresult" or "gmrollresult" only) The original text of the roll, eg:
 * "2d10+5 fire damage" when the player types "/r 2d10+5 fire damage". This is equivalent to the use of content on
 * messages with types other than "rollresult" or "gmrollresult".
 * @property {String} inlinerolls - (content contains one or more inline rolls only) An array of objects containing
 * information about all inline rolls in the message.
 * @property {String} rolltemplate - (content contains one or more roll templates only) The name of the template
 * specified.
 * @property {String} [target] - (type "whisper" only) The player ID of the person the whisper is sent to. If the
 * whisper was sent to the GM without using his or her display name (ie, "/w gm text" instead of "/w Riley text"
 * when Riley is the GM), or if the whisper was sent to a character without any controlling players, the value will
 * be "gm".
 * @property {String} [target_name] - (type "whisper" only) The display name of the player or character the whisper
 * was sent to.
 * @property {String} [selected] - (type "api" only) An array of objects the user had selected when the command was
 * entered.
 */

/**
 * @function
 * You can use this function to send a chat message.
 * @param {String} speakingAs - Can be one of:
 * - Any string, in which case that will be used as the name of the person who sent the message. E.g. "Riley"
 * - A player's ID, formatted as "player|-Abc123" where "-Abc123" is the ID of the player. If you do this it will
 * automatically use the avatar and name of the player.
 * - A character's ID, formatted as "character|-Abc123". If you do this it will automatically use the avatar and name
 * of the Character.
 * @param {String} input - Should be any valid expression just like the ones used in the Roll20 App. You enter text
 * to send a basic message, or use slash-commands such as "/roll", "/em", "/w", etc. In addition:
 * - You can use Character Attributes with the format \@\{CharacterName|AttributeName\}.
 * - You can use Character Abilities with the format: %\{CharacterName|AbilityName\}.
 * - You cannot use macros.
 * - You can use the `/direct <msg>` command to send a message without any processing (e.g. autolinking of URLs),
 *  and you can use the following HTML tags in the message
 * @param {Function} [callback] - An optional third parameter consisting of a callback function which will be passed
 * the results of the sendChat() call instead of sending the commands to the game. Using sendChat() in this way is
 * asynchronous. The results of the sendChat() command will be an ARRAY of operations, and each individual object
 * will be just like an object you receive during a chat:message event (see above).
 * You can use this, for example, to perform a roll using the Roll20 roll engine, then get the results of the roll
 * immediately. You could then perform additional modifications to the roll before sending it to the players in the
 * game.
 * @param {{noarchive:Boolean, use3d:Boolean}} [options] - An optional fourth parameter to set options for how the
 * message is handled. Options are specified as a javascript object with who's properties are the names of the options
 * to set and whose values are the settings for them, generally true as they default to false.
 * - `noarchive` - Set this to true to prevent the message from being stored in the chat log. This is particularly
 * useful for output that is not part of the story, such as Mod (API) Button menus and state information.
 * - `use3d` - You can now generate 3D Dice rolls using the sendChat() function. The syntax is simply: 
 * ```
 * sendChat("Name", "Rolling [[3d6]]", null, {use3d: true});
 * //If you pass a player ID to the name parameter, such as... 
 * sendChat("player|-ABC123",...)
 * //the player's color will be used for the dice. Otherwise a default white color will be used. 
 * ```
 * @global
 */
function sendChat(speakingAs, input, callback, option);

/**
 * @function
 * You can create a new object in the game using the createObj function. You must pass in the type of the object
 * (one of the valid _type properties from the objects list above), as well as an attributes object containing a
 * list of properties for the object. Note that if the object is has a parent object (for example, attributes and
 * abilities belong to characters, graphics, texts, and paths belong to pages, etc.), you must pass in the ID of the
 * parent in the list of properties (for example, you must include the characterid property when creating an
 * attribute). Also note that even when creating new objects, you can't set read-only properties, they will
 * automatically be set to their default value. The one exception to this is when creating a Path, you must include
 * the 'path' property, but it cannot be modified once the path is initially created.
 * 
 * *Note:* currently you can create 'graphic', 'text', 'path', 'character', 'ability', 'attribute', 'handout',
 * 'rollabletable', 'tableitem', and 'macro' objects.
 * @param {String} type 
 * @param {Object} attributes 
 * @returns {Roll20Object} Returns the new object, so you can continue working with it.
 * @global
 */
function createObj(type, attributes);

/**
 * @function
 * Returns an array of all the objects in the Game (all types). Equivalent to calling `filterObjs` and just returning
 * `true` for every object.
 * @returns {Array.<Roll20Object>}
 * @global
 */
function getAllObjs();

/**
 * @function
 * This function gets a single object if pass in the _type of the object and the _id. It's best to use this function
 * over the other find functions whenever possible, as its the only one that doesn't have to iterate through the 
 * entire collection of objects.
 * @param {String} type
 * @param {String} id
 * @returns {Roll20Object}
 * @global
 */
function getObj(type, id);

/**
 * @function
 * Pass this function a list of attributes, and it will return all objects that match as an array. Note that this
 * operates on all objects of all types across all pages -- so you probably want to include at least a filter for
 * _type and _pageID if you're working with tabletop objects.
 * @param {Object} attrs - An object literal as a dictionary of keys and values to match.
 * @param {{caseInsensitive:Boolean}} [options]
 * @returns {Array.<Roll20Object>}
 * @global
 */
function findObjs(attrs, options);

/**
 * @function
 * Will execute the provided callback function on each object, and if the callback returns true, the object will be
 * included in the result array. Currently, it is inadvisable to use `filterObjs()` for most purposes – due to the fact
 * that `findObjs()` has some built-in indexing for better executing speed, it is almost always better to use
 * `findObjs()` to get objects of the desired type first, then filter them using the native .filter() method for
 * arrays.
 * @param {function(Roll20Object)} callback 
 * @returns {Array.<Roll20Object>}
 * @global
 */
function filterObjs(callback);

/**
 * @function
 * Gets the value of an attribute, using the default value from the character sheet if the attribute is not present.
 * getAttrByName will only get the value of the attribute, not the attribute object itself. If you wish to reference
 * properties of the attribute other than "current" or "max", or if you wish to change properties of the attribute,
 * you must use one of the other functions above, such as `findObjs`.
 * 
 * For repeating sections, you can use the format repeating_section_$n_attribute, where n is the repeating row number
 * (starting with zero). For example, repeating_spells_$2_name will return the value of name from
 * the third row of repeating_spells.
 * @param {String} characterID - The player character's ID.
 * @param {String} attributeName - The name of the attribute.
 * @param {String} [valueType] - An optional parameter, which you can use to specify "current" or "max".
 * @global
 */
function getAttrByName(characterID, attributeName, valueType);

/**
 * @function
 * You can use this function to log output to the Mod (API) console on the Script Editor page. Useful for debugging
 * your scripts and getting a better handle on what's going on inside the Mod (API) sandbox.
 * @param {String} message
 * @global
 */
function log(message);


/**
 * @function
 * Move an (Roll20) object on the tabletop to the front of layer it is currently on. Note that you must pass in an
 * actual object, such as one you receive in an event callback or by calling `getObj` or `findObjs`.
 * @param {Roll20Object} obj
 * @global
 */
function toFront(obj);

/**
 * @function
 * Move an (Roll20) object on the tabletop to the back of layer it is currently on. Note that you must pass in an
 * actual object, such as one you receive in an event callback or by calling `getObj` or `findObjs`.
 * @param {Roll20Object} obj
 * @global
 */
function toBack(obj);

/**
 * @function
 * **Use This Function For Dice!** This function accounts for Modulo Bias which ensures that the resulting random
 * numbers are also evenly distributed between 1 and MAX.
 * @param {Number} max
 * @returns {Number} Returns a random integer, with the lowest value being 1, and the highest value being max. This
 * is the same functionality that Roll20 uses to power its dice rolls, and these numbers have been statistically
 * and rigorously proven to be random.
 * @global
 */
function randomInteger(max);

/**
 * @function
 * The Player Is GM function returns a boolean response on whether a player in the game is a GM or not. The function
 * will always return the correct answer depending on the current moment, so even if a GM chooses to re-join as a
 * player or a player is promoted to a GM mid-game, `playerIsGM()` will respond accordingly without any need to clear
 * a cache or restart the Mod (API) sandbox.
 * @param {String} playerID
 * @returns {Boolean}
 * @global
 */
function playerIsGM(playerID);

/**
 * @function
 * Sets the default token for the supplied Character Object to the details of the supplied Token Object. Both objects
 * must already exist. This will overwrite any default token currently associated with the character.
 * @param {Roll20Object} characterObj
 * @param {Roll20Object} tokenObj
 * @global
 */
function setDefaultTokenForCharacter(characterObj, tokenObj);

/**
 * @function
 * Spawns a brief effect at the location at x,y of type. If you omit the pageid or pass 'undefined', then the page the
 * players are currently on ('playerpageid' in the Campaign object) will be used by default.
 * For built-in effects type should be a type and a color, separated by a "-" dash.
 * 
 * The types are:
 * - "beam"
 * - "bomb"
 * - "breath"
 * - "bubbling"
 * - "burn"
 * - "burst"
 * - "explode"
 * - "glow"
 * - "missile"
 * - "nova"
 * - "splatter"
 * The colors are:
 * - "acid"
 * - "blood"
 * - "charm"
 * - "death"
 * - "fire"
 * - "frost"
 * - "holy"
 * - "magic"
 * - "slime"
 * - "smoke"
 * - "water"
 * 
 * For custom effects, type should be the ID of the custom fx object for the custom effect.
 * @param {Number} x
 * @param {Number} y
 * @param {String} type - Should be a combined "<type>-<color>" option string.
 * @param {String} pageID
 * @global
 */
function spawnFx(x, y, type, pageID);

/**
 * @typedef Point
 * @property {Number} x
 * @property {Number} y
 */

/**
 * @function
 * Works the same as spawnFx, but instead of a single point you pass in two points, in the format `{x: 100, y: 100}`.
 * The effect will "travel" between the two points for effects that support that (the same ones that allow agency on
 * the client side).
 * 
 * The following effect types must always use `spawnFxBetweenPoints` instead of `spawnFx`:
 * - "beam"
 * - "breath"
 * - "splatter"
 * 
 * @example
 * spawnFxBetweenPoints({x: 100, y: 100}, {x: 400, y: 400}, "beam-acid");
 * @param {Point} point1
 * @param {Point} point2
 * @param {String} type - Should be a combined "<type>-<color>" option string.
 * @param {String} pageID
 * @global
 */
function spawnFxBetweenPoints(point1, point2, type, pageID);

/**
 * @function
 * Spawns an ad-hoc custom effect using the JSON for some effect definition at the location x,y. If you omit the
 * `pageID` or pass 'undefined', then the page the players are currently on ('playerpageid' in the Campaign object)
 * will be used by default.
 * @param {Point} point1
 * @param {Point} point2
 * @param {Object} definitionJSON - A javascript object following the JSON specification for Custom FX.
 * @param {String} pageID
 * @global
 */
function spawnFxWithDefinition(x, y, definitionJSON, pageID);

/**
 * @function
 * The play function takes in the Folder ID (get it from the "_jukeboxfolder" property in the Campaign object) of the
 * playlist, and will begin playing that playlist for everyone in the game.
 * @param {String} playlistID
 * @global
 */
function playJukeboxPlaylist(playlistID);

/**
 * @function
 * The stop function does not require any arguments, and will stop any playlist that is currently playing.
 * @global
 */
function stopJukeboxPlaylist();

/**
 * @function
 * Sends a "ping" the tabletop (the same as if a player holds down their mouse button). You must specify the top/left
 * coordinates, and the pageid of the page to be pinged. You can optionally specify the ID of a player who performed
 * the ping -- if you don't "api" will be assumed and the ping will be yellow.
 * @param {Number} left
 * @param {Number} top
 * @param {String} pageID
 * @param {String} [playerID]
 * @param {Boolean} moveAll - Pass in "true" if you want to move the players' views to that location as well.
 * @param {String | Array.<String>} - You can set the player IDs in visibleTo for the players who can see or be
 * moved by the ping. This can be presented as a single player ID, an array, or a comma-delimited string.
 * @global
 */
function sendPing(left, top, pageID, playerID, moveAll, visibleTo);

/**
 * @function
 * Returns the value of a named property.
 * @param {String} prop - 
 * - `_id` - A unique ID for this object. Globally unique across all objects in this game. Read-only.
 * - `_type` - "player" Can be used to identify the object type or search for the object. Read-only.
 * @returns {String | Boolean}
 */
function Roll20ObjectGet(prop);

/**
 * @function
 * Updates the value or values of the Roll20 object.
 * @param {String | Object} prop - Can be a string property name or object literal as a dictionary of keys and values to set.
 * @param {String | Boolean} [value] - The value to set the player property to.
 * @returns {String | Boolean}
 */
function Roll20ObjectSet(prop, value);

/**
 * @function
 * You can delete existing game objects using the `remove()` function. The `remove()` function works on all of the
 * objects you can create with the createObj function. You call the function directly on the object.
 */
function Roll20ObjectRemove();

/**
 * @typedef Roll20Object
 * @property {String} id
 * @property {Roll20ObjectGet} get
 * @property {Roll20ObjectSet} set
 * @property {Roll20ObjectRemove} remove
 */

/**
 * @function
 * Returns the value of a named property.
 * @param {String} prop - 
 * - `_id` - A unique ID for this object. Globally unique across all objects in this game. Read-only.
 * - `_type` - "player" Can be used to identify the object type or search for the object. Read-only.
 * - `_d20userid` - User ID site-wide. For example, the player's user page on the wiki is /User:ID, where ID is the same value stored in _d20userid. Read-only.
 * - `_displayname` - The player's current display name. May be changed from the user's settings page. Read-only.
 * - `_online` - Read-only.
 * - `_lastpage` - The page id of the last page the player viewed as a GM. This property is not updated for players or GMs that have joined as players. Read-only.
 * - `_macrobar` - Comma-delimited string of the macros in the player's macro bar. Read-only.
 * - `speakingas` - The player or character ID of who the player has selected from the "As" dropdown. When set to the empty string, the player is speaking as him- or herself. When set to a character, the value is "character|ID", where ID is the character's ID. When the GM is speaking as another player, the value is "player|ID", where ID is the player's ID.
 * - `color` - The color of the square by the player's name, as well as the color of their measurements on the map, their ping circles, etc.
 * - `showmacrobar` - Whether the player's macro bar is showing.
 * @returns {String | Boolean}
 */
function PlayerGet(prop);

/**
 * @function
 * Updates the value or values of the player object.
 * @param {String | Object} prop - Can be a string property name or object literal as a dictionary of keys and values to set.
 * - `_id` - A unique ID for this object. Globally unique across all objects in this game. Read-only.
 * - `_type` - "player" Can be used to identify the object type or search for the object. Read-only.
 * - `_d20userid` - User ID site-wide. For example, the player's user page on the wiki is /User:ID, where ID is the same value stored in _d20userid. Read-only.
 * - `_displayname` - The player's current display name. May be changed from the user's settings page. Read-only.
 * - `_online` - Read-only.
 * - `_lastpage` - The page id of the last page the player viewed as a GM. This property is not updated for players or GMs that have joined as players. Read-only.
 * - `_macrobar` - Comma-delimited string of the macros in the player's macro bar. Read-only.
 * - `speakingas` - The player or character ID of who the player has selected from the "As" dropdown. When set to the empty string, the player is speaking as him- or herself. When set to a character, the value is "character|ID", where ID is the character's ID. When the GM is speaking as another player, the value is "player|ID", where ID is the player's ID.
 * - `color` - The color of the square by the player's name, as well as the color of their measurements on the map, their ping circles, etc.
 * - `showmacrobar` - Whether the player's macro bar is showing.
 * @param {String | Boolean} [value] - The value to set the player property to.
 * @returns {String | Boolean}
 */
function PlayerSet(prop, value);

/**
 * @typedef Player
 * @property {String} id
 * @property {PlayerGet} get
 * @property {PlayerSet} set
 * @property {Roll20ObjectRemove} remove
 */
