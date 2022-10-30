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
import type { ISystemData } from '../fetchAndStore/system.js';

/** Sotrage graph options */
const storageOptions: ApexOptions = {
    chart: {
        type: 'pie',
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
};

/** Memory graph options */
const memoryOptions: ApexOptions = {
    chart: {
        type: 'pie',
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
};

/**
 * Some system stats
 *
 * @returns React component
 */
export function System(): JSX.Element {
    const [data, setData] = React.useState<ISystemData[] | null>(null);

    // const fetchData = () => {
    //     getSystem()
    //         .then(setData)
    //         .catch((err: unknown) => console.warn('Failed to fetch data', {err}));
    // };

    // React.useEffect(() => {
    //     fetchData();
    //     const interval = setInterval(() => {
    //         fetchData();
    //     }, 60000);
    //     return () => {
    //         clearInterval(interval);
    //     };
    // });

    if (data === null) {
        return <CircularProgress />;
    }

    const headData = data[data.length - 1];

    const storageUsed = headData.diskSpace.size - headData.diskSpace.free - headData.dbSize;
    const storageData = [headData.dbSize, storageUsed, headData.diskSpace.free ];
    const memoryData = [headData.mem.total-headData.mem.free, headData.mem.free];

    return (<Grid container spacing={3}>
        <Grid item xs={12}>
            <VersionInfo />
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
