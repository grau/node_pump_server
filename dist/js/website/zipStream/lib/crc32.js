/**
 * @file CRC32 calculator
 */
/** Lookup table. Pre calculated once */
const table = [];
for (let i = 0; i < 256; i++) {
    let t = i;
    for (let j = 0; j < 8; j++) {
        t = t & 1
            ? t >>> 1 ^ 0xEDB88320
            : t >>> 1;
    }
    table[i] = t;
}
/**
 * Class to calculate crc32 values
 */
export class Crc32 {
    constructor() {
        /** Internal CRC state */
        this.crc = -1;
    }
    /**
     * Append data set to crc calculation
     *
     * @param data Data to add to crc
     */
    append(data) {
        let crc = this.crc | 0;
        for (let offset = 0, len = data.length | 0; offset < len; offset++) {
            crc = crc >>> 8 ^ table[(crc ^ data[offset]) & 0xFF];
        }
        this.crc = crc;
    }
    /**
     * CRC Value
     *
     * @returns Numeric crc value
     */
    get() {
        return ~this.crc;
    }
}
