export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export const validateUploadFile = (file: File): string | null => {
  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return "Unsupported file type. Please upload a PDF or DOCX.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File is too large. Maximum size is 50 MB.";
  }

  return null;
};
