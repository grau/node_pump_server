/**
 * @file React component
 */

import * as React from 'react';

import {useLiveQuery} from 'dexie-react-hooks';

import Grid from '@mui/material/Grid';

import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

import { LineGraph } from './lineGraph.js';
import { db } from './database.js';
import { IntervallSelector } from './intervallSelector.js';


/**
 * Select date graph
 *
 * @returns React component
 */
export function Graph(): JSX.Element {
    const [timeframe, setTimeframe] = React.useState<[number, number]>([Date.now(), Date.now()]);
    const data = useLiveQuery(() => db.getData(timeframe[0], timeframe[1]), [timeframe]);

    return (<Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
            <IntervallSelector titleSelector='Zeitintervall für Anzeige' titleSlider='Zeitrahmen'
                onTimeframe={setTimeframe} />
            <Paper sx={{ p: 2, mb: 4 }}>
                { data === undefined ? <CircularProgress /> : <LineGraph data={data} /> }
            </Paper>
        </Grid>
    </Grid>);
}
