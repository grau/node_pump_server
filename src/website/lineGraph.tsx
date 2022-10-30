/**
 * @file React component
 */
import * as React from 'react';

import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

import type { IStorageData } from '../interfaces/IData.js';

/** React properties */
interface IProps {
    /** Data to show */
    data: IStorageData[];
}

/** Time series data */
interface ISeriesElem {
    /** Series title */
    name: string;
    /** Data with x and y points */
    data: {
        x: number;
        y: number;
    }[];
}

/** ApexCharts options object for input graph */
const inputOptions: ApexOptions = {
    chart: {
        id: 'input',
        group: 'group',
        zoom: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    stroke: {
        width: 5,
        curve: 'straight',
    },
    xaxis: {
        type: 'datetime',
    },
    yaxis: {
        decimalsInFloat: 1,
    },
    title: {
        text: 'Sensoren',
        align: 'left',
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
    },
};

/** ApexCharts options object for output graph */
const outputOptions: ApexOptions = {
    chart: {
        group: 'group',
        zoom: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    stroke: {
        width: 5,
        curve: 'stepline',
    },
    xaxis: {
        type: 'datetime',
    },
    yaxis: {
        decimalsInFloat: 0,
        tickAmount: 1,
    },
    dataLabels: {
        enabled: false,
    },
    title: {
        text: 'Pumpen',
        align: 'left',
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
    },
};

/**
 * Line graph
 *
 * @param props React properties
 * @returns React component
 */
export function LineGraph(props: IProps): JSX.Element {
    const { data } = props;
    const {inputSeries, outputSeries} = React.useMemo(() => getSeriesData(data), [data]);
    console.log('Graph showing data', {data, inputSeries, outputSeries});
    return <>
        <Chart
            options={inputOptions}
            series={inputSeries}
            type='line'
            width="100%"
            height={400}
        />
        <Chart
            options={outputOptions}
            series={outputSeries}
            type='area'
            width="100%"
            height={300}
        />
    </>;
}

/**
 * Transforms the given storage data to data series
 *
 * @param data Data to transform
 * @returns transformed data
 */
function getSeriesData(data: IStorageData[]):
    {inputSeries: ApexOptions['series'], outputSeries: ApexOptions['series']} {
    /** Map of inputs */
    const inputSeries: ISeriesElem[] = [
        {
            name: 'Speicher unten',
            data: [],
        },
        {
            name: 'Dach',
            data: [],
        },
        {
            name: 'Speicher oben',
            data: [],
        },
        {
            name: 'Speicher mitte',
            data: [],
        },
    ];

    const outputSeries: ISeriesElem[] = [
        {
            name: 'Pumpe 1',
            data: [],
        },
        {
            name: 'Pumpe 2',
            data: [],
        },
    ];

    for (const row of data) {
        inputSeries[0].data.push({x: row.timestamp, y: row.input[0].val});
        inputSeries[1].data.push({x: row.timestamp, y: row.input[1].val});
        inputSeries[2].data.push({x: row.timestamp, y: row.input[2].val});
        inputSeries[3].data.push({x: row.timestamp, y: row.input[3].val});

        outputSeries[0].data.push({x: row.timestamp, y: row.output[0].val});
        outputSeries[1].data.push({x: row.timestamp, y: row.output[1].val});
    }

    for (let i = 0; i < 4; i++) {
        inputSeries[i].data = downsample(inputSeries[i].data, 500);
    }
    outputSeries[0].data = downsample(outputSeries[0].data, 500);
    outputSeries[1].data = downsample(outputSeries[1].data, 500);
    return {inputSeries, outputSeries};
}

/**
 * Largest Triangle Three Buckets downsample algorithm by Sveinn Steinarsson
 *
 * @see https://github.com/pingec/downsample-lttb
 * @param data Data to downsample
 * @param threshold Number of points as target
 * @returns downsampled data
 */
function downsample(data: ISeriesElem['data'], threshold: number): ISeriesElem['data'] {

    const data_length = data.length;
    if (threshold >= data_length || threshold === 0) {
        return data; // Nothing to do
    }

    const sampled: {x: number, y: number}[] = [];
    let sampled_index = 0;

    // Bucket size. Leave room for start and end data points
    const every = (data_length - 2) / (threshold - 2);

    let a = 0; // Initially a is the first point in the triangle
    let max_area_point = {x: 0, y: 0},
        max_area,
        area;
    let next_a = 0;

    sampled[ sampled_index++ ] = data[ a ]; // Always add the first point

    for (let i = 0; i < threshold - 2; i++) {

        // Calculate point average for next bucket (containing c)
        let avg_x = 0;
        let avg_y = 0;
        let avg_range_start = Math.floor( ( i + 1 ) * every ) + 1;
        let avg_range_end = Math.floor( ( i + 2 ) * every ) + 1;
        avg_range_end = avg_range_end < data_length ? avg_range_end : data_length;

        const avg_range_length = avg_range_end - avg_range_start;

        for ( ; avg_range_start<avg_range_end; avg_range_start++ ) {
            avg_x += data[ avg_range_start ].x * 1; // * 1 enforces Number (value may be Date)
            avg_y += data[ avg_range_start ].y * 1;
        }
        avg_x /= avg_range_length;
        avg_y /= avg_range_length;

        // Get the range for this bucket
        let range_offs = Math.floor( (i + 0) * every ) + 1;
        const range_to = Math.floor( (i + 1) * every ) + 1;

        // Point a
        const point_a_x = data[ a ].x * 1; // enforce Number (value may be Date)
        const point_a_y = data[ a ].y * 1;

        max_area = area = -1;

        for ( ; range_offs < range_to; range_offs++ ) {
            // Calculate triangle area over three buckets
            area = Math.abs( ( point_a_x - avg_x ) * ( data[ range_offs ].y - point_a_y )
						- ( point_a_x - data[ range_offs ].x) * ( avg_y - point_a_y )
            ) * 0.5;
            if ( area > max_area ) {
                max_area = area;
                max_area_point = data[ range_offs ];
                next_a = range_offs; // Next a is this b
            }
        }

        sampled[ sampled_index++ ] = max_area_point; // Pick this point from the bucket
        a = next_a; // This a is the next a (chosen b)
    }

    sampled[ sampled_index++ ] = data[ data_length - 1 ]; // Always add last
    return sampled;
}
