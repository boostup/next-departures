import { API_JOURNEYS_URL, DEFAULT_STATIONS } from '../../src/constants.js';

describe('constants', () => {
    it('should export API_JOURNEYS_URL', () => {
        expect(API_JOURNEYS_URL).toBe('https://api.sncf.com/v1/coverage/sncf/journeys');
    });

    it('should export DEFAULT_STATIONS with expected shape', () => {
        expect(DEFAULT_STATIONS.ST_GERMAIN).toBeDefined();
        expect(DEFAULT_STATIONS.ST_GERMAIN.name).toBe('St-Germain-des-Fossés');
        expect(DEFAULT_STATIONS.ST_GERMAIN.lat).toBeCloseTo(46.2019);
        expect(DEFAULT_STATIONS.ST_GERMAIN.lon).toBeCloseTo(3.4288);
        expect(DEFAULT_STATIONS.VICHY).toBeDefined();
        expect(DEFAULT_STATIONS.VICHY.name).toBe('Vichy');
    });
});
