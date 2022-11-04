/**
 * @file React component
 */
import * as React from 'react';
import delay from 'delay';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { green, red } from '@mui/material/colors';
import { ZipTransformer } from './lib/zipTransformer';
import { FileSource } from './lib/fileSource';
import { DownloadProgress } from './downloadProgress';
import { ModalBase } from './modalBase';
/**
 * Modal dialog show progress while downloading.
 *
 * @param props React properties
 * @returns React component
 */
export function ZipStream(props) {
    const { onClose, writeStream, files, title } = props;
    const [fileCount, setFileCount] = useState(1);
    const [fileNum, setFileNum] = useState(0);
    const [filename, setFilename] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const timeStart = useMemo(() => Date.now(), []);
    const downloadController = useMemo(() => new FileSource(files), [files]);
    const [error, setError] = useState(null);
    const [warnings, setWarnings] = useState([]);
    const handleError = useCallback((err) => {
        downloadController.abort();
        console.warn('handleError, Failed to write data stream', { err, filename });
        setError('Fehler beim verarbeiten der Datei ' + downloadController.getFilename() + ': "'
            + err.message + '"');
        setIsFinished(true);
    }, [filename, downloadController]);
    useEffect(() => {
        delay(100).then(() => {
            try {
                downloadController.onChange = () => {
                    setFileCount(downloadController.getFileCount());
                    setFileNum(downloadController.getPosition());
                    setFilename(downloadController.getFilename());
                };
                downloadController.onFinish = () => {
                    setIsFinished(true);
                };
                downloadController.onError = (err) => {
                    handleError(err);
                };
                downloadController.onWarn = () => {
                    setWarnings((oldWarnings) => [downloadController.getFilename(), ...oldWarnings]);
                };
                new ReadableStream(downloadController)
                    .pipeThrough(new TransformStream(new ZipTransformer()))
                    .pipeTo(writeStream)
                    .catch((err) => {
                    handleError(err);
                });
            }
            catch (err) {
                handleError(err);
            }
        }).catch((err) => {
            handleError(err);
        });
    }, [downloadController, handleError, writeStream]);
    const closeHandler = () => {
        downloadController === null || downloadController === void 0 ? void 0 : downloadController.abort();
        onClose();
    };
    const buttonDefs = [{
            title: isFinished ? 'Schliessen' : 'Abbrechen',
            icon: isFinished ? React.createElement(CheckIcon, null) : React.createElement(CloseIcon, null),
            color: isFinished ? green[500] : red[500],
        }];
    return (React.createElement(ModalBase, { title: title, buttonDefs: buttonDefs, onClose: closeHandler },
        React.createElement(DownloadProgress, { fileCount: fileCount, fileNum: fileNum, filename: filename, isFinished: isFinished, timeStart: timeStart }),
        warnings.length > 0 && React.createElement(Alert, { severity: 'warning' },
            warnings.length,
            ' ',
            "Datei(en) konnte(n) nicht bearbeitet werde"),
        error !== null ? React.createElement(Alert, { severity: 'error' }, error) : null));
}
