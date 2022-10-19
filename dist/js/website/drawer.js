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
import MemoryIcon from '@mui/icons-material/Memory';
export const drawerWidth = 240;
const DrawerElem = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    '& .MuiDrawer-paper': Object.assign({ position: 'relative', whiteSpace: 'nowrap', width: drawerWidth, transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }), boxSizing: 'border-box' }, (!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    })),
}));
/**
 * Hideable drawer to the left
 *
 * @param props React properties
 * @returns React component
 */
export function Drawer(props) {
    const { open, toggleDrawer, onChangeView } = props;
    return React.createElement(DrawerElem, { variant: "permanent", open: open },
        React.createElement(Toolbar, { sx: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
            } },
            React.createElement(IconButton, { onClick: toggleDrawer },
                React.createElement(ChevronLeftIcon, null))),
        React.createElement(Divider, null),
        React.createElement(List, { component: "nav" },
            React.createElement(ListItemButton, { onClick: () => onChangeView('live') },
                React.createElement(ListItemIcon, null,
                    React.createElement(LiveTvIcon, null)),
                React.createElement(ListItemText, { primary: "Live" })),
            React.createElement(ListItemButton, { onClick: () => onChangeView('graph') },
                React.createElement(ListItemIcon, null,
                    React.createElement(BarChartIcon, null)),
                React.createElement(ListItemText, { primary: "Historie" })),
            React.createElement(ListItemButton, { onClick: () => onChangeView('download') },
                React.createElement(ListItemIcon, null,
                    React.createElement(DownloadIcon, null)),
                React.createElement(ListItemText, { primary: "Download" })),
            React.createElement(Divider, null),
            React.createElement(ListItemButton, { onClick: () => onChangeView('system') },
                React.createElement(ListItemIcon, null,
                    React.createElement(MemoryIcon, null)),
                React.createElement(ListItemText, { primary: "System" }))));
}
