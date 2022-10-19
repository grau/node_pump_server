/**
 * @file React component
 */
import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Chart from 'react-apexcharts';
import { getSystem } from './getData.js';
/** ApexCharts options object for input graph */
const storageOptions = {
    chart: {
        type: 'pie',
    },
    labels: ['Datenbank', 'System', 'Frei'],
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
            .catch((err) => console.warn('Failed to fetch system data', { err }));
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
    const storageFree = headData.diskSpace.size - headData.diskSpace.free - headData.dbSize;
    const storageData = [headData.dbSize, storageFree, headData.diskSpace.free];
    return (React.createElement(Grid, { container: true, spacing: 3 },
        React.createElement(Grid, { item: true, xs: 12, md: 8, lg: 9 },
            React.createElement(Paper, { sx: { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' } },
                React.createElement("pre", null,
                    React.createElement(Chart, { options: storageOptions, series: storageData, type: 'line', width: "100%", height: 400 }),
                    JSON.stringify(headData, null, 2))))));
}
