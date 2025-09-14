import { View, Text, Image, useWindowDimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/type'
import RNFS, { stat } from 'react-native-fs';
import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import LottieView from 'lottie-react-native';
import { getSecToTime } from '../utils/functions';
type propsType = NativeStackScreenProps<RootStackParamList, 'Process'>
export default function ProcessScreen({ navigation, route }: propsType) {
    const { width: SCREEN_WIDTH } = useWindowDimensions()
    const [outputVideoPath, setOutputVideoPath] = useState('')
    const [progress, setProgress] = useState(0)
    const { startTime, endTime, url, thumbnail, duration, startTimeS } = route.params.processProps
    const startTrim = () => {
        let timeStamp = Date.now()
        let outPutName = `rn_video_trim_${timeStamp}.mp4`
        let totalDuration = getSecToTime(duration)
        let outputImagePath = `${RNFS.DownloadDirectoryPath}/${outPutName}`;
        setOutputVideoPath(outputImagePath)

        FFmpegKitConfig.enableStatisticsCallback(statistics => {
            const currentTime = statistics.getTime(); // in ms
            const relativeTime = currentTime - startTimeS;
            const percent = Math.ceil(Math.min((relativeTime / duration) * 100, 100)); // clamp to 100%
            setProgress(percent)
            console.log(`Progress: ${percent.toFixed(2)}%`);
            // Optionally update state/UI here
        });

        const ffmpegCommand = `-y -i ${url} -ss ${startTime} -to ${endTime} -c:v copy -c:a copy ${outputImagePath}`;
        console.log("Cmd", ffmpegCommand)
        FFmpegKit.executeAsync(ffmpegCommand).then(async session => {
            const state = FFmpegKitConfig.sessionStateToString(
                await session.getState(),
            );
            const returnCode = await session.getReturnCode();
            const output = await session.getAllLogsAsString();
            const failStackTrace = await session.getFailStackTrace();
            const duration = await session.getDuration();

            console.log('📤 FFmpeg Logs:\n', output);
            console.log('📛 FFmpeg Error Stack:\n', failStackTrace);
            console.log('🔁 Return Code:', returnCode?.getValue());
            if (returnCode) {
                console.log('ReturnCode')
                navigation.navigate('Files', { filesProps: { url: outputImagePath, name: outPutName, thumbnail, duration: totalDuration } })
                // successCallback(
                //   outputImagePath.replace('%4d', String(1).padStart(4, 0)),
                // );
            } else {

            }
        });
    };

    useEffect(() => {
        startTrim()
    }, [])

    return (
        <View>
            <View style={{}}>
                <LottieView style={{ width: '100%', height: 300 }} source={require('../asset/lottie-animations/Loading.json')} autoPlay loop />
                <Text style={{ textAlign: 'center' }}>Processing your files. Please wait...</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginHorizontal: 10, backgroundColor: '#ededed', padding: 5, borderRadius: 20 }}>
                <Image source={{ uri: thumbnail }} style={{ borderRadius: 20 }} alt='image' width={150} height={150} />
                <Text style={{ textAlign: 'center', fontSize: 50 }}>{progress}%</Text>
            </View>
        </View>
    )
}