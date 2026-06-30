# "Next Departures" app

This app is meant to provide a very quick way to see the next departures from the nearest transport hub or station.  If there isn't one nearby, well as we say: "pas de bras, pas de chocoloat". 
It is not meant to replace the official app SNCF-Connect, it's just that "having a quick look at next departures" is not its strong suit, and when you need to consult the schedules often for the same route, you get app fatigue.  This app solve this.

## Tech stack

This app is powered by Vite, vanilla JS/CSS and HTML, Web Component, Proxy objects.  It is meant to be a PWA that can be accessed via browser url and can be installed as an app using the in-browser functionality.

## SCNF API
This API is where travel journeys or the next departures are stored.
Set your SNCF API key when prompted on first launch, or via **Réglages > Clé API SNCF**. Your key is stored locally in your browser and never sent to third parties.

### Getting a key
https://numerique.sncf.com/inscription/

### Support
https://www.digital.sncf.com/startup/api/support/

## Quick start 

```bash
npm install
npm run dev
```

## Deployment
npm run deploy