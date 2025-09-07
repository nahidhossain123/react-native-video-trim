import { View, Text, Dimensions, StyleSheet, Image } from 'react-native'
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Video from 'react-native-video';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const VideoPlayer = forwardRef(({ selectedVideo, onVideoLoad, dragY, }, ref) => {
    const snapHeight = SCREEN_HEIGHT / 1.5;
    const [isPaused, setIsPaused] = useState(true)
    const videoRef = useRef()
    const offsetY = useSharedValue(0); // persist position after each drag
    const [minimized, setMinimized] = useState(false);

    useImperativeHandle(ref, () => ({
        toggleVideoSize,
        onSeek,
    }));

    const onSeek = (time: number) => {
        setIsPaused(true)
        videoRef?.current?.seek(time)
    }

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            // dragY = current drag offset + past offset
            console.log('translationY', e.translationY)
            const totalDrag = offsetY.value + e.translationY;
            dragY.value = Math.min(0, Math.max(totalDrag, -snapHeight));
        })
        .onEnd(() => {
            // Snap on release only
            if (dragY.value < -snapHeight / 1.5) {
                dragY.value = withTiming(-snapHeight, { duration: 200 });
                offsetY.value = -snapHeight;
                runOnJS(setIsPaused)(true);
            } else {
                dragY.value = withTiming(0, { duration: 200 });
                offsetY.value = 0;
                runOnJS(setIsPaused)(false);
            }
        });
    const videoStyle = useAnimatedStyle(() => {
        const height = interpolate(dragY.value, [0, -snapHeight], [SCREEN_HEIGHT - 70, SCREEN_HEIGHT / 1.5]);
        return {
            height,
            width: '100%'
        };
    });

    const buttonStyle = useAnimatedStyle(() => {
        const opacity = interpolate(dragY.value, [0, -snapHeight], [1, 0]);
        return { opacity };
    });

    const toggleVideoSize = () => {
        if (!minimized) {
            dragY.value = withTiming(-snapHeight, { duration: 500 });
            offsetY.value = -snapHeight;
            runOnJS(setIsPaused)(false);
        }
    };

    return (
        <Animated.View style={[styles.videoContainer, videoStyle]}>
            <GestureDetector gesture={panGesture}>
                {selectedVideo?.uri && (<Video
                    ref={videoRef}

                    paused={isPaused}
                    muted={true}
                    source={{
                        uri: selectedVideo.uri,
                    }} // Can be a URL or a local file.
                    // Store reference

                    resizeMode={'cover'}
                    repeat={true}
                    onLoad={() => {
                        if (onVideoLoad) {
                            onVideoLoad()
                        }
                    }}
                    style={{ width: '100%', height: '100%', flex: 1, borderRadius: 20, }}
                />)}
            </GestureDetector>
            <Animated.View style={[{ position: 'absolute', right: 10, top: 50, alignItems: 'flex-end', gap: 25 }, buttonStyle]}>
                <View style={styles.btnContainer}>
                    <Text onPress={toggleVideoSize} style={styles.textBtnStyle}>Edit</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/trim.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <Text style={styles.textBtnStyle}>Template</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/youtube.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <Text style={styles.textBtnStyle}>Text</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/font.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <Text style={styles.textBtnStyle}>Stickers</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/sticker.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <Text style={styles.textBtnStyle}>Effects</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/effects.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <Text style={styles.textBtnStyle}>Filters</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/filters.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <Text style={styles.textBtnStyle}>Voice</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/voice-search.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <Text style={styles.textBtnStyle}>Captions</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/caption.png')} />
                </View>
                <View style={styles.btnContainer}>
                    <Text style={styles.textBtnStyle}>Save</Text>
                    <Image style={{ width: 25, height: 25 }} source={require('../asset/icons/download.png')} />
                </View>
            </Animated.View>
        </Animated.View>
    )
})

export default VideoPlayer


const styles = StyleSheet.create({
    videoContainer: {
        backgroundColor: '#000',
    },
    btnContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
    textBtnStyle: { color: '#FFFFFF', fontWeight: 'bold' }

});
