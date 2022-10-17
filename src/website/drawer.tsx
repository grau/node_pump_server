/**
 * @file React component
 */

import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';

import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BarChartIcon from '@mui/icons-material/BarChart';
import LiveTvIcon from '@mui/icons-material/LiveTv';

export const drawerWidth: number = 240;

/** All available views */
export type TViews = 'live' | 'graph' | 'download';

const DrawerElem = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);


/** React properties */
interface Props {
    /** If the drawer is open */
    open: boolean;
    /** Toggle the drawer state */
    toggleDrawer: () => void;
    /** View change request */
    onChangeView: (view: TViews) => void;
}

/**
 * Hideable drawer to the left
 *
 * @param props React properties
 * @returns React component
 */
export function Drawer(props: Props): JSX.Element {
    const {open, toggleDrawer, onChangeView} = props;

    return <DrawerElem variant="permanent" open={open}>
        <Toolbar
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
            }}
        >
            <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
            </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
            <ListItemButton onClick={() => onChangeView('live')}>
                <ListItemIcon>
                    <LiveTvIcon />
                </ListItemIcon>
                <ListItemText primary="Live" />
            </ListItemButton>
            <ListItemButton onClick={() => onChangeView('graph')}>
                <ListItemIcon>
                    <BarChartIcon />
                </ListItemIcon>
                <ListItemText primary="Historie" />
            </ListItemButton>
            <ListItemButton onClick={() => onChangeView('download')}>
                <ListItemIcon>
                    <DownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Download" />
            </ListItemButton>
        </List>
    </DrawerElem>;
}
