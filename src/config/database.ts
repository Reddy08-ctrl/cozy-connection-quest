
// Database configuration
export const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Vtu@20253',
  database: 'cozy_connections',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Image storage configuration
// For a production app, you would use a cloud storage service like AWS S3
// For simplicity, we'll use base64 encoding in the database for now
export const imageConfig = {
  maxSizeMB: 1, // Max image size in MB
  outputFormat: 'jpg',
  useDataUrl: true
};
