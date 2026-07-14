# Remove DEFAULT_STATIONS and Make Geolocation Dynamic

## Goal
Remove hardcoded station defaults (St-Germain-des-Fossés, Vichy) and make the app dynamically determine the user's origin station via geolocation + SNCF API lookup.

## Decisions Made
1. **Origin handling**: Lock detected origin (no UI to change it)
2. **Geo fallback**: If geolocation fails, show message to enable location and reload
3. **Nearby radius**: Use SNCF API defaults (no explicit radius parameter)

## Affected Files
- `src/constants.js` - Remove `DEFAULT_STATIONS` export
- `src/state.js` - Initialize `from`/`to` to `null` without persisted defaults
- `src/main.js` - Refactor `initGeolocationAndProximity()`, add null checks

## Implementation Steps

### Step 1: Update `src/constants.js`
- Remove `DEFAULT_STATIONS` object entirely
- Keep only API URL exports (`API_JOURNEYS_URL`, `API_PLACES_URL`)

### Step 2: Update `src/state.js`
- Remove import of `DEFAULT_STATIONS`
- Initialize `from: null` and `to: null` instead of defaults
- The Proxy will compute `label` safely when stations are null
- Update geo-distance comparison logic to handle null values

### Step 3: Update `src/main.js`

#### Refactor `initGeolocationAndProximity()`:
- On success: Call `API_PLACES_URL` with `lat,lon` coordinates to find nearby stop areas
- Use `/places` endpoint with `type=stop_area` to get nearest station
- Set the first result as `from` (the nearest station)
- `to` remains unset; user must use autocomplete

#### Handle geolocation failure:
- Show message: "Veuillez activer la géolocalisation pour utiliser l'application."
- Add reload button for user to retry

#### Update `fetchSncbJourneys()`:
- Add early return if `from` or `to` is null
- Show appropriate "Select destination" message

#### Update `updateQuickFavBadge()`:
- Handle case where `from` is null (don't crash on `from.id`)

#### Update initialization flow:
- If `from` is set but `to` is null, show "Select destination" prompt in autocomplete
- If both are set, proceed with journey fetch

## Risks
- SNCF API `/places` may not return results for some coordinates (rural areas)
- User may be far from any train station; app becomes unusable
- Geolocation permission denial on mobile browsers is common

## Validation
- Test with geolocation enabled: Should auto-detect nearest station
- Test with geolocation disabled: Should show appropriate message
- Test journey lookup after selecting destination
- Verify favorites system still works (stores from/to with id/name)