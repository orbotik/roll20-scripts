![Robotic arm flipping book pages, held up by balloons](.repo.png)
# [@orbotik](https://app.roll20.net/users/12231884/orbotik)'s Roll20 API Scripts
This repository contains my crafted scripts for Roll20 API-enabled games. They are free to use, share, and modify under
the permissive [CC-SA-BY license](LICENSE).

If you have any **ideas**, **questions**, or **problems**, *please create [an issue](https://github.com/orbotik/roll20-scripts/issues) in this repo.*

## Scripts
- [Cleaner](cleaner.js) - This script allows you to quickly normalize and clean the HTML of a specified handout's notes (including GM notes). It removes extraneous tags and styles and basically "resets" the HTML to standard, clean tags that Roll20 doesn't have problems with.
  ##### Commands:
  | Cmd | Description |
  |:-|:-|
  | `!cleaner [handout]` | Cleans the handout with the specified name (use quotes if the handout name has spaces). |
- [Daggerhear: Fear Tracker](daggerheart-fear.js) - This fear tracker listens for duality rolls from Demiplane-linked character sheets and bumps up a game fear counter everytime someone rolls with fear. It sends notices to all players showing the new fear value.
  Players can turn notifications on or off as they wish, or simply run `!fear` to see the current value. As the GM, you can reset and set the fear at any time.
  ##### Commands:
  | Cmd | Description |
  |:-|:-|
  | `!fear` | Reports the current fear counter value. |
  | `!fear [on/off]` | Turns fear notices on or off (you only). Specifically, when a Demiplane duality roll with fear is detected, you will be sent a whisper by the game of the new fear counter value (if on). The default is `on` for all players. |
  | `!fear reset` | **GM-only.** Resets the fear counter to `0`. |
  | `!fear reset known` | **GM-only.** Resets the known players to empty, this causes players to receive the first welcome message again with instructions to turn notifications on or off. |
  | `!fear set [number]` | **GM-only.** Sets the fear to any number (0-999) |
- [Switch-To](switch-to.js) - Ever want to tell a story as a GM and easily switch your portrait on-the-fly? This script allows you to quickly switch your "Speaking as" state to a named character in your game, revealing the portrait of that character in-game (assuming you don't have video enabled). This is really handy as an on-screen macro- you can instantly jump to "speaking as" other characters with the click of a button!
  ##### Commands:
  | Cmd | Description |
  |:-|:-|
  | `!switch-to [character]` | Switches your portrait and speaking-as setting to the named character (use quotes if the character name has spaces). |
  | `!switch-to @self` | Resets your portrait and speaking-as setting back to yourself. |
- [WhatIs](whatis/whatis.js) - This is a "*handout to searchable dictionary*" tool that converts your Roll20 handout notes into a searchable, browsable, in-game dictionary that you and your players can reference at any time. It evaluates header level 1 and 2 text and turns their content into *subjects* and *topics*. It supports topics as header-level entries or as bullet points with bolded keywords (see example).
  You can even use it to announce or share specific entries with players, just in case they forget a reference. At this time, only one handout is supported at a time. See the cleaner script to help produce a usable whatis-friendly handout.    
  ##### Commands:
  | Cmd | Description |
  |:-|:-|
  | `!whatis` | Show the whatis handout's intro section content. |
  | `!whatis @subjects` | Show a list of all known subjects with buttons to jump to their respective topics. |
  | `!whatis [subject] [topic]` | Show the contents of a specific subject and/or topic (use quotes if they have spaces). |
  | `!whatis [...search terms]` | Perform a general search with one or more search terms. |
  | `!whatis @search [...search terms]` | Same as above, but forces the search, even if a term directly matches a subject/topic. |
  | `!whatis to@[playername] […]` | Send the results of a following `!whatis` command to the specified player. You can also specify "everyone" to send to everyone in the game, or "gm" to send to the GM of the game. |
  | `!whatis @table [tablename] [# or #-#]` | Examine a rollable table and show contents, optionally specifying a specific roll at the given entry number (or range). |
  | `!whatis @reload` | **GM-only.** Attempts to reload (re-parse) your whatis document. 
  ##### GM Recommendations
  1. By default, the script looks for a handout called "WhatIs" (case-insensitive), but you can specify the ID or name in the script if desired.
  2. HTML in handouts can get really messy. It's strongly recommended that you create clean content for the the handout that doesn't use special styling. The go-to procedure for effective parsing is to write your handout in markdown, then copy the rendered version into the handout notes. Once that is saved, run the `!cleaner` script on the handout to normalize it. Then you can run `!whatis @reload` to re-parse the handout. If this is done properly, you'll see your subjects listed with `!whatis @subjects`.
