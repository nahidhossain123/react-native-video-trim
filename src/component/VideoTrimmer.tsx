import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
    Dimensions,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import RNFS, { stat } from 'react-native-fs';
import { FFmpegKit, ReturnCode, FFmpegKitConfig } from 'ffmpeg-kit-react-native';
import Animated, {
    runOnJS,
    SharedValue,
    useAnimatedGestureHandler,
    useAnimatedProps,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withDecay,
    withTiming,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
    PanGestureHandler,
} from 'react-native-gesture-handler';

import Swipeable from 'react-native-gesture-handler/Swipeable';
const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
const END_POSITION = 200;
export const FRAME_PER_SEC = 1;
export const FRAME_WIDTH = 30;

const FRAME_STATUS = Object.freeze({
    LOADING: { name: Symbol('LOADING') },
    READY: { name: Symbol('READY') },
});

const VideoTrimmer = ({ video, navigation }) => {
    console.log('Route', video)
    const isDarkMode = useColorScheme() === 'dark';
    const [selectedVideo, setSelectedVideo] = useState(video.video);
    const [handlePosition, setHandlePosition] = useState(0)
    const [isPaused, setIsPaused] = useState(false);
    const [frames, setFrames] = useState([]);
    const position = useSharedValue(0);
    const position2 = useSharedValue(0);
    const tempPosition = useSharedValue(0);
    const tempPosition2 = useSharedValue(0);
    const sliderwidth = useSharedValue(1000);
    const [outputVideoPath, setOutputVideoPath] = useState('');
    const leftThumb = useSharedValue(0);
    const timelineThumb = useSharedValue(0);
    const trimStart = useSharedValue(0);
    const trimEnd = useSharedValue(0)
    const rightThumb = useSharedValue(0)
    const videoRef = useRef()
    const [progress, setProgress] = useState(null);
    const seekableValue = useSharedValue(0)



    const getFrames = (
        localFileName,
        videoURI,
        frameNumber,
        successCallback,
        errorCallback,
    ) => {
        let outputImagePath = `${RNFS.CachesDirectoryPath}/${localFileName}_%4d.png`;
        // const ffmpegCommand = `-ss 0 -i ${videoURI} -vf "fps=${FRAME_PER_SEC}/10:round=up,scale=${FRAME_WIDTH}:-2" -vframes ${frameNumber} ${outputImagePath}`;
        const ffmpegCommand = `-ss 0 -i ${videoURI} -vf "fps=${FRAME_PER_SEC}/5" ${outputImagePath}`;

        FFmpegKit.executeAsync(
            ffmpegCommand,
            async session => {
                const state = FFmpegKitConfig.sessionStateToString(
                    await session.getState(),
                );
                const returnCode = await session.getReturnCode();
                const failStackTrace = await session.getFailStackTrace();
                const duration = await session.getDuration();

                if (ReturnCode.isSuccess(returnCode)) {
                    console.log(
                        `Encode completed successfully in ${duration} milliseconds;.`,
                    );
                    console.log(`Check at ${outputImagePath}`);
                    successCallback(outputImagePath);
                } else {
                    console.log('Encode failed. Please check log for the details.');
                    console.log(
                        `Encode failed with state ${state} and rc ${returnCode}.${(failStackTrace, '\\n')
                        }`,
                    );
                    errorCallback();
                }
            },
            log => {
                console.log(log.getMessage());
            },
            statistics => {
                console.log(statistics);
            },
        ).then(async session => {
            const state = FFmpegKitConfig.sessionStateToString(
                await session.getState(),
            );
            console.log('Session', await session.getDuration());
            const returnCode = await session.getReturnCode();
            const failStackTrace = await session.getFailStackTrace();
            const duration = await session.getDuration();

            if (ReturnCode.isSuccess(returnCode)) {
                console.log(
                    `Encode completed successfully in ${duration} milliseconds;.`,
                );
                console.log(`Check at ${outputImagePath}`);
                successCallback(outputImagePath);
            } else {
                console.log('Encode failed. Please check log for the details.');
                console.log(
                    `Encode failed with state ${state} and rc ${returnCode}.${(failStackTrace, '\\n')
                    }`,
                );
                errorCallback();
            }
            // console.log(
            //   `Async FFmpeg process started with sessionId ${JSON.stringify(
            //     session,
            //   )}.`,
            // );
        });
    };

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const openVideoPicker = async () => {
        const result = await launchImageLibrary({
            mediaType: 'video',
            videoQuality: 'low',
            presentationStyle: 'formSheet',
            assetRepresentationMode: 'current',
        });
        console.log('ImageResult', result);
        // position2.value =
        //   result.assets[0].duration < 20 ? result.assets[0].duration * 20 : 200;
        //   tempPosition2.value = result.assets[0].duration < 20 ? result.assets[0].duration * 20 : 200;
        //sliderwidth.value =

        //   result.assets[0].duration < 20 ? result.assets[0].duration * 20 : 200;
        setSelectedVideo(result.assets[0]);
    };

    const handleVideoLoad = () => {
        //setIsPaused(true)
        //videoRef?.current?.seek(11)
        console.log('=====================', videoRef?.current)
        const numberOfFrames = Math.ceil((selectedVideo.duration) / 5);
        setFrames(
            Array(numberOfFrames).fill({
                status: FRAME_STATUS.LOADING.name.description,
            }),
        );

        getFrames(
            selectedVideo.fileName.split('.')[0],
            selectedVideo.uri,
            numberOfFrames,
            filePath => {
                const _frames = [];
                for (let i = 0; i < numberOfFrames; i++) {
                    _frames.push(
                        `${filePath.replace('%4d', String(i + 1).padStart(4, 0))}`,
                    );
                }
                setFrames(_frames);
            },
        );
    };

    console.log('FramesList', frames);

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startX = leftThumb.value;
            console.log('StartValue', ctx.startX)
        },
        onActive: (e, ctx) => {

            // if (
            //   e.translationX >= 0 &&
            //   e.translationX <= selectedVideo.duration * 20
            // ) {
            //   sliderwidth.value = position2.value - position.value;
            //   position.value = ctx.startX + e.translationX;
            // }
            // leftThumb.value = ctx.startX + e.translationX;
            // sliderwidth.value = rightThumb.value - leftThumb.value;
            leftThumb.value = Math.max(0, Math.min(e.translationX + ctx.startX, 360));
            timelineThumb.value = 20
            // console.log("SLiderVal", e.translationX, ctx)
            // if (ctx.startX + e.translationX < 0) {
            //     leftThumb.value = 0;
            // } else if (ctx.startX + e.translationX > rightThumb.value) {
            //     leftThumb.value = rightThumb.value;
            //     sliderwidth.value = rightThumb.value - leftThumb.value;
            // } else {
            //     leftThumb.value = ctx.startX + e.translationX;
            //     sliderwidth.value = rightThumb.value - leftThumb.value;
            // }
            console.log('leftThumb', ctx)
        },
        onEnd: () => {
            tempPosition.value = position.value;
            // runOnJS(onValueChange)({
            //   min:
            //     min +
            //     Math.floor(position.value / (sliderWidth / ((max - min) / step))) *
            //       step,
            //   max:
            //     min +
            //     Math.floor(position2.value / (sliderWidth / ((max - min) / step))) *
            //       step,
            // });
        },
    });
    const gestureTimelineHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startX = timelineThumb.value;
            console.log('StartValue', ctx.startX)
        },
        onActive: (e, ctx) => {
            timelineThumb.value = Math.max(20, Math.min(e.translationX + ctx.startX, 340));
            console.log('leftThumb', ctx)
        },
        onEnd: () => {
            tempPosition.value = position.value;
            // runOnJS(onValueChange)({
            //   min:
            //     min +
            //     Math.floor(position.value / (sliderWidth / ((max - min) / step))) *
            //       step,
            //   max:
            //     min +
            //     Math.floor(position2.value / (sliderWidth / ((max - min) / step))) *
            //       step,
            // });
        },
    });
    const gestureHandler2 = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startX = rightThumb.value;
        },
        onActive: (e, ctx) => {
            console.log('e.translationX', e.translationX)
            // if (
            //   e.translationX >= 0 &&
            //   e.translationX <= selectedVideo.duration * 20
            // ) {
            //   sliderwidth.value = position2.value - position.value;
            //   position2.value = ctx.startX + e.translationX;
            // }
            // rightThumb.value = ctx.startX + e.translationX;
            //   sliderwidth.value = rightThumb.value - leftThumb.value;
            rightThumb.value = Math.min(0, e.translationX + ctx.startX);
            // if (ctx.startX + e.translationX > selectedVideo.duration * 20) {
            //     rightThumb.value = selectedVideo.duration * 20;

            // } else if (ctx.startX + e.translationX < leftThumb.value) {
            //     rightThumb.value = leftThumb.value;
            //     sliderwidth.value = rightThumb.value - leftThumb.value;

            // } else {
            //     rightThumb.value = ctx.startX + e.translationX;
            //     sliderwidth.value = rightThumb.value - leftThumb.value;

            // }
        },
        onEnd: () => {
            tempPosition2.value = position2.value
            // runOnJS(onValueChange)({
            //   min:
            //     min +
            //     Math.floor(position.value / (sliderWidth / ((max - min) / step))) *
            //       step,
            //   max:
            //     min +
            //     Math.floor(position2.value / (sliderWidth / ((max - min) / step))) *
            //       step,
            // });
        },
    });

    console.log('FramesList', frames, sliderwidth);

    const animatedStyle = useAnimatedStyle(() => ({
        left: leftThumb.value,
    }));
    const animatedTimelineThumbStyle = useAnimatedStyle(() => ({
        left: timelineThumb.value,
    }));

    const animatedStyle2 = useAnimatedStyle(() => ({
        right: -rightThumb.value
    }));
    const sliderwidthAnim = useAnimatedStyle(() => ({
        width: sliderwidth.value,
        transform: [{ translateX: leftThumb.value }],
    }));
    const seekAbleStyle = useAnimatedStyle(() => ({

        transform: [{ translateX: seekableValue.value }],
    }));

    const format = seconds => {
        let mins = parseInt(seconds / 60)
            .toString()
            .padStart(2, '0');
        let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const seekVal = (time) => {
        setIsPaused(true)
        let t = 0 + Math.floor(time / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
        console.log('Time', t)
        videoRef?.current?.seek(t)
    }

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            position.value = event.contentOffset.x;
            position2.value = event.contentOffset.x;

            runOnJS(seekVal)(position.value)
            // tempPosition.value = position.value-event.contentOffset.x;
            // tempPosition2.value = position2.value-event.contentOffset.x;
            //setHandlePosition({pos1:leftPos,pos2:rightPos})
            //runOnJS(setHandlePosition)({pos1:leftPos,pos2:rightPos});
            console.log('Onscroll', event.contentOffset.x);
        },
    });
    Animated.addWhitelistedNativeProps({ text: true });
    const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
    const minLabelText = useAnimatedProps(() => {
        // return {
        //   text: `00.${Math.floor(leftThumb.value +position.value)}`,
        // };
        runOnJS(seekVal)(position.value + leftThumb.value)
        let time = 0 + Math.floor((position.value + leftThumb.value) / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
        let h = 0;
        let m = 0;
        let s = 0;
        h = Math.floor(time / 3600);
        m = Math.floor(time % 3600 / 60);
        s = Math.floor(time % 3600 % 60);
        return {
            text: `${h}:${m}:${s}`,
        };

    });
    const maxLabelText = useAnimatedProps(() => {
        // return {
        //   text: `00.${Math.floor(rightThumb.value / 20)}`,
        // };
        runOnJS(seekVal)(position.value + rightThumb.value)
        let time = 0 + Math.floor((position2.value + rightThumb.value) / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
        let h = 0;
        let m = 0;
        let s = 0;
        h = Math.floor(time / 3600);
        m = Math.floor(time % 3600 / 60);
        s = Math.floor(time % 3600 % 60);

        return {
            text: `${h}:${m}:${s}`,
        };
    });

    const getTrimTime = (val) => {
        console.log("Secornds", val)
        let time = 0 + Math.floor((val) / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
        let h = 0;
        let m = 0;
        let s = 0;
        h = Math.floor(time / 3600);
        m = Math.floor(time % 3600 / 60);
        s = Math.floor(time % 3600 % 60);
        return `${h}:${m}:${s}`;
    }

    const startTrim = () => {
        let outputImagePath = `${RNFS.DownloadDirectoryPath}/rn_video_trim_1.mp4`;
        setOutputVideoPath(outputImagePath)
        const ffmpegCommand = `-y -i ${selectedVideo.uri} -ss ${getTrimTime((position.value + leftThumb.value))} -to ${getTrimTime((position2.value + rightThumb.value))} -c:v copy -c:a copy ${outputImagePath}`;
        console.log("Cmd", ffmpegCommand)
        FFmpegKit.executeAsync(ffmpegCommand).then(async session => {
            const state = FFmpegKitConfig.sessionStateToString(
                await session.getState(),
            );
            const returnCode = await session.getReturnCode();
            const failStackTrace = await session.getFailStackTrace();
            const duration = await session.getDuration();
            if (ReturnCode.isSuccess(returnCode)) {
                successCallback(
                    outputImagePath.replace('%4d', String(1).padStart(4, 0)),
                );
            } else {
                console.log(
                    `Encode failed with state ${state} and rc ${returnCode}.${(failStackTrace, '\\n')
                    }`,
                );

            }
        });
    };

    const findDimention = (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        console.log('=======Width======', width)
    }
    return (
        <GestureHandlerRootView style={{ flex: 1, borderColor: 'red', borderWidth: 2 }}>
            <SafeAreaView style={[backgroundStyle, styles.container]}>
                {selectedVideo?.uri && (<Video
                    ref={videoRef}
                    onProgress={x => {
                        let duration = x.currentTime * 20

                        let time = (0 + Math.floor(duration / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1)

                        seekableValue.value = time
                    }}
                    paused={isPaused}
                    muted={true}
                    source={{
                        uri: selectedVideo.uri,
                    }} // Can be a URL or a local file.
                    // Store reference
                    resizeMode={'cover'}
                    repeat={true}
                    onLoad={handleVideoLoad}
                    style={{ width: '100%', height: 300, borderRadius: 20, }}
                />)}
                <View>

                    <Animated.View
                        style={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexDirection: 'row',
                        }}>
                        <AnimatedTextInput
                            style={{ color: '#FFFFFF' }}
                            animatedProps={minLabelText}
                            editable={false}
                            defaultValue={'00.00.00'}
                        />
                        <AnimatedTextInput
                            style={{ color: '#FFFFFF' }}
                            animatedProps={minLabelText}
                            editable={false}
                            defaultValue={'00.00.00'}
                        />
                        <AnimatedTextInput
                            style={{ color: '#FFFFFF' }}
                            animatedProps={maxLabelText}
                            editable={false}
                            defaultValue={'00.00.00'}
                        />
                    </Animated.View>
                    <View style={{ marginBottom: 30 }} onLayout={findDimention}>
                        {selectedVideo && (
                            <View style={{ width: '100%', height: 50, position: 'relative' }}>
                                <Animated.ScrollView
                                    showsHorizontalScrollIndicator={false}
                                    horizontal={true}
                                    onTouchStart={() => setIsPaused(true)}
                                    alwaysBounceHorizontal={true}
                                    scrollEventThrottle={1}
                                    onScroll={scrollHandler}
                                    style={{ marginLeft: 20, marginRight: 20 }}
                                >

                                    {frames?.map((item, index) => {
                                        return (
                                            <Image
                                                key={index}
                                                source={{
                                                    uri: 'file://' + item,
                                                }}
                                                style={{
                                                    width: SCREEN_WIDTH / 4,
                                                    height: 50,
                                                }}
                                            />
                                        );
                                    })}


                                </Animated.ScrollView>

                                <Animated.View style={[{ position: 'absolute', height: '100%', left: 0, right: 0, }, animatedStyle, animatedStyle2]}>
                                    <PanGestureHandler onGestureEvent={gestureHandler}>
                                        <Animated.View
                                            style={[
                                                {
                                                    width: 20,
                                                    height: 50,
                                                    backgroundColor: '#FFF',
                                                    borderBottomLeftRadius: 5,
                                                    borderTopLeftRadius: 5,
                                                    zIndex: 10,
                                                    left: 0,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                },
                                            ]}>
                                            <View style={{ width: 3, height: 20, backgroundColor: '#000', borderRadius: 10 }} />
                                        </Animated.View>
                                    </PanGestureHandler>
                                    <View style={{ position: 'absolute', height: '100%', left: 15, right: 15, borderColor: '#FFF', borderWidth: 4 }}>

                                    </View>
                                    <PanGestureHandler onGestureEvent={gestureTimelineHandler}>
                                        <Animated.View
                                            style={[
                                                animatedTimelineThumbStyle,
                                                {
                                                    backgroundColor: 'red',
                                                    width: 5,
                                                    height: '100%',
                                                    position: 'absolute',
                                                    borderRadius: 1,
                                                    top: 0,
                                                    left: 20,
                                                    zIndex: 99
                                                },
                                            ]}></Animated.View>
                                    </PanGestureHandler>
                                    <PanGestureHandler onGestureEvent={gestureHandler2}>
                                        <Animated.View
                                            style={[

                                                {
                                                    position: 'absolute',
                                                    width: 20,
                                                    height: 50,
                                                    backgroundColor: '#FFF',
                                                    borderTopRightRadius: 5,
                                                    borderBottomRightRadius: 5,
                                                    right: 0,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                },
                                            ]}>
                                            <View style={{ width: 3, height: 20, backgroundColor: '#000', borderRadius: 10 }} />
                                        </Animated.View>
                                    </PanGestureHandler>
                                </Animated.View>
                            </View>
                        )}
                    </View>
                    <View
                        style={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexDirection: 'row',
                            paddingHorizontal: 20,

                        }}>
                        <Text onPress={() => navigation.goBack()} style={{ color: '#FFFFFF' }}>Cancel</Text>
                        {isPaused ? (
                            <Pressable onPress={() => setIsPaused(false)}>
                                <Image
                                    source={require('../asset/play-button.png')}
                                    style={{ width: 30, height: 30 }}
                                />
                            </Pressable>
                        ) : (
                            <Pressable onPress={() => setIsPaused(true)}>
                                <Image
                                    source={require('../asset/pause.png')}
                                    style={{ width: 30, height: 30 }}
                                />
                            </Pressable>
                        )}

                        <Text style={{ color: '#FFFFFF' }} onPress={startTrim}>Save</Text>
                    </View>
                </View>
            </SafeAreaView>
        </GestureHandlerRootView >
    )
}

export default VideoTrimmer

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        marginTop: 32,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
    box: {
        height: 120,
        width: '100%',
        backgroundColor: '#b58df1',
        borderRadius: 20,
        marginBottom: 30,
    },
    rightAction: { width: 50, height: 50, backgroundColor: 'purple' },
    separator: {
        width: '100%',
        borderTopWidth: 1,
    },
    swipeable: {
        height: 50,
        backgroundColor: 'papayawhip',
        alignItems: 'center',
    },
});
