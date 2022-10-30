/**
 * @file React component
 */

import * as React from 'react';

import {useLiveQuery} from 'dexie-react-hooks';

import Grid from '@mui/material/Grid';

import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';

import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { LineGraph } from './lineGraph.js';
import { db } from './database.js';

/** Date range format */
type TRange = [(Date | undefined)?, (Date | undefined)?] | null;

/**
 * Select date graph
 *
 * @returns React component
 */
export function Graph(): JSX.Element {
    const [state, setState] = React.useState<TRange>([new Date(Date.now() - 1000 * 3600 * 24), new Date()]);
    const minDate = useLiveQuery(() => db.getMinDataDate());
    const from = React.useMemo(() => state?.[0]?.getTime() ?? Date.now() - (1000 * 60 * 60), [state]);
    const to = React.useMemo(() => state?.[1]?.getTime() ?? Date.now(), [state]);
    const data = useLiveQuery(() => db.getData(from, to), [from, to]);

    return (<Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
            <Paper sx={{ p: 2, mb: 4, display: 'flex', flexDirection: 'column'}}>
                <FormLabel>Zeitintervall für Anzeige</FormLabel>
                <DateTimeRangePicker
                    locale='de-DE'
                    onChange={(range) => setState(range)}
                    value={state}
                    minDate={new Date(minDate ?? Date.now())}
                    maxDate={new Date()}
                />
            </Paper>
            <Paper sx={{ p: 2, mb: 4 }}>
                { data === undefined ? <CircularProgress /> : <LineGraph data={data} /> }
            </Paper>
        </Grid>
    </Grid>);
}
