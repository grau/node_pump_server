/**
 * @file React component
 */
import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Grid from '@mui/material/Grid';
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { LineGraph } from './lineGraph.js';
import { db } from './database.js';
/**
 * Select date graph
 *
 * @returns React component
 */
export function Graph() {
    const [state, setState] = React.useState([new Date(Date.now() - 1000 * 3600 * 24), new Date()]);
    const minDate = useLiveQuery(() => db.getMinDataDate());
    const from = React.useMemo(() => { var _a, _b; return (_b = (_a = state === null || state === void 0 ? void 0 : state[0]) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : Date.now() - (1000 * 60 * 60); }, [state]);
    const to = React.useMemo(() => { var _a, _b; return (_b = (_a = state === null || state === void 0 ? void 0 : state[1]) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : Date.now(); }, [state]);
    const data = useLiveQuery(() => db.getData(from, to), [from, to]);
    return (React.createElement(Grid, { container: true, spacing: 3 },
        React.createElement(Grid, { item: true, xs: 12, md: 8, lg: 9 },
            React.createElement(Paper, { sx: { p: 2, mb: 4, display: 'flex', flexDirection: 'column' } },
                React.createElement(FormLabel, null, "Zeitintervall f\u00FCr Anzeige"),
                React.createElement(DateTimeRangePicker, { locale: 'de-DE', onChange: (range) => setState(range), value: state, minDate: new Date(minDate !== null && minDate !== void 0 ? minDate : Date.now()), maxDate: new Date() })),
            React.createElement(Paper, { sx: { p: 2, mb: 4 } }, data === undefined ? React.createElement(CircularProgress, null) : React.createElement(LineGraph, { data: data })))));
}
