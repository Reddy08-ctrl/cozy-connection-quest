
// Database configuration
export const dbConfig = {
  // Using localStorage as the database since MySQL cannot run in the browser
  storageKey: 'cozy_connections_db'
};

// Image storage configuration
// For a production app, you would use a cloud storage service like AWS S3
// For simplicity, we'll use base64 encoding in localStorage for now
export const imageConfig = {
  maxSizeMB: 1, // Max image size in MB
  outputFormat: 'jpg',
  useDataUrl: true
};
