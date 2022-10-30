/**
 * @file
 */

/**
 * Possible system states
 */
enum SYSTEM_STATES {
    STATE_ROOF_TOO_COLD = 0,
    STATE_BUFFER_TOO_HOT,
    STATE_ROOF_FROST,
    STATE_PUMP_ON,
    STATE_PUMP_OFF,
}

/** Data to be stored */
export type IStorage = IStorageData | IStorageError;

/**
 * Data received from arduino
 */
export interface IStorageData {
    /** Timestamp this data was received */
    timestamp: number;
    /** State the system is in */
    state: SYSTEM_STATES;
    /** If the system just booted */
    boot: boolean;
    /** Input values */
    input: {
        /** ID of input */
        id: number;
        /** Input type */
        val: number;
    }[];
    /** Output states */
    output: {
        /** ID of output */
        id: number;
        /** State of output */
        val: number;
    }[];
}

/** All available error types */
export type TError = 'parse' | // Error while parsing data.
    'validate' | // Incoming data could be parsed - but does not match expected structure
    'port' | // Something with the port went wront
    'readlineParser';

/** In case data was received incorrect - errors are stored */
export interface IStorageError {
    /** Timestamp this data was received */
    timestamp: number;
    /** Data that was received */
    data?: string;
    /** Type of error */
    error: TError
    /** Error message */
    message: string;
}
