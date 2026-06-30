export function formatSncfClockTime(rawDate) {
    if (!rawDate) return "--:--";
    return `${rawDate.substring(9, 11)}:${rawDate.substring(11, 13)}`;
}

export function getFormattedDate(rawDate) {
    if (!rawDate) return "";
    const year = rawDate.substring(0, 4);
    const month = rawDate.substring(4, 6);
    const day = rawDate.substring(6, 8);

    const dObj = new Date(`${year}-${month}-${day}T12:00:00`);
    const formatted = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(dObj);
    return formatted.replace(/\b\w/g, c => c.toUpperCase());
}

export function computeDuration(departureRaw, arrivalRaw) {
    if (!departureRaw || !arrivalRaw) return "--";
    try {
        const depStr = `${departureRaw.substring(0, 4)}-${departureRaw.substring(4, 6)}-${departureRaw.substring(6, 8)}T${departureRaw.substring(9, 11)}:${departureRaw.substring(11, 13)}:${departureRaw.substring(13, 15)}`;
        const arrStr = `${arrivalRaw.substring(0, 4)}-${arrivalRaw.substring(4, 6)}-${arrivalRaw.substring(6, 8)}T${arrivalRaw.substring(9, 11)}:${arrivalRaw.substring(11, 13)}:${arrivalRaw.substring(13, 15)}`;

        const depDate = new Date(depStr);
        const arrDate = new Date(arrStr);
        const diffMs = arrDate - depDate;

        if (diffMs <= 0) return "--";

        const totalMinutes = Math.round(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}min`;
    } catch (e) {
        return "--";
    }
}

export function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function parseJourneys(apiResponse) {
    if (!apiResponse) {
        throw new Error('Unexpected API response');
    }

    if (apiResponse.error && apiResponse.error.id === 'no_solution') {
        return [];
    }

    if (!Array.isArray(apiResponse.journeys)) {
        throw new Error('Unexpected API response');
    }

    return apiResponse.journeys.map(journey => {
        const depTime = journey.departure_date_time;
        const arrTime = journey.arrival_date_time;

        const transitSection = (journey.sections || []).find(sec => sec.type === "public_transport");
        const displayInfo = transitSection?.display_informations || {};

        const physicalMode = (displayInfo.physical_mode || "").toLowerCase();
        const isAutocar = physicalMode.includes("coach") || physicalMode.includes("bus") || physicalMode.includes("autocar");
        const isDelayed = !!(transitSection?.base_departure_date_time && transitSection.base_departure_date_time !== depTime);

        return {
            departureTime: depTime,
            arrivalTime: arrTime,
            direction: displayInfo.direction || "Inconnue",
            headsign: displayInfo.headsign || displayInfo.code || "Numéro inconnu",
            isAutocar,
            isDelayed
        };
    });
}