import React, { useState } from 'react';
import * as sessionStorageService from '../services/firebaseStorageService';
import { validateUploadFile } from '../services/fileValidation';
import { StudySession } from '../types';

export function useFileUpload(
  userId: string | null,
  customPrompt: string | undefined,
  onSuccess: (session: StudySession) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFileName, setProcessingFileName] = useState<string>('');
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    const fileError = validateUploadFile(file);
    if (fileError) {
      alert(fileError);
      event.target.value = '';
      return;
    }

    setIsProcessing(true);
    setProcessingFileName(file.name);
    setOverlayVisible(true);
    setProcessingComplete(false);
    setProcessingError(null);

    const process = async () => {
      try {
        const newSession = await sessionStorageService.processAndCreateSession(
          file,
          userId,
          customPrompt
        );
        onSuccess(newSession);
        setProcessingComplete(true);
      } catch (error: any) {
        console.error('Error processing file:', error);
        const errorMessage = error?.message || 'Unknown error occurred';
        const userMessage = errorMessage.includes('API key')
          ? 'API configuration error. Please contact support.'
          : errorMessage.includes('quota')
          ? 'API quota exceeded. Please try again later.'
          : errorMessage.includes('size')
          ? 'File is too large. Please use a file under 50MB.'
          : `Failed to process file: ${errorMessage}`;
        setProcessingError(userMessage);
      } finally {
        setIsProcessing(false);
        event.target.value = '';
      }
    };

    // Hold a Web Lock for the duration of processing so the browser does not
    // throttle or suspend this tab when it moves to the background.
    // Chrome/Edge intensively throttle background tabs after ~5 minutes, which
    // drops the long-running Gemini callable connection.
    if ('locks' in navigator) {
      await navigator.locks.request('gemdi-file-upload', { mode: 'exclusive' }, process);
    } else {
      await process();
    }
  };

  /** Dismiss overlay after completion or error */
  const handleOverlayDismiss = () => {
    setOverlayVisible(false);
    setProcessingComplete(false);
    setProcessingError(null);
    setProcessingFileName('');
  };

  /** Cancel/hide overlay while still processing */
  const handleOverlayCancel = () => {
    setOverlayVisible(false);
    setProcessingFileName('');
  };

  return {
    isProcessing,
    processingFileName,
    processingComplete,
    processingError,
    overlayVisible,
    handleFileUpload,
    handleOverlayDismiss,
    handleOverlayCancel,
  };
}
