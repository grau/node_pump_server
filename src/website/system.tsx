/**
 * @file React component
 */

import * as React from 'react';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';

import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

import { VersionInfo } from './versionInfo.js';
import type { ISystemData } from '../interfaces/ISystemData';

/** Static time calculation values */
const timeNames: {title: string, max: number, div: number}[] = [
    { title: 'Sekunden', max: 60, div: 1 },
    { title: 'Minuten', max: 3600, div: 60 },
    { title: 'Stunden', max: 3600 * 24, div: 3600 },
    { title: 'Tage', max: 3600 * 24 * 7 , div: 3600 * 24},
    { title: 'Wochen', max: 3600 * 24 * 30, div: 3600 * 24 * 7 },
    { title: 'Monate', max: 3600 * 24 * 356, div: 3600 * 24 * 30 },
    { title: 'Jahre', max: Number.MAX_SAFE_INTEGER, div: 3600 * 24 * 356 },
];

/** Sotrage graph options */
const storageOptions: ApexOptions = {
    chart: {
        type: 'pie',
        animations: {
            enabled: true,
        },
        dropShadow: {
            enabled: true,
            top: 0,
            left: 10,
            blur: 15,
            color: '#000',
            opacity: 0.35,
        },
    },
    title: {
        text: 'Massenspeicher',
        align: 'left',
    },
    labels: ['Datenbank', 'System', 'Frei'],
    tooltip: {
        y: {
            formatter: getSizeString,
        },
    },
    stroke: {
        show: false,
    },
};

/** Memory graph options */
const memoryOptions: ApexOptions = {
    chart: {
        type: 'pie',
        animations: {
            enabled: true,
        },
        dropShadow: {
            enabled: true,
            top: 0,
            left: 10,
            blur: 15,
            color: '#000',
            opacity: 0.35,
        },
    },
    title: {
        text: 'Arbeitsspeicher',
        align: 'left',
    },
    labels: ['Belegt', 'Frei'],
    tooltip: {
        y: {
            formatter: getSizeString,
        },
    },
    stroke: {
        show: false,
    },
};

/** Memory graph options */
const cpuOptions: ApexOptions = {
    chart: {
        type: 'pie',
        animations: {
            enabled: true,
        },
        dropShadow: {
            enabled: true,
            top: 0,
            left: 10,
            blur: 15,
            color: '#000',
            opacity: 0.35,
        },
    },
    title: {
        text: 'CPU-Last',
        align: 'left',
    },
    labels: ['Idle', 'Hardware', 'System/OS', 'Anwendungen'],
    stroke: {
        show: false,
    },
};

/**
 * Some system stats
 *
 * @returns React component
 */
export function System(): JSX.Element {
    const [data, setData] = React.useState<ISystemData | null>(null);

    const fetchData = async () => {
        const response = await fetch('/system');
        const json = await response.json();
        setData(json);
    };

    console.warn(data);
    React.useEffect(() => {
        fetchData()
            .catch((err) => console.warn('Failed to gather initial system data', {err}));
        const interval = setInterval(() => {
            fetchData()
                .catch((err) => console.warn('Failed to gather system data', {err}));
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    if (data === null) {
        return <CircularProgress />;
    }

    const storageUsed = data.diskSpace.size - data.diskSpace.free - data.dbSize;
    const storageData = [data.dbSize, storageUsed, data.diskSpace.free ];
    const memoryData = [data.mem.total - data.mem.free, data.mem.free];

    return (<Grid container spacing={3}>
        <Grid item xs={12}>
            <VersionInfo />
        </Grid>
        <Grid item xs={12}>
            <Paper sx={{ p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column'}}>
                <FormLabel>Uptime</FormLabel>
                {getTimeString(data.uptime)}
            </Paper>
        </Grid>
        <Grid item xs={12}>
            <Paper sx={{ p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column'}}>
                <FormLabel>Systemstatus</FormLabel>
                <Grid container spacing={3}>
                    <Grid item lg={6} md={12}>
                        <Chart
                            options={storageOptions}
                            series={storageData}
                            type='pie'
                            width="100%"
                            height={400}
                        />
                    </Grid>
                    <Grid item lg={6} md={12}>
                        <Chart
                            options={memoryOptions}
                            series={memoryData}
                            type='pie'
                            width="100%"
                            height={400}
                        />
                    </Grid>
                    <Grid item lg={6} md={12}>
                        <Chart
                            options={cpuOptions}
                            series={data.cpuTimes}
                            type='pie'
                            width="100%"
                            height={400}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
    </Grid>);
}

/**
 * Converts size in bytes in human readable value
 *
 * @param sizeInBytes Number of bytes
 * @returns Human readable string
 */
function getSizeString(sizeInBytes: number): string {
    const sizeNames = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
    let testSize = 1000;
    for (const name of sizeNames) {
        if (sizeInBytes < testSize) {
            return Math.round(sizeInBytes / testSize * 10000) / 10 + name;
        } else {
            testSize *= 1000;
        }
    }
    return Math.round(sizeInBytes / testSize * 10) / 10 + 'YB';
}

/**
 * Formats a time statement human readable
 *
 * @param timeInSeconds Time to convert
 * @returns Converted time
 */
function getTimeString(timeInSeconds: number): string {
    for (const timeName of timeNames) {
        if (timeInSeconds < timeName.max) {
            return (Math.round(10 * timeInSeconds / timeName.div) / 10) + ' ' + timeName.title;
        }
    }
    throw new Error('Uptime bigger than Number.MAX_SAFE_INTEGER!', {timeInSeconds});
}
