/**
 * @file React component
 */
import * as React from 'react';
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';
import { FaFileExcel, FaFileCsv, FaFileCode, FaDatabase } from 'react-icons/fa';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { getMinDate } from './getData';
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
/**
 * Download dialog
 *
 * @returns React component
 */
export function Download() {
    const [timeframe, setTimeframe] = React.useState(ETimeframe.month);
    const [timeRange, setTimeRange] = React.useState([new Date(Date.now() - 1000 * 3600 * 24), new Date]);
    const [minDate, setMinDate] = React.useState(new Date());
    const paperSx = { p: 4, px: 5, mb: 4, display: 'flex', flexDirection: 'column' };
    const buttonSx = { width: 150 };
    React.useEffect(() => {
        getMinDate()
            .then((date) => setMinDate(new Date(date)))
            .catch((err) => console.warn('Could not fetch min date', { err }));
    });
    const [from, to] = getFromTo(timeframe, timeRange);
    const baseUrl = '/download?from=' + from + '&to=' + to + '&format=';
    return React.createElement(Stack, null,
        React.createElement(Paper, { sx: paperSx },
            React.createElement(FormLabel, null, "Speicherdauer"),
            React.createElement(Box, { sx: { mb: 4 } },
                React.createElement(Slider, { value: timeframe, onChange: (_, newVal) => setTimeframe(newVal), step: null, marks: timeMarks, min: timeMarks[0].value, max: timeMarks[timeMarks.length - 1].value })),
            React.createElement(FormLabel, null, "Zeitrahmen"),
            React.createElement(DateTimeRangePicker, { locale: 'de-DE', onChange: (range) => setTimeRange(range), value: timeRange, minDate: minDate, maxDate: new Date(), disabled: timeframe !== ETimeframe.range })),
        React.createElement(Paper, { sx: paperSx },
            React.createElement(FormLabel, null, "Download"),
            React.createElement(ButtonGroup, null,
                React.createElement(Button, { variant: 'contained', startIcon: React.createElement(SvgIcon, null,
                        React.createElement(FaFileCsv, null)), sx: buttonSx, size: "large", href: baseUrl + 'csv', download: 'Heizung.csv' }, "CSV"),
                React.createElement(Button, { variant: 'contained', startIcon: React.createElement(SvgIcon, null,
                        React.createElement(FaFileCode, null)), sx: buttonSx, size: "large", href: baseUrl + 'json', download: 'Heizung.json' }, "JSON"),
                React.createElement(Button, { variant: 'contained', startIcon: React.createElement(SvgIcon, null,
                        React.createElement(FaFileExcel, null)), sx: buttonSx, size: "large", href: baseUrl + 'xlsx', download: 'Heizung.xlsx' }, "Excel"),
                React.createElement(Button, { variant: 'contained', startIcon: React.createElement(SvgIcon, null,
                        React.createElement(FaDatabase, null)), sx: buttonSx, size: "large", href: '/backup', download: 'Heizung.db' }, "Backup"))));
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
