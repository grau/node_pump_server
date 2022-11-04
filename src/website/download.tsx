/**
 * @file React component
 */

import * as React from 'react';

import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';

import { FaFileExcel, FaFileCsv, FaFileCode } from 'react-icons/fa';

import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import type { Mark } from '@mui/base';
import type { SxProps } from '@mui/material';

import { db } from './database';
import { useLiveQuery } from 'dexie-react-hooks';
import { download, getCsv, getExcel, getJSON } from './fileProvider';

/** All possible timeframe results */
enum ETimeframe {
    day = 0,
    week,
    month,
    year,
    all,
    range,
}

/** Options for the timeframe */
const timeMarks: Mark[] = [
    {
        value: ETimeframe.day,
        label: 'Heute',
    },
    {
        value: ETimeframe.week,
        label: 'Woche',
    },
    {
        value: ETimeframe.month,
        label: 'Monat',
    },
    {
        value: ETimeframe.year,
        label: 'Jahr',
    },
    {
        value: ETimeframe.all,
        label: 'Alles',
    },
    {
        value: ETimeframe.range,
        label: 'Zeitrahmen',
    },
];

const paperSx: SxProps = { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column'};
const buttonSx: SxProps = { width: 150 };

/**
 * Download dialog
 *
 * @returns React component
 */
export function Download(): JSX.Element {
    const [timeframe, setTimeframe] = React.useState<ETimeframe>(ETimeframe.month);
    const [timeRange, setTimeRange] = React.useState<[(Date | undefined)?, (Date | undefined)?] | null>(
        [new Date(Date.now() - 1000 * 3600 * 24), new Date]);
    const minDate = useLiveQuery(() => db.getMinDataDate());
    const [from, to] = React.useMemo(() => getFromTo(timeframe, timeRange), [timeframe, timeRange]);

    return <Stack>
        <Paper sx={paperSx}>
            <FormLabel>
                Speicherdauer
            </FormLabel>
            <Box sx={{mb: 4}}>
                <Slider
                    value={timeframe}
                    onChange={(_, newVal) => setTimeframe(newVal as number)}
                    step={null}
                    marks={timeMarks}
                    min={timeMarks[0].value}
                    max={timeMarks[timeMarks.length - 1].value}
                />
            </Box>

            <FormLabel>
                Zeitrahmen
            </FormLabel>
            <DateTimeRangePicker
                locale='de-DE'
                onChange={(range) => setTimeRange(range)}
                value={timeRange}
                minDate={new Date(minDate ?? Date.now())}
                maxDate={new Date()}
                disabled={timeframe !== ETimeframe.range}
            />
        </Paper>
        <Paper sx={paperSx}>
            <FormLabel>
                Download
            </FormLabel>
            <ButtonGroup>
                <Button variant='contained' startIcon={<SvgIcon><FaFileCsv /></SvgIcon>} sx={buttonSx} size="large"
                    onClick={async () => download(await getCsv(from, to), 'pumpData.csv')}>
                    CSV
                </Button>
                <Button variant='contained' startIcon={<SvgIcon><FaFileCode /></SvgIcon>} sx={buttonSx} size="large"
                    onClick={async () => download(await getJSON(from, to), 'pumpData.json')}>
                    JSON
                </Button>
                <Button variant='contained' startIcon={<SvgIcon><FaFileExcel /></SvgIcon>} sx={buttonSx} size="large"
                    onClick={async () => download(await getExcel(from, to), 'pumpData.xlsx')}>
                    Excel
                </Button>
            </ButtonGroup>
        </Paper>
    </Stack>;
}

/**
 * Returns start and end timestamp for the given input
 *
 * @param timeframe Timeframe selection
 * @param range Timerange (only relevant if timeframe is range)
 * @returns Array from/to
 */
function getFromTo(timeframe: ETimeframe, range: [(Date | undefined)?, (Date | undefined)?] | null): [number, number] {
    const now = Date.now();
    switch (timeframe) {
    case ETimeframe.day:
        return [now - 24 * 60 * 60 * 1000, now];
    case ETimeframe.week:
        return [now - 7 * 24 * 60 * 60 * 1000, now];
    case ETimeframe.month:
        return [now - 30 * 24 * 60 * 60 * 1000, now];
    case ETimeframe.year:
        return [now - 356 * 24 * 60 * 60 * 1000, now];
    case ETimeframe.all:
        return [
            0,
            now,
        ];
    case ETimeframe.range:
        return [
            range?.[0]?.getTime() ?? now - 24 * 60 * 60 * 1000,
            range?.[1]?.getTime() ?? now,
        ];
    }
}
