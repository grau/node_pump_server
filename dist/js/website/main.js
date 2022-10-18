/**
 * @file React component
 */
import * as React from 'react';
import { Live } from './live';
import { Graph } from './graph';
import { Download } from './download';
/**
 * Content pane
 *
 * @param props React properties
 * @returns React component
 */
export function Main(props) {
    const { view } = props;
    console.log(view);
    switch (view) {
        case 'graph':
            return React.createElement(Graph, null);
        case 'download':
            return React.createElement(Download, null);
        default:
        case 'live':
            return React.createElement(Live, null);
    }
}
