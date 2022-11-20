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
import FormLabel from '@mui/material/FormLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Chart from 'react-apexcharts';
import { VersionInfo } from './versionInfo.js';
/** Static time calculation values */
const timeNames = [
    { title: 'Sekunden', max: 60, div: 1 },
    { title: 'Minuten', max: 3600, div: 60 },
    { title: 'Stunden', max: 3600 * 24, div: 3600 },
    { title: 'Tage', max: 3600 * 24 * 7, div: 3600 * 24 },
    { title: 'Wochen', max: 3600 * 24 * 30, div: 3600 * 24 * 7 },
    { title: 'Monate', max: 3600 * 24 * 356, div: 3600 * 24 * 30 },
    { title: 'Jahre', max: Number.MAX_SAFE_INTEGER, div: 3600 * 24 * 356 },
];
/** Sotrage graph options */
const storageOptions = {
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
const memoryOptions = {
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
const cpuOptions = {
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
export function System() {
    const [data, setData] = React.useState(null);
    const fetchData = () => __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('/system');
        const json = yield response.json();
        setData(json);
    });
    console.warn(data);
    React.useEffect(() => {
        fetchData()
            .catch((err) => console.warn('Failed to gather initial system data', { err }));
        const interval = setInterval(() => {
            fetchData()
                .catch((err) => console.warn('Failed to gather system data', { err }));
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);
    if (data === null) {
        return React.createElement(CircularProgress, null);
    }
    const storageUsed = data.diskSpace.size - data.diskSpace.free - data.dbSize;
    const storageData = [data.dbSize, storageUsed, data.diskSpace.free];
    const memoryData = [data.mem.total - data.mem.free, data.mem.free];
    return (React.createElement(Grid, { container: true, spacing: 3 },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(VersionInfo, null)),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Paper, { sx: { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' } },
                React.createElement(FormLabel, null, "Uptime"),
                getTimeString(data.uptime))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Paper, { sx: { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' } },
                React.createElement(FormLabel, null, "Systemstatus"),
                React.createElement(Grid, { container: true, spacing: 3 },
                    React.createElement(Grid, { item: true, lg: 6, md: 12 },
                        React.createElement(Chart, { options: storageOptions, series: storageData, type: 'pie', width: "100%", height: 400 })),
                    React.createElement(Grid, { item: true, lg: 6, md: 12 },
                        React.createElement(Chart, { options: memoryOptions, series: memoryData, type: 'pie', width: "100%", height: 400 })),
                    React.createElement(Grid, { item: true, lg: 6, md: 12 },
                        React.createElement(Chart, { options: cpuOptions, series: data.cpuTimes, type: 'pie', width: "100%", height: 400 })))))));
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
/**
 * Formats a time statement human readable
 *
 * @param timeInSeconds Time to convert
 * @returns Converted time
 */
function getTimeString(timeInSeconds) {
    for (const timeName of timeNames) {
        if (timeInSeconds < timeName.max) {
            return (Math.round(10 * timeInSeconds / timeName.div) / 10) + ' ' + timeName.title;
        }
    }
    throw new Error('Uptime bigger than Number.MAX_SAFE_INTEGER!');
}
