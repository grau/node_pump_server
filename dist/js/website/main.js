/**
 * @file React component
 */
import * as React from 'react';
import { Live } from './live.js';
import { Graph } from './graph.js';
import { Download } from './download.js';
import { System } from './system.js';
/**
 * Content pane
 *
 * @param props React properties
 * @returns React component
 */
export function Main(props) {
    const { view } = props;
    switch (view) {
        case 'graph':
            return React.createElement(Graph, null);
        case 'download':
            return React.createElement(Download, null);
        case 'system':
            return React.createElement(System, null);
        default:
        case 'live':
            return React.createElement(Live, null);
    }
}
