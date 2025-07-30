export {}

declare global {
  interface IMedia {
    _id: string
    filename: string
    originalname: string
    filePath: string
    fileType: string
    fileSize: number
    mimetype: string
    createdAt: string
  };
}
