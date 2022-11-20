/**
 * @file React component
 */
import * as React from 'react';
import { FaFileCsv } from 'react-icons/fa';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { IntervallSelector } from './intervallSelector';
const paperSx = { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' };
const buttonSx = { width: 150 };
/**
 * Download dialog
 *
 * @returns React component
 */
export function Download() {
    const [timeframe, setTimeframe] = React.useState([Date.now(), Date.now()]);
    return React.createElement(Stack, null,
        React.createElement(IntervallSelector, { titleSelector: 'Speicherdauer', titleSlider: 'Zeitrahmen', onTimeframe: setTimeframe }),
        React.createElement(Paper, { sx: paperSx },
            React.createElement(FormLabel, null, "Download"),
            React.createElement(ButtonGroup, null,
                React.createElement(Button, { variant: 'contained', startIcon: React.createElement(SvgIcon, null,
                        React.createElement(FaFileCsv, null)), sx: buttonSx, size: "large", href: '/csv?from=' + timeframe[0] + '&to=' + timeframe[1], download: 'Heizung.csv' }, "CSV"))));
}
