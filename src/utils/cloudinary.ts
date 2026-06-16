export const getCloudinaryTransformations = () => {
  return "w_600,h_600,c_fill,g_face,q_auto,f_auto";
};

export const getCloudinaryUrl = (publicId: string) => {
  // simple helper if not using next-cloudinary's CldImage
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${getCloudinaryTransformations()}/${publicId}`;
};
