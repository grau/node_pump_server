/**
 * @file React component
 */

import * as React from 'react';
import delay from 'delay';
import {useState, useMemo, useEffect, useCallback} from 'react';

import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import {green, red} from '@mui/material/colors';

import {ZipTransformer} from './lib/zipTransformer';
import {FileSource} from './lib/fileSource';
import {DownloadProgress} from './downloadProgress';
import {ModalBase} from './modalBase';

import type {IModalButton} from './modalBase';
import type {IFileInput} from './lib/fileSource';

/**
 * Properties for the delete modal dialog
 */
export interface IProps {
    /** Stream to write to */
    writeStream: WritableStream<Uint8Array>;
    /** Callback when modal closes */
    onClose: () => void;
    /** Download controller instance  */
    files: IFileInput[];
    /** Download title */
    title: string;
}

/**
 * Modal dialog show progress while downloading.
 *
 * @param props React properties
 * @returns React component
 */
export function ZipStream(props: IProps): JSX.Element {
    const {onClose, writeStream, files, title} = props;
    const [ fileCount, setFileCount ] = useState<number>(1);
    const [ fileNum, setFileNum ] = useState<number>(0);
    const [ filename, setFilename ] = useState<string>('');
    const [ isFinished, setIsFinished ] = useState<boolean>(false);
    const timeStart = useMemo(() => Date.now(), []);
    const downloadController = useMemo(() => new FileSource(files), [files]);
    const [ error, setError ] = useState<null | string>(null);
    const [ warnings, setWarnings ] = useState<string[]>([]);

    const handleError = useCallback((err: unknown) => {
        downloadController.abort();
        console.warn('handleError, Failed to write data stream', {err, filename});
        setError('Fehler beim verarbeiten der Datei ' + downloadController.getFilename() + ': "'
            + (err as Error).message + '"');
        setIsFinished(true);
    }, [filename, downloadController]);

    useEffect(() => {
        delay(100).then(() => {
            try {
                downloadController.onChange = (): void => {
                    setFileCount(downloadController.getFileCount());
                    setFileNum(downloadController.getPosition());
                    setFilename(downloadController.getFilename());
                };
                downloadController.onFinish = (): void => {
                    setIsFinished(true);
                };
                downloadController.onError = (err): void => {
                    handleError(err as Error);
                };
                downloadController.onWarn = (): void => {
                    setWarnings(
                        (oldWarnings) => [downloadController.getFilename(), ...oldWarnings]);
                };
                new ReadableStream(downloadController)
                    .pipeThrough(new TransformStream(new ZipTransformer()))
                    .pipeTo(writeStream)
                    .catch((err) => {
                        handleError(err);
                    });
            } catch (err: unknown) {
                handleError(err);
            }
        }).catch((err) => {
            handleError(err);
        });
    }, [downloadController, handleError, writeStream]);

    const closeHandler = (): void => {
        downloadController?.abort();
        onClose();
    };

    const buttonDefs: IModalButton[] = [{
        title: isFinished ? 'Schliessen' : 'Abbrechen',
        icon: isFinished ? <CheckIcon /> : <CloseIcon />,
        color: isFinished ? green[500] : red[500],
    }];
    return (<ModalBase
        title={title}
        buttonDefs={buttonDefs}
        onClose={closeHandler} >
        <DownloadProgress
            fileCount={fileCount}
            fileNum={fileNum}
            filename={filename}
            isFinished={isFinished}
            timeStart={timeStart} />
        {warnings.length > 0 && <Alert severity='warning'>
            {warnings.length}
            {' '}
            Datei(en) konnte(n) nicht bearbeitet werde
        </Alert>}
        {error !== null ? <Alert severity='error'>
            {error}
        </Alert> : null}
    </ModalBase>);
}
