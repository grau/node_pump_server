/**
 * @file React component
 */

import * as React from 'react';

import { Live } from './live.js';
import type { TViews } from './drawer.js';
import { Graph } from './graph.js';
import { Download } from './download.js';
import { System } from './system.js';

/** React properties */
interface IProps {
    /** View to show */
    view: TViews;
}

/**
 * Content pane
 *
 * @param props React properties
 * @returns React component
 */
export function Main(props: IProps): JSX.Element {
    const { view } = props;
    switch (view) {
    case 'graph':
        return <Graph />;
    case 'download':
        return <Download />;
    case 'system':
        return <System />;
    default:
    case 'live':
        return <Live />;
    }
}
