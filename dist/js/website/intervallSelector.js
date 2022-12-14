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
import { db } from './database';
import { useLiveQuery } from 'dexie-react-hooks';
/** All possible timeframe results */
var ETimeframe;
(function (ETimeframe) {
    ETimeframe[ETimeframe["day"] = 0] = "day";
    ETimeframe[ETimeframe["week"] = 1] = "week";
    ETimeframe[ETimeframe["month"] = 2] = "month";
    ETimeframe[ETimeframe["year"] = 3] = "year";
    ETimeframe[ETimeframe["all"] = 4] = "all";
    ETimeframe[ETimeframe["range"] = 5] = "range";
})(ETimeframe || (ETimeframe = {}));
/** Options for the timeframe */
const timeMarks = [
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
const paperSx = { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' };
/**
 * Download dialog
 *
 * @param props React properties
 * @returns React component
 */
export function IntervallSelector(props) {
    const { onTimeframe, titleSlider, titleSelector } = props;
    const [timeframe, setTimeframe] = React.useState(ETimeframe.month);
    const [timeRange, setTimeRange] = React.useState([new Date(Date.now() - 1000 * 3600 * 24), new Date]);
    const minDate = useLiveQuery(() => db.getMinDataDate());
    const changeTimeframe = (newTimeframe, newTimeRange) => {
        const [from, to] = getFromTo(newTimeframe, newTimeRange);
        setTimeRange([new Date(from), new Date(to)]);
        setTimeframe(newTimeframe);
        onTimeframe([from, to]);
    };
    const changeTimeframeView = (newTimeframe) => {
        const [from, to] = getFromTo(newTimeframe, timeRange);
        setTimeRange([new Date(from), new Date(to)]);
        setTimeframe(newTimeframe);
    };
    return React.createElement(Stack, null,
        React.createElement(Paper, { sx: paperSx },
            React.createElement(FormLabel, null, titleSlider),
            React.createElement(Box, { sx: { mb: 4 } },
                React.createElement(Slider, { value: timeframe, onChangeCommitted: (_, newVal) => changeTimeframe(newVal, timeRange), onChange: (_, newVal) => changeTimeframeView(newVal), step: null, marks: timeMarks, min: timeMarks[0].value, max: timeMarks[timeMarks.length - 1].value })),
            React.createElement(FormLabel, null, titleSelector),
            React.createElement(DateTimeRangePicker, { locale: 'de-DE', onChange: (newVal) => changeTimeframe(timeframe, newVal), value: timeRange, minDate: new Date(minDate !== null && minDate !== void 0 ? minDate : Date.now()), maxDate: new Date(), disabled: timeframe !== ETimeframe.range })));
}
/**
 * Returns start and end timestamp for the given input
 *
 * @param timeframe Timeframe selection
 * @param range Timerange (only relevant if timeframe is range)
 * @returns Array from/to
 */
function getFromTo(timeframe, range) {
    var _a, _b, _c, _d;
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
                (_b = (_a = range === null || range === void 0 ? void 0 : range[0]) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : now - 24 * 60 * 60 * 1000,
                (_d = (_c = range === null || range === void 0 ? void 0 : range[1]) === null || _c === void 0 ? void 0 : _c.getTime()) !== null && _d !== void 0 ? _d : now,
            ];
    }
}
