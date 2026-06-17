// Identifiants par défaut pour éviter tout code en dur dans l'interface
export const DEFAULT_STATIONS = {
    ST_GERMAIN: {
        id: "stop_area:SNCF:87732206",
        name: "St-Germain-des-Fossés",
        lat: 46.2019,
        lon: 3.4288
    },
    VICHY: {
        id: "stop_area:SNCF:87732008",
        name: "Vichy",
        lat: 46.1244,
        lon: 3.4275
    }
};

export const API_JOURNEYS_URL = "https://api.sncf.com/v1/coverage/sncf/journeys";
export const API_PLACES_URL = "https://api.sncf.com/v1/coverage/sncf/places";