/**
 * @file React component
 */
import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
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
export function Graph() {
    const [timeframe, setTimeframe] = React.useState([Date.now(), Date.now()]);
    const data = useLiveQuery(() => db.getData(timeframe[0], timeframe[1]), [timeframe]);
    return (React.createElement(Grid, { container: true, spacing: 3 },
        React.createElement(Grid, { item: true, xs: 12, md: 8, lg: 9 },
            React.createElement(IntervallSelector, { titleSelector: 'Zeitintervall f\u00FCr Anzeige', titleSlider: 'Zeitrahmen', onTimeframe: setTimeframe }),
            React.createElement(Paper, { sx: { p: 2, mb: 4 } }, data === undefined ? React.createElement(CircularProgress, null) : React.createElement(LineGraph, { data: data })))));
}
