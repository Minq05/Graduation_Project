// export type MediaType = 'image' | 'video' | 'document' | 'audio' | 'other';

// export interface MediaItem {
//   id: string;
//   name: string;
//   type: MediaType;
//   url: string;
//   thumbnailUrl: string;
//   size: number;
//   dimensions?: {
//     width: number;
//     height: number;
//   };
//   dateCreated: Date;
//   dateModified: Date;
//   author?: string;
//   description?: string;
//   fileExtension: string;
//   tags?: string[];
// }

// export interface MediaFilter {
//   search: string;
//   type: MediaType | 'all';
//   dateRange: [Date | null, Date | null] | null;
//   sortBy: 'name' | 'date' | 'size';
//   sortDirection: 'asc' | 'desc';
// }

// // Helper to generate random file sizes between 1KB and 10MB
// const getRandomSize = () => Math.floor(Math.random() * 10 * 1024 * 1024) + 1024;

// // Helper to generate random dates within the last year
// const getRandomDate = () => {
//   const date = new Date();
//   date.setDate(date.getDate() - Math.floor(Math.random() * 365));
//   return date;
// };

// // Generate 30 mock media items
// export const mockMediaItems: MediaItem[] = Array.from({ length: 30 }, (_, i) => {
//   const id = `media-${i + 1}`;
//   const types: MediaType[] = ['image', 'video', 'document', 'audio', 'other'];
//   const type = types[Math.floor(Math.random() * types.length)];

//   // File extensions based on type
//   const extensionMap: Record<MediaType, string[]> = {
//     'image': ['jpg', 'png', 'gif', 'webp'],
//     'video': ['mp4', 'webm', 'mov'],
//     'document': ['pdf', 'docx', 'xlsx', 'pptx'],
//     'audio': ['mp3', 'wav', 'ogg'],
//     'other': ['zip', 'rar', 'txt']
//   };

//   const extension = extensionMap[type][Math.floor(Math.random() * extensionMap[type].length)];
//   const name = `sample-file-${i + 1}.${extension}`;

//   // Generate a plausible width and height for images and videos
//   const dimensions = type === 'image' || type === 'video'
//     ? {
//         width: Math.floor(Math.random() * 1900) + 100,
//         height: Math.floor(Math.random() * 1200) + 100
//       }
//     : undefined;

//   // Date created is earlier than date modified
//   const dateCreated = getRandomDate();
//   const dateModified = new Date(dateCreated);
//   dateModified.setDate(dateModified.getDate() + Math.floor(Math.random() * 30));

//   // Generate a thumbnail URL based on type
//   let thumbnailUrl = '';
//   if (type === 'image') {
//     const imageId = Math.floor(Math.random() * 1000) + 100;
//     thumbnailUrl = `https://picsum.photos/id/${imageId}/300/200`;
//   } else if (type === 'video') {
//     thumbnailUrl = 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=300';
//   } else if (type === 'document') {
//     thumbnailUrl = 'https://images.pexels.com/photos/4792282/pexels-photo-4792282.jpeg?auto=compress&cs=tinysrgb&w=300';
//   } else if (type === 'audio') {
//     thumbnailUrl = 'https://images.pexels.com/photos/2261041/pexels-photo-2261041.jpeg?auto=compress&cs=tinysrgb&w=300';
//   } else {
//     thumbnailUrl = 'https://images.pexels.com/photos/2228580/pexels-photo-2228580.jpeg?auto=compress&cs=tinysrgb&w=300';
//   }

//   // Tags for some items
//   const tags = Math.random() > 0.5 ? ['sample', 'demo', type] : undefined;

//   // Authors for some items
//   const authors = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Williams'];
//   const author = Math.random() > 0.3 ? authors[Math.floor(Math.random() * authors.length)] : undefined;

//   return {
//     id,
//     name,
//     type,
//     url: `https://example.com/files/${id}/${name}`,
//     thumbnailUrl,
//     size: getRandomSize(),
//     dimensions,
//     dateCreated,
//     dateModified,
//     author,
//     description: Math.random() > 0.7 ? `Description for ${name}` : undefined,
//     fileExtension: extension,
//     tags
//   };
// });


type Media = {
  filename?: string;
  originalname?: string;
  filePath?: string;
  fileType?: string;
  fileSize?: number;
  mimetype?: string;
};

export const fakeMediaData: Media[] = [
  {
    filename: 'sunset-beach.jpg',
    originalname: 'sunset-beach-original.jpg',
    filePath: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    fileType: 'image',
    fileSize: 2048000, // ~2MB
    mimetype: 'image/jpeg',
  },
  {
    filename: 'mountain-lake.jpg',
    originalname: 'mountain-lake-original.jpg',
    filePath: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    fileType: 'image',
    fileSize: 1540000, // ~1.5MB
    mimetype: 'image/jpeg',
  },
  {
    filename: 'forest-road.jpg',
    originalname: 'forest-road-original.jpg',
    filePath: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    fileType: 'image',
    fileSize: 1300000,
    mimetype: 'image/jpeg',
  },
  {
    filename: 'city-night.jpg',
    originalname: 'city-night-original.jpg',
    filePath: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
    fileType: 'image',
    fileSize: 2400000,
    mimetype: 'image/jpeg',
  },
  {
    filename: 'cat-cute.jpg',
    originalname: 'cat-cute-original.jpg',
    filePath: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
    fileType: 'image',
    fileSize: 980000,
    mimetype: 'image/jpeg',
  },
  {
    filename: 'dog-playing.jpg',
    originalname: 'dog-playing-original.jpg',
    filePath: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
    fileType: 'image',
    fileSize: 1100000,
    mimetype: 'image/jpeg',
  },
  {
    filename: 'ocean-waves.mp4',
    originalname: 'ocean-waves-original.mp4',
    filePath: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
    fileType: 'video',
    fileSize: 5000000, // ~5MB
    mimetype: 'video/mp4',
  },
  {
    filename: 'nature-sounds.mp3',
    originalname: 'nature-sounds-original.mp3',
    filePath: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
    fileType: 'audio',
    fileSize: 3000000, // ~3MB
    mimetype: 'audio/mpeg',
  },
  {
    filename: 'document.pdf',
    originalname: 'document-original.pdf',
    filePath: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63',
    fileType: 'document',
    fileSize: 1500000, // ~1.5MB
    mimetype: 'application/pdf',
  },
];
