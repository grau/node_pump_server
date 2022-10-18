/**
 * @file React component
 */
import * as React from 'react';
import Grid from '@mui/material/Grid';
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { getDataSeries, getMinDate } from './getData';
import { LineGraph } from './lineGraph';
/**
 * Select date graph
 *
 * @returns React component
 */
export function Graph() {
    var _a;
    const [data, setData] = React.useState(null);
    const [state, setState] = React.useState([new Date(Date.now() - 1000 * 3600 * 24), new Date]);
    const [minDate, setMinDate] = React.useState(new Date());
    const startDate = state === null || state[0] === undefined
        ? Date.now() - 1000 * 3600 * 24
        : state[0].getTime();
    const endDate = state === null || state[1] === undefined ? Date.now() : (_a = state[0]) === null || _a === void 0 ? void 0 : _a.getTime();
    React.useEffect(() => {
        getDataSeries(startDate, endDate)
            .then(setData)
            .catch((err) => console.warn('Failed to fetch data!', { err }));
    }, [state]);
    React.useEffect(() => {
        getMinDate()
            .then((date) => setMinDate(new Date(date)))
            .catch((err) => console.warn('Could not fetch min date', { err }));
    });
    return (React.createElement(Grid, { container: true, spacing: 3 },
        React.createElement(Grid, { item: true, xs: 12, md: 8, lg: 9 },
            React.createElement(Paper, { sx: { p: 2, mb: 4, display: 'flex', flexDirection: 'column' } },
                React.createElement(FormLabel, null, "Zeitintervall f\u00FCr Anzeige"),
                React.createElement(DateTimeRangePicker, { locale: 'de-DE', onChange: (range) => setState(range), value: state, minDate: minDate, maxDate: new Date() })),
            React.createElement(Paper, { sx: { p: 2, mb: 4 } }, data === null ? React.createElement(CircularProgress, null) : React.createElement(LineGraph, { data: data })))));
}
