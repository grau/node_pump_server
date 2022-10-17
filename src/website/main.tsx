/**
 * @file React component
 */

import * as React from 'react';

import { Live } from './live';
import type { TViews } from './drawer';
import { Graph } from './graph';
import { Download } from './download';

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
    console.log(view);
    switch (view) {
    case 'graph':
        return <Graph />;
    case 'download':
        return <Download />;
    default:
    case 'live':
        return <Live />;
    }
}
