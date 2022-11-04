/**
 * @file React component
 */
import * as React from 'react';
import { useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { formatTimeDuration } from './helpers';
/**
 * Modal dialog show progress while downloading.
 *
 * @param props React properties
 * @returns React component
 */
export function DownloadProgress(props) {
    const { fileCount, fileNum, filename, isFinished, timeStart } = props;
    const [now, setNow] = useState(Date.now());
    const transferProgress = fileCount === 0 || isFinished ? 100
        : fileNum / fileCount * 100;
    // Forced re render every 300ms. now is in fact useless and could be a counter
    useEffect(() => {
        if (isFinished) {
            setNow(Date.now());
            return () => { };
        }
        else {
            setNow(Date.now());
            const interval = setInterval(() => {
                setNow(Date.now());
            }, 1000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [isFinished]);
    const duration = Math.floor((now - timeStart) / 1000) * 1000;
    const timeTotal = fileNum > 0 ? Math.floor(duration * (fileCount / fileNum)) : 0;
    return (React.createElement(Paper, { elevation: 4, sx: { px: 2, py: 2, mt: 2 } },
        React.createElement(Typography, { variant: 'body1', sx: { textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' } }, isFinished ? 'Download abgeschlossen' : 'Sende Datei "' + filename + '"'),
        React.createElement(LinearProgress, { variant: 'determinate', value: transferProgress, sx: { mx: 2, my: 1, height: 10, borderRadius: 5 } }),
        React.createElement(Typography, { variant: 'body1' }, formatTimeDuration(duration) + ' / ' + formatTimeDuration(timeTotal))));
}
