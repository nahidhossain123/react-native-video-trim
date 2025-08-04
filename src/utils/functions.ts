import { FFmpegKit } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';

export async function extractFrame(videoPath: string, time: number, index: number): Promise<string> {
  const outputPath = `${RNFS.CachesDirectoryPath}/frame_${index}.jpg`;

  const command = `-ss ${time} -i "${videoPath}" -frames:v 1 "${outputPath}"`;
  await FFmpegKit.execute(command);

  return 'file://' + outputPath;
}

async function safeDelete(path: string) {
  const exists = await RNFS.exists(path);
  if (exists) {
    try {
      await RNFS.unlink(path);
      console.log(`Deleted: ${path}`);
    } catch (e) {
      console.warn(`Failed to delete: ${path}`, e);
    }
  } else {
    console.log(`Path not found: ${path}`);
  }
}

export async function cleanupAllOldFrames() {
  const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
  const frameFiles = files.filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.mp4'));
  console.log('Old frames deleted:', frameFiles,files);

  await Promise.all(frameFiles.map(file => safeDelete('file://'+file.path)));
  console.log('Old frames deleted:', frameFiles.length);
}

