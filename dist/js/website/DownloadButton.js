/**
 * @file React component
 */
import * as React from 'react';
import { FaFileCsv } from 'react-icons/fa';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
const buttonSx = { width: 150 };
/**
 * Download dialog
 *
 * @param props React properties
 * @returns React component
 */
export function DownloadButton(props) {
    console.warn(props);
    return React.createElement(Button, { variant: 'contained', startIcon: React.createElement(SvgIcon, null,
            React.createElement(FaFileCsv, null)), sx: buttonSx, size: "large" }, "'FOO'");
}
