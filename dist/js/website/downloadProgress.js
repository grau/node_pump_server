/**
 * @file Nice little progress icon
 */
import * as React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { db } from './database';
/**
 * Progress icon showing the status of the background task downlad
 *
 * @returns React element
 */
export function DownloadProgress() {
    const indexData = useLiveQuery(() => db.getFileIndex());
    console.log(indexData);
    if (indexData === undefined) {
        return React.createElement(CircularProgress, { thickness: 6, color: 'secondary' });
    }
    else {
        const count = indexData.length;
        const downloaded = indexData.filter((elem) => elem.fetched >= elem.lastChanged).length;
        if (count === downloaded) {
            return React.createElement(CircularProgressWithLabel, { thickness: 6, variant: 'determinate', color: 'success', value: 100 });
        }
        else {
            return React.createElement(CircularProgressWithLabel, { thickness: 6, variant: 'determinate', color: 'secondary', value: downloaded / count * 100 });
        }
    }
}
/**
 * Circular progress with label
 *
 * @param props React properties
 * @returns React element
 * @see https://mui.com/material-ui/react-progress/#circular-with-label
 */
function CircularProgressWithLabel(props) {
    return (React.createElement(Box, { sx: { position: 'relative', display: 'inline-flex' } },
        React.createElement(CircularProgress, Object.assign({ variant: 'determinate' }, props)),
        React.createElement(Box, { sx: {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            } },
            React.createElement(Typography, { variant: 'caption', component: 'div', color: 'text.secondary' }, `${Math.round(props.value)}%`))));
}
