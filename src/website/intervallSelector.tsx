/**
 * @file React component
 */

import * as React from 'react';

import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';

import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import type { Mark } from '@mui/base';
import type { SxProps } from '@mui/material';

import { db } from './database';
import { useLiveQuery } from 'dexie-react-hooks';

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
        label: 'Tag',
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

/** React properties */
interface IProps {
    /** On timeframe change */
    onTimeframe: (timerange: [number, number]) => void;
    /** Title of slider element */
    titleSlider: string;
    /** Title of selector element */
    titleSelector: string;
}

/**
 * Download dialog
 *
 * @param props React properties
 * @returns React component
 */
export function IntervallSelector(props: IProps): JSX.Element {
    const {onTimeframe, titleSlider, titleSelector} = props;
    const [timeframe, setTimeframe] = React.useState<ETimeframe>(ETimeframe.month);
    const [timeRange, setTimeRange] = React.useState<[Date, Date]>(
        [new Date(Date.now() - 1000 * 3600 * 24), new Date]);
    const minDate = useLiveQuery(() => db.getMinDataDate());

    const changeTimeframe = (newTimeframe: ETimeframe,
        newTimeRange: [(Date | undefined)?, (Date | undefined)?] | null) => {
        const [from, to] = getFromTo(newTimeframe, newTimeRange);
        setTimeRange([new Date(from), new Date(to)]);
        setTimeframe(newTimeframe);
        onTimeframe([from, to]);
    };

    const changeTimeframeView = (newTimeframe: ETimeframe) => {
        const [from, to] = getFromTo(newTimeframe, timeRange);
        setTimeRange([new Date(from), new Date(to)]);
        setTimeframe(newTimeframe);
    };

    return <Stack>
        <Paper sx={paperSx}>
            <FormLabel>
                {titleSlider}
            </FormLabel>
            <Box sx={{mb: 4}}>
                <Slider
                    value={timeframe}
                    onChangeCommitted={(_, newVal) => changeTimeframe(newVal as ETimeframe, timeRange)}
                    onChange={(_, newVal) => changeTimeframeView(newVal as ETimeframe)}
                    step={null}
                    marks={timeMarks}
                    min={timeMarks[0].value}
                    max={timeMarks[timeMarks.length - 1].value}
                />
            </Box>

            <FormLabel>
                {titleSelector}
            </FormLabel>
            <DateTimeRangePicker
                locale='de-DE'
                onChange={(newVal) => changeTimeframe(timeframe, newVal)}
                value={timeRange}
                minDate={new Date(minDate ?? Date.now())}
                maxDate={new Date()}
                disabled={timeframe !== ETimeframe.range}
            />
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
