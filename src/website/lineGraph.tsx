/**
 * @file React component
 */

import type { ApexOptions } from 'apexcharts';
import * as React from 'react';

import Chart from 'react-apexcharts';

import type { ISeriesData } from '../interfaces/IStorage';

/** React properties */
interface IProps {
    /** Data to show */
    data: ISeriesData;
}

/** Map of inputs */
const inputNames = ['Speicher unten', 'Dach', 'Speicher oben', 'Speicher mitte'];

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

    const inputSeries = [
        {
            name: inputNames[0],
            data: data.input0,
        },
        {
            name: inputNames[1],
            data: data.input1,
        },
        {
            name: inputNames[2],
            data: data.input2,
        },
        {
            name: inputNames[3],
            data: data.input3,
        },
    ];


    const outputSeries = [
        {
            name: 'Pumpe 1',
            data: data.out0,
        },
        {
            name: 'Pumpe 2',
            data: data.out1,
        },
    ];


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
