/**
 * @file React component
 */
import * as React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
// import NotificationsIcon from '@mui/icons-material/Notifications';
import { drawerWidth } from './drawer.js';
const AppBarElem = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => (Object.assign({ zIndex: theme.zIndex.drawer + 1, transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }) }, (open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
}))));
/**
 * App bar on top
 *
 * @param props React properties
 * @returns React component
 */
export function AppBar(props) {
    const { open, toggleDrawer } = props;
    return React.createElement(AppBarElem, { position: "absolute", open: open },
        React.createElement(Toolbar, { sx: {
                pr: '24px', // keep right padding when drawer closed
            } },
            React.createElement(IconButton, { edge: "start", color: "inherit", "aria-label": "open drawer", onClick: toggleDrawer, sx: Object.assign({ marginRight: '36px' }, (open && { display: 'none' })) },
                React.createElement(MenuIcon, null)),
            React.createElement(Typography, { component: "h1", variant: "h6", color: "inherit", noWrap: true, sx: { flexGrow: 1 } }, "Dashboard")));
}
