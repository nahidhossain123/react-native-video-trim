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
  const frameFiles = files.filter(file => file.name.endsWith('.jpg'));
  console.log('Old frames deleted:', frameFiles,files);

  await Promise.all(frameFiles.map(file => safeDelete('file://'+file.path)));
  console.log('Old frames deleted:', frameFiles.length);
}

export const getSecToTime = (time:number)=>{
 let h = 0;
    let m = 0;
    let s = 0;
    h = Math.floor(time / 3600);
    m = Math.floor(time % 3600 / 60);
    s = Math.floor(time % 3600 % 60);
    return `${h}:${m}:${s}`
}

