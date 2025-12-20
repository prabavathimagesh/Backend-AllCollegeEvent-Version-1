import s3 from "../config/s3";

export const getSignedUrl = (key: string) => {
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Expires: 60 * 60, // 1 hour
  });
};
