/**
 * @file React component
 */

import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import type { TViews } from './drawer.js';


/** React properties */
interface Props {
    /** Title of this item */
    title: string;
    /** View that is active */
    activeView: TViews
    /** This view name */
    view: TViews;
    /** View change request */
    onChangeView: (view: TViews) => void;
    /** Icon */
    icon: JSX.Element
}

/**
 * Hideable drawer to the left
 *
 * @param props React properties
 * @returns React component
 */
export function DrawerItem(props: Props): JSX.Element {
    const {activeView, view, title, onChangeView, icon} = props;

    return <ListItemButton onClick={() => onChangeView(view)} selected={view === activeView}>
        <ListItemIcon>
            {icon}
        </ListItemIcon>
        <ListItemText primary={title} />
    </ListItemButton>;
}
