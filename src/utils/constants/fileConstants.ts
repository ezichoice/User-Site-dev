export const FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB in bytes

export const IMAGE_SUPPORTED_FORMATS = [
  "image/jpg", 
  "image/jpeg", 
  "image/png", 
  "image/gif",
];

export const GENERAL_SUPPORTED_FORMATS = [
  ...IMAGE_SUPPORTED_FORMATS, 
  "application/pdf", 
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
  "text/plain",
];