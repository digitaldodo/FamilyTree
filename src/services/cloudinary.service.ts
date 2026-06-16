import cloudinary from '@/lib/cloudinary';

export class CloudinaryService {
  static async uploadImage(fileBuffer: Buffer, folder: string = 'family-tree'): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(fileBuffer);
    });
  }

  static generateSignature(folder: string = 'family-tree') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    return { timestamp, signature, folder };
  }

  static async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: true, result };
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      return { success: false, error };
    }
  }
}
