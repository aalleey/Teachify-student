const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} folder - Cloudinary folder path
 * @param {Object} options - Additional Cloudinary options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: options.resource_type || 'auto', // Automatically detect resource type (image, pdf, etc.)
        ...options
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Convert buffer to stream (Readable.from is available in Node 12+)
    // For older Node versions, fall back to manual stream creation
    let stream;
    if (typeof Readable.from === 'function') {
      stream = Readable.from(fileBuffer);
    } else {
      // Fallback for older Node versions
      const { Readable: ReadableClass } = require('stream');
      stream = new ReadableClass();
      stream.push(fileBuffer);
      stream.push(null); // Signal end of stream
    }
    stream.pipe(uploadStream);
  });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - Resource type ('image', 'raw', 'video', 'auto')
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String|null} Public ID or null
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}
  const match = url.match(/\/upload\/v\d+\/(.+)\./);
  if (match) {
    return match[1];
  }
  
  // Try to extract from simpler format
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  const publicId = fileName.split('.')[0];
  
  return publicId || null;
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  cloudinary
};

