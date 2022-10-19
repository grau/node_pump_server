/**
 * @file React component
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import FormLabel from '@mui/material/FormLabel';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { getCachedDataSeries } from './getData.js';
import { LineGraph } from './lineGraph.js';
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
    const [data, setData] = React.useState(null);
    const [showTime, setShowTime] = React.useState(60 * 60 * 1000);
    const [timeout, setTimeout] = React.useState(10);
    const [pause, setPause] = React.useState(false);
    React.useEffect(() => {
        if (!pause) {
            getCachedDataSeries(Date.now() - showTime, 200)
                .then(setData)
                .catch((err) => console.warn('Failed to fetch data!', { err }));
            const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                setData(yield getCachedDataSeries(Date.now() - showTime, 200));
            }), timeout * 1000);
            return () => {
                clearInterval(interval);
            };
        }
        return () => { };
    }, [showTime, pause, timeout]);
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
            React.createElement(Paper, { sx: { p: 2, mb: 4 } }, data === null ? React.createElement(CircularProgress, null) : React.createElement(LineGraph, { data: data })))));
}
