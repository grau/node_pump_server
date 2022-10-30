/**
 * @file React component
 */
import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import FormLabel from '@mui/material/FormLabel';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { LineGraph } from './lineGraph.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database.js';
/** Available marks on time slider */
const marks = [
    {
        value: 10 * 60 * 1000,
        label: '10m',
    },
    {
        value: 30 * 60 * 1000,
        label: '30m',
    },
    {
        value: 1 * 60 * 60 * 1000,
        label: '1 std',
    },
    {
        value: 2 * 60 * 60 * 1000,
        label: '2 std',
    },
    {
        value: 3 * 60 * 60 * 1000,
        label: '3 std',
    },
    {
        value: 4 * 60 * 60 * 1000,
        label: '4 std',
    },
    {
        value: 5 * 60 * 60 * 1000,
        label: '5 std',
    },
    {
        value: 6 * 60 * 60 * 1000,
        label: '6 std',
    },
];
/**
 * Live graph
 *
 * @returns React component
 */
export function Live() {
    const [showTime, setShowTime] = React.useState(60 * 60 * 1000);
    const [showInterval, setShowInterval] = React.useState([Date.now() - showTime, Date.now()]);
    const [timeout, setTimeout] = React.useState(10);
    const [pause, setPause] = React.useState(false);
    const data = useLiveQuery(() => db.getData(showInterval[0], showInterval[1]), [showInterval]);
    React.useEffect(() => {
        setShowInterval([Date.now() - showTime, Date.now()]);
        const updateInterval = setInterval(() => {
            const now = Date.now();
            setShowInterval([now - showTime, now]);
        }, timeout * 1000);
        return () => clearInterval(updateInterval);
    }, [showTime, timeout]);
    return (React.createElement(Grid, { container: true, spacing: 3 },
        React.createElement(Grid, { item: true, xs: 12, md: 8, lg: 9 },
            React.createElement(Paper, { sx: { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' } },
                React.createElement(Grid, { container: true, spacing: 4 },
                    React.createElement(Grid, { item: true, xs: 12 },
                        React.createElement(FormLabel, null, "Anzeige Zeitraum"),
                        React.createElement(Slider, { value: showTime, onChange: (_, newVal) => setShowTime(newVal), step: null, marks: marks, min: marks[0].value, max: marks[marks.length - 1].value, disabled: pause })),
                    React.createElement(Grid, { item: true, xs: 11 },
                        React.createElement(FormLabel, null, pause
                            ? 'Update pausiert'
                            : 'Update Intervall ' + timeout + ' Sekunden'),
                        React.createElement(Slider, { "aria-label": 'Anzeigeintervall', value: timeout, onChange: (_, newVal) => setTimeout(newVal), min: 2, max: 120, step: 2, disabled: pause })),
                    React.createElement(Grid, { item: true, xs: 1, display: 'flex', justifyContent: 'end' }, pause
                        ? React.createElement(IconButton, { onClick: () => setPause(false), size: 'large' },
                            React.createElement(PlayCircleIcon, { fontSize: 'inherit', color: 'primary' }))
                        : React.createElement(IconButton, { onClick: () => setPause(true), size: 'large' },
                            React.createElement(PauseCircleIcon, { fontSize: 'inherit', color: 'primary' }))))),
            React.createElement(Paper, { sx: { p: 2, mb: 4 } }, data === undefined ? React.createElement(CircularProgress, null) : React.createElement(LineGraph, { data: data })))));
}
