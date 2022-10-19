/**
 * @file React component
 */

import * as React from 'react';
import Grid from '@mui/material/Grid';

import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';

import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { getDataSeries, getMinDate } from './getData.js';
import { LineGraph } from './lineGraph.js';
import type { ISeriesData } from '../interfaces/IStorage.js';

/**
 * Select date graph
 *
 * @returns React component
 */
export function Graph(): JSX.Element {
    const [data, setData] = React.useState<ISeriesData | null>(null);
    const [state, setState] = React.useState<[(Date | undefined)?, (Date | undefined)?] | null>
        ([new Date(Date.now() - 1000 * 3600 * 24), new Date]);
    const [minDate, setMinDate] = React.useState<Date>(new Date());

    const startDate = state === null || state[0] === undefined
        ? Date.now() - 1000 * 3600 * 24
        : state[0].getTime();
    const endDate = state === null || state[1] === undefined ? Date.now() : state[0]?.getTime();

    React.useEffect(() => {
        getDataSeries(startDate, endDate)
            .then(setData)
            .catch((err) => console.warn('Failed to fetch data!', {err}));
    }, [state]);

    React.useEffect(() => {
        getMinDate()
            .then((date) => setMinDate(new Date(date)))
            .catch((err) => console.warn('Could not fetch min date', {err}));
    });

    return (<Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
            <Paper sx={{ p: 2, mb: 4, display: 'flex', flexDirection: 'column'}}>
                <FormLabel>Zeitintervall für Anzeige</FormLabel>
                <DateTimeRangePicker
                    locale='de-DE'
                    onChange={(range) => setState(range)}
                    value={state}
                    minDate={minDate}
                    maxDate={new Date()}
                />
            </Paper>
            <Paper sx={{ p: 2, mb: 4 }}>
                { data === null ? <CircularProgress /> : <LineGraph data={data} /> }
            </Paper>
        </Grid>
    </Grid>);
}
