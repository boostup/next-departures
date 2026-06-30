import {
    formatSncfClockTime,
    getFormattedDate,
    computeDuration,
    getHaversineDistance,
    parseJourneys
} from '../../src/utils.js';

describe('formatSncfClockTime', () => {
    it('should return HH:MM for valid SNCF datetime format', () => {
        expect(formatSncfClockTime('20240101T123000')).toBe('12:30');
        expect(formatSncfClockTime('20241231T235900')).toBe('23:59');
    });

    it('should return --:-- for empty/undefined input', () => {
        expect(formatSncfClockTime('')).toBe('--:--');
        expect(formatSncfClockTime(null)).toBe('--:--');
        expect(formatSncfClockTime(undefined)).toBe('--:--');
    });
});

describe('getFormattedDate', () => {
    it('should return fr-FR short weekday + day + month, capitalized', () => {
        const result = getFormattedDate('20240105T123000');
        expect(result).toMatch(/^[A-Z][a-z]{2}\. \d+ [A-Z][a-z]+\.?$/);
        expect(result).toBe('Ven. 5 Janv.');
    });

    it('should return empty string for empty/undefined input', () => {
        expect(getFormattedDate('')).toBe('');
        expect(getFormattedDate(null)).toBe('');
    });
});

describe('computeDuration', () => {
    it('should return Xh Ymin for normal positive diff', () => {
        expect(computeDuration('20240101T100000', '20240101T123000')).toBe('2h 30min');
    });

    it('should return Xh when no minutes', () => {
        expect(computeDuration('20240101T100000', '20240101T120000')).toBe('2h');
    });

    it('should return Ymin when no hours', () => {
        expect(computeDuration('20240101T100000', '20240101T103000')).toBe('30min');
    });

    it('should return -- for zero/negative diff', () => {
        expect(computeDuration('20240101T120000', '20240101T100000')).toBe('--');
    });

    it('should return -- for bad input', () => {
        expect(computeDuration(null, '20240101T120000')).toBe('--');
        expect(computeDuration('20240101T120000', null)).toBe('--');
    });
});

describe('getHaversineDistance', () => {
    it('should return 0 for same point', () => {
        expect(getHaversineDistance(46.2, 3.4, 46.2, 3.4)).toBe(0);
    });

    it('should calculate correct distance for known pair', () => {
        const parisLat = 48.8566;
        const parisLon = 2.3522;
        const lyonLat = 45.7640;
        const lyonLon = 4.8357;
        const distance = getHaversineDistance(parisLat, parisLon, lyonLat, lyonLon);
        expect(distance).toBeGreaterThan(300);
        expect(distance).toBeLessThan(500);
    });
});

describe('parseJourneys', () => {
    it('should return empty array for no_solution error', () => {
        expect(parseJourneys({ error: { id: 'no_solution' } })).toEqual([]);
    });

    it('should throw for response without journeys key', () => {
        expect(() => parseJourneys({})).toThrow('Unexpected API response');
    });

    it('should throw for null/undefined response', () => {
        expect(() => parseJourneys(null)).toThrow('Unexpected API response');
    });

    it('should return normalized entries with isAutocar and isDelayed flags', () => {
        const apiResponse = {
            journeys: [
                {
                    departure_date_time: '20240101T100000',
                    arrival_date_time: '20240101T120000',
                    sections: [
                        {
                            type: 'public_transport',
                            display_informations: {
                                direction: 'Paris',
                                headsign: 'TGV123',
                                physical_mode: 'train'
                            }
                        }
                    ]
                },
                {
                    departure_date_time: '20240101T140000',
                    arrival_date_time: '20240101T150000',
                    sections: [
                        {
                            type: 'public_transport',
                            display_informations: {
                                direction: 'Lyon',
                                headsign: 'BUS456',
                                physical_mode: 'coach'
                            },
                            base_departure_date_time: '20240101T133000'
                        }
                    ]
                }
            ]
        };

        const result = parseJourneys(apiResponse);
        expect(result).toHaveLength(2);
        expect(result[0].isAutocar).toBe(false);
        expect(result[0].isDelayed).toBe(false);
        expect(result[1].isAutocar).toBe(true);
        expect(result[1].isDelayed).toBe(true);
    });

    it('should handle missing sections gracefully', () => {
        const apiResponse = {
            journeys: [
                {
                    departure_date_time: '20240101T100000',
                    arrival_date_time: '20240101T120000',
                    sections: []
                }
            ]
        };
        const result = parseJourneys(apiResponse);
        expect(result[0].isAutocar).toBe(false);
        expect(result[0].direction).toBe('Inconnue');
        expect(result[0].headsign).toBe('Numéro inconnu');
    });
});