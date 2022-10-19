/**
 * @file React component
 */
import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Chart from 'react-apexcharts';
import { getSystem } from './getData.js';
import { VersionInfo } from './versionInfo.js';
/** Sotrage graph options */
const storageOptions = {
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
const memoryOptions = {
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
export function System() {
    const [data, setData] = React.useState(null);
    const fetchData = () => {
        getSystem()
            .then(setData)
            .catch((err) => console.warn('Failed to fetch data', { err }));
    };
    React.useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 60000);
        return () => {
            clearInterval(interval);
        };
    });
    if (data === null) {
        return React.createElement(CircularProgress, null);
    }
    const headData = data[data.length - 1];
    const storageUsed = headData.diskSpace.size - headData.diskSpace.free - headData.dbSize;
    const storageData = [headData.dbSize, storageUsed, headData.diskSpace.free];
    const memoryData = [headData.mem.total - headData.mem.free, headData.mem.free];
    return (React.createElement(Grid, { container: true, spacing: 3 },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(VersionInfo, null)),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Paper, { sx: { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' } },
                React.createElement(FormLabel, null, "Systemstatus"),
                React.createElement(Grid, { container: true, spacing: 3 },
                    React.createElement(Grid, { item: true, lg: 6, md: 12 },
                        React.createElement(Chart, { options: storageOptions, series: storageData, type: 'pie', width: "100%", height: 400 })),
                    React.createElement(Grid, { item: true, lg: 6, md: 12 },
                        React.createElement(Chart, { options: memoryOptions, series: memoryData, type: 'pie', width: "100%", height: 400 })))))));
}
/**
 * Converts size in bytes in human readable value
 *
 * @param sizeInBytes Number of bytes
 * @returns Human readable string
 */
function getSizeString(sizeInBytes) {
    const sizeNames = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
    let testSize = 1000;
    for (const name of sizeNames) {
        if (sizeInBytes < testSize) {
            return Math.round(sizeInBytes / testSize * 10000) / 10 + name;
        }
        else {
            testSize *= 1000;
        }
    }
    return Math.round(sizeInBytes / testSize * 10) / 10 + 'YB';
}
