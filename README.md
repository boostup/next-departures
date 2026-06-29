# SNCF Board (refactor)

This repo is a refactor scaffold of the original SNCF Board prototype. It splits styles and logic into modules and adds a basic dev workflow.

Quick start (after installing dependencies):

```bash
npm install
npm run dev
```

Set your SNCF API key when prompted on first launch, or via **Réglages > Clé API SNCF**. Your key is stored locally in your browser and never sent to third parties.

Run tests:

```bash
npm test
```

## Tasks for AI

New tasks:
- the app must be mobile first and responsive (get tailwind or whatever is best these days, but only if it helps you, otherwise in general, I like sticking to vanilla HTML, JS and CSS as much as possible)
- better professional polished looking non-emoji icons coming from the same set. Look for all icons (trains, buses, gears, stars, back to previous page arrows, etc) to be replaced throughout the app
- a Nice micro Animation for star button when pressed 
- in the settings screen to display a chevron icon instead of the word "chevron", and aligned at the end of the row
- in the main screen:
    - hide the scroll bar in the main screen (list of journeys) but still allow scrolling (smooth wheel/touch, trackpad, scrollbar should be invisible)
    - for each journey in the results, display a small clock icon and the time of the journey next to each other

Finally, can we have some sort of design guidelines or style guide for this app?  Like a design system for this app.  Something that we can follow throughout the development of this app.  Base it on the the current styles and colors scheme.
    
Make a plan, then let's review it before implementation. Make sure to stick to best practices, design patterns, components, no hard-coding, separation of concerns and all that jazz, you get the drift.  I don't want to see some beginner style coding.  Anything we add must scale, in all the meanings of the word. Use native Web APIs only (Fetch API, standard DOM manipulation, local storage) and standard CSS. No external libraries or frameworks.  This app's structure is using the modern component pattern in vanilla JS with standard ES modules and a pub sub model using proxies to manage reactive states and interaction.




-----------------------------------------

- Favorite routes must be in it's own setting settings page (this means the app must be browsable to different sections, ie: settings > favorites). Organise this like iOS or Android style settings (settings list of options > click on one setting to access the page corresponding to it)

- I don't want see any 'Vichy' or 'St-Germain-des-Fossés' being hardcoded anywhere.  Use the global config object to add the names of the cities there with their string ids. What about the label, can it use the values of from.name and to.name as well?

- Fixing a miscommunication:  the auto toggle is not for fetching every 60 seconds, but to automatically fetch journeys using the default route.  This means that the first time the app is run, auto=false; To make it easy for the user, whenever user has entered a from and a to, there could be some sort of favorite icon right there so user can set it as the default. ALso, this means that once pressed, this route becomes a favorite, and is set as the default.

- Also, note that :
    - it is 'autocar' and not 'autoCar' (my mistake originally) 
    - I have renamed 'autocarsEnabled' to 'autocarRoutesEnabled'

- I have a .gitignore file in which I typed '.env.*' but for some reason Git is still tracking the file.  I have also typed 'node_modules' and these are no longer tracked, why the inconsistency (FYI: I'm on branch 'development' and I've never pushed it yet to the remote repo on Github).

- The text inputs and OK buttons are missing.  when I asked you to generate all code for all features, I meant all of them.  So the from is automatically populated by current location (browser geoloc).  The 'to' provides autocomplete using SNCF API

- This app must be installable on mobile browsers (PWA)

- make sure not to make changes to files if unecessary so that I have a minimal amount of copy and paste to execute once I get your feedback from these tasks, as I'm doing it manually (I no longer have credits for co-pilots and it seems that new membership plan are currently frozen)

- make to continue following all best practices, design patterns, components, no hard-coding, separation of concerns and all that jazz, you get the drift.  I don't want to see some beginner style coding.  Anything we add must scale, in all the meanings of the word.

- Dark/Light themes :  detects browser theme settings otherwise defaults to Dark

Note that this is in order of priority.
