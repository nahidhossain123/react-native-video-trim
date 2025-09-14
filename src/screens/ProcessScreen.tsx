import { View, Text, Image, useWindowDimensions, Switch, Modal, Button, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/type'
import RNFS, { stat } from 'react-native-fs';
import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import LottieView from 'lottie-react-native';
import { byteToMB, getSecToTime } from '../utils/functions';
import CustomSwitch from '../component/ui/CustomSwitch';
import { activateKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ThemeButton from '../component/ui/ThemeButton';
import ThemeModal, { ThemeModalRef } from '../component/ui/ThemeModal';
type propsType = NativeStackScreenProps<RootStackParamList, 'Process'>
export default function ProcessScreen({ navigation, route }: propsType) {
    const { width: SCREEN_WIDTH } = useWindowDimensions()
    const [outputVideoPath, setOutputVideoPath] = useState('')
    const modalRef = useRef<ThemeModalRef>(null)
    const [progress, setProgress] = useState(0)

    const [isEnabled, setIsEnabled] = useState(false);
    const { startTime, endTime, url, thumbnail, duration, startTimeS, prevSize } = route.params.processProps

    const startTrim = () => {
        const [modalVisible, setModalVisible] = useState(false);
        let timeStamp = Date.now()
        let outPutName = `rn_video_trim_${timeStamp}.mp4`
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
        FFmpegKit.execute(ffmpegCommand).then(async session => {
            const state = FFmpegKitConfig.sessionStateToString(
                await session.getState(),
            );
            const returnCode = await session.getReturnCode();
            if (returnCode.isValueSuccess()) {
                const stats = await RNFS.stat(outputImagePath);
                const currentSize = byteToMB(stats.size)
                const trimDuration = getSecToTime(duration / 1000)
                console.log(`Trimmed video size: ${currentSize} MB`);
                navigation.replace('Files', { filesProps: { url: outputImagePath, name: outPutName, thumbnail, duration: trimDuration, prevSize, currentSize, } })
                // successCallback(
                //   outputImagePath.replace('%4d', String(1).padStart(4, 0)),
                // );
            } else {

            }
        });
    };

    useEffect(() => {
        activateKeepAwake();
        //startTrim()
    }, [])
    const toggleModal = () => {
        console.log('Toogle')
        modalRef.current?.toggle()
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <View style={{}}>
                    <LottieView style={{ width: '100%', height: 300 }} source={require('../asset/lottie-animations/Loading.json')} autoPlay loop />
                    <Text style={{ textAlign: 'center' }}>Processing your files. Please wait...</Text>
                </View>

                <View style={{ marginHorizontal: 10, marginTop: 20, }}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: "row", alignItems: 'center', gap: 5 }}>
                            <CustomSwitch active={true} inactiveBgColor='#ccccccff' activeBgColor='#7DC0C7' onToggle={(isActive) => {
                                if (isActive) {
                                    deactivateKeepAwake();
                                } else {
                                    activateKeepAwake();
                                }
                            }} />
                            <Text style={{}}>Keep Screen On</Text>
                        </View>
                        <Pressable onPress={toggleModal}>
                            <Image source={require('../asset/info.png')} style={{ height: 30, width: 30 }} alt='image' />
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, backgroundColor: '#ededed', paddingVertical: 5, paddingRight: 5, borderRadius: 20 }}>
                        <Image source={{ uri: thumbnail }} style={{ borderRadius: 20 }} alt='image' width={150} height={150} />
                        <Text style={{ textAlign: 'center', fontSize: 50 }}>{progress}%</Text>
                    </View>
                </View>
                <ThemeModal ref={modalRef}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Keep screen on</Text>
                        <Text style={{ marginVertical: 20 }}>To ensure fast video processing, keep the screen on.</Text>
                        <Text style={{}}>Video processing slows down significantly when the screen turns off.</Text>
                        <View style={{ flexDirection: 'row', justifyContent: "flex-end", marginVertical: 10 }}>
                            <Pressable onPress={toggleModal}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>OK</Text>
                            </Pressable>
                        </View>
                    </View>
                </ThemeModal>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}