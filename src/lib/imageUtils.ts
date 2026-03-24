/**
 * Converts a File object to a base64 string.
 * @param file The file to convert
 * @returns A promise that resolves to the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validates if a file is an image and within size limits.
 * @param file The file to validate
 * @param maxSizeInMB Maximum allowed size in MB
 * @returns { isValid: boolean; error?: string }
 */
export const validateImage = (file: File, maxSizeInMB: number = 2): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Please upload a valid image file (JPEG, PNG, WEBP, or GIF)' };
  }
  
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSizeInMB) {
    return { isValid: false, error: `Image size must be less than ${maxSizeInMB}MB` };
  }
  
  return { isValid: true };
};
