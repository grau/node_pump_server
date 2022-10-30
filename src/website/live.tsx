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
import type { Mark } from '@mui/base';

import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

import { LineGraph } from './lineGraph.js';
import type { IStorageData } from '../interfaces/IData.js';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database.js';

/** Available marks on time slider */
const marks: Mark[] = [
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
export function Live(): JSX.Element {
    const [showTime, setShowTime] = React.useState<number>(60 * 60 * 1000);
    const [showInterval, setShowInterval] = React.useState<[number, number]>([Date.now() - showTime, Date.now()]);
    const [timeout, setTimeout] = React.useState<number>(10);
    const [pause, setPause] = React.useState<boolean>(false);
    const data = useLiveQuery(() => db.getData(showInterval[0], showInterval[1]), [showInterval]);

    React.useEffect(() => {
        setShowInterval([Date.now() - showTime, Date.now()]);
        const updateInterval = setInterval(() => {
            const now = Date.now();
            setShowInterval([now - showTime, now]);
        }, timeout * 1000);
        return () => clearInterval(updateInterval);
    }, [showTime, timeout]);

    return (<Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
            <Paper sx={{ p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column'}}>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <FormLabel>Anzeige Zeitraum</FormLabel>
                        <Slider
                            value={showTime}
                            onChange={(_, newVal) => setShowTime(newVal as number)}
                            step={null}
                            marks={marks}
                            min={marks[0].value}
                            max={marks[marks.length - 1].value}
                            disabled={pause}
                        />
                    </Grid>
                    <Grid item xs={11}>
                        <FormLabel>{pause
                            ? 'Update pausiert'
                            : 'Update Intervall ' + timeout + ' Sekunden'}</FormLabel>
                        <Slider
                            aria-label='Anzeigeintervall'
                            value={timeout}
                            onChange={(_, newVal) => setTimeout(newVal as number)}
                            min={2}
                            max={120}
                            step={2}
                            disabled={pause}
                        />
                    </Grid>
                    <Grid item xs={1} display='flex' justifyContent='end'>
                        {pause
                            ? <IconButton onClick={() => setPause(false)} size='large'>
                                <PlayCircleIcon fontSize='inherit' color='primary' />
                            </IconButton>
                            : <IconButton onClick={() => setPause(true)} size='large'>
                                <PauseCircleIcon fontSize='inherit' color='primary' />
                            </IconButton>
                        }
                    </Grid>
                </Grid>
            </Paper>
            <Paper sx={{ p: 2, mb: 4 }}>
                { data === undefined ? <CircularProgress /> : <LineGraph data={data} /> }
            </Paper>
        </Grid>
    </Grid>);
}
