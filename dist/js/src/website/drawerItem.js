/**
 * @file React component
 */
import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
/**
 * Hideable drawer to the left
 *
 * @param props React properties
 * @returns React component
 */
export function DrawerItem(props) {
    const { activeView, view, title, onChangeView, icon } = props;
    return React.createElement(ListItemButton, { onClick: () => onChangeView(view), selected: view === activeView },
        React.createElement(ListItemIcon, null, icon),
        React.createElement(ListItemText, { primary: title }));
}
