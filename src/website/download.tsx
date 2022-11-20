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
import type { SxProps } from '@mui/material';

import { IntervallSelector } from './intervallSelector';

const paperSx: SxProps = { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column'};
const buttonSx: SxProps = { width: 150 };

/**
 * Download dialog
 *
 * @returns React component
 */
export function Download(): JSX.Element {
    const [timeframe, setTimeframe] = React.useState<[number, number]>([Date.now(), Date.now()]);

    return <Stack>
        <IntervallSelector titleSelector='Speicherdauer' titleSlider='Zeitrahmen' onTimeframe={setTimeframe} />
        <Paper sx={paperSx}>
            <FormLabel>
                Download
            </FormLabel>
            <ButtonGroup>
                <Button variant='contained' startIcon={<SvgIcon><FaFileCsv /></SvgIcon>} sx={buttonSx} size="large"
                    href={'/csv?from=' + timeframe[0] + '&to=' + timeframe[1]} download='Heizung.csv'>
                    CSV
                </Button>
            </ButtonGroup>
        </Paper>
    </Stack>;
}
