import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, Pressable, TextInput, GestureResponderEvent } from 'react-native';
import Video from 'react-native-video';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  runOnJS,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import RNFS, { stat } from 'react-native-fs';
import { GestureDetector, Gesture, GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import ThemeButton from '../component/ui/ThemeButton';
import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import { byteToMB, cleanupAllOldFrames, extractFrame, getSecToTime } from '../utils/functions';
import VideoPlayer, { ChildFunctionsRefType } from '../component/VideoPlayer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/type';

type ContextType = {
  startX: number;
};

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_COUNT = 5;

type propsType = NativeStackScreenProps<RootStackParamList, 'Video'>

export default function VideoEditorScreen({ navigation, route }: propsType) {
  const [isPlaying, setIsPlaying] = useState(true);
  const snapHeight = SCREEN_HEIGHT / 1.5;
  const dragY = useSharedValue(0);
  const offsetY = useSharedValue(0); // persist position after each drag
  const panelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(dragY.value, [0, -snapHeight], [0, 1]);
    return { opacity };
  });
  const buttonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(dragY.value, [0, -snapHeight], [1, 0]);
    return { opacity };
  });



  const [selectedVideo, setSelectedVideo] = useState(route.params.video);
  const [isPaused, setIsPaused] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const position = useSharedValue(0);
  const position2 = useSharedValue(0);
  const tempPosition = useSharedValue(0);
  const tempPosition2 = useSharedValue(0);
  const sliderwidth = useSharedValue(1000);
  const [outputVideoPath, setOutputVideoPath] = useState('');
  const leftThumb = useSharedValue(0);
  const timelineThumb = useSharedValue(0);
  const rightThumb = useSharedValue(0)
  const videoRef = useRef()
  const videoPlayerRef = useRef<ChildFunctionsRefType>(null)
  const seekableValue = useSharedValue(0)
  const [isEdit, setIsEdit] = useState(false)

  const leftTrimValueRef = useRef('0:0:0')
  const rightTrimValueRef = useRef(`${Math.floor(((route.params.video.duration || 0) / 3600))}:${Math.floor((route.params.video?.duration || 0) % 3600 / 60)}:${Math.floor((route.params.video.duration || 0) % 3600 % 60)}`)

  useEffect(() => {
    return () => {
      cleanupAllOldFrames()
    }
  }, [])


  const handleExtractFrame = () => {

    console.log('ONLoddfdf=================')

    const timestamps = [0.1, 0.3, 0.5, 0.7, 0.9].map(p => p * (selectedVideo.duration || 0));

    if (selectedVideo.uri) {
      let videoUri = selectedVideo.uri
      // Load middle frame first
      extractFrame(videoUri, timestamps[2], 2).then(uri => {
        setFrames(Array(FRAME_COUNT).fill(uri)); // fill all with middle frame

        // Load other frames progressively
        [0, 1, 3, 4].forEach(index => {
          extractFrame(videoUri, timestamps[index], index).then(newUri => {
            setFrames(prev => {
              const copy = [...prev];
              copy[index] = newUri;
              return copy;
            });
          });
        });
      });
    }
  };

  const seekVal = (time: number) => {
    if (videoPlayerRef?.current) {
      videoPlayerRef?.current?.onSeek(time)
    }
  }



  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, ContextType>({
    onStart: (_, ctx) => {
      ctx.startX = leftThumb.value;
    },
    onActive: (e, ctx) => {
      leftThumb.value = Math.max(0, Math.min(e.translationX + ctx.startX, (SCREEN_WIDTH - 60 - 48) + (rightThumb.value - 1)));
      timelineThumb.value = 20
    },
    onEnd: () => {
      tempPosition.value = position.value;
    },
  });
  const gestureTimelineHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, ContextType>({
    onStart: (_, ctx) => {
      ctx.startX = timelineThumb.value;
    },
    onActive: (e, ctx) => {
      timelineThumb.value = Math.max(30, Math.min(e.translationX + ctx.startX, 340));
      let time = Math.floor((timelineThumb.value / (SCREEN_WIDTH - 60 - 48)) * (selectedVideo.duration || 0))
      console.log('timelineThumb', time)
      runOnJS(seekVal)(time)
    },
    onEnd: () => {
      tempPosition.value = position.value;
    },
  });
  const gestureHandler2 = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, ContextType>({
    onStart: (_, ctx) => {
      ctx.startX = rightThumb.value;
    },
    onActive: (e, ctx) => {
      rightThumb.value = Math.min(0, Math.max(e.translationX + ctx.startX, -((SCREEN_WIDTH - 60 - 48) - (leftThumb.value + 1))))
    },
    onEnd: () => {
      tempPosition2.value = position2.value
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

  const format = (seconds: number) => {
    let mins = (seconds / 60)
      .toString()
      .padStart(2, '0');
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };


  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      position.value = event.contentOffset.x;
      position2.value = event.contentOffset.x;
      runOnJS(seekVal)(position.value)
    },
  });

  Animated.addWhitelistedNativeProps({ text: true });

  const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
  const minLabelText = useAnimatedProps(() => {
    let time = Math.floor((leftThumb.value / (SCREEN_WIDTH - 60 - 48)) * (selectedVideo.duration || 0))
    runOnJS(seekVal)(time)
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
    let time = Math.floor((((SCREEN_WIDTH - 60 - 48) + rightThumb.value) / (SCREEN_WIDTH - 60 - 48)) * (selectedVideo.duration || 0))
    runOnJS(seekVal)(time)
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

  const getStartTimeMS = () => {
    let time = Math.floor((leftThumb.value / (SCREEN_WIDTH - 60 - 48)) * (selectedVideo.duration || 0))
    return time;
  }

  const getEndTimeMS = () => {
    let time = Math.floor((((SCREEN_WIDTH - 60 - 48) + rightThumb.value) / (SCREEN_WIDTH - 60 - 48)) * (selectedVideo.duration || 0))
    return time
  }

  const getTrimStartTime = (time: number) => {
    // let time = 0 + Math.floor((val) / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
    let h = 0;
    let m = 0;
    let s = 0;
    h = Math.floor(time / 3600);
    m = Math.floor(time % 3600 / 60);
    s = Math.floor(time % 3600 % 60);
    rightTrimValueRef.current = `${h}:${m}:${s}`
    return `${h}:${m}:${s}`
  }
  const getTrimEndTime = (time: number) => {
    // let time = 0 + Math.floor((val) / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
    let h = 0;
    let m = 0;
    let s = 0;
    h = Math.floor(time / 3600);
    m = Math.floor(time % 3600 / 60);
    s = Math.floor(time % 3600 % 60);
    rightTrimValueRef.current = `${h}:${m}:${s}`
    return `${h}:${m}:${s}`

  }

  const handleTouch = (e: GestureResponderEvent) => {
    const { locationX } = e.nativeEvent;
    timelineThumb.value = locationX
  };

  const handleEdit = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.toggleVideoSize()
    }
  }

  console.log('Frames', selectedVideo)
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <VideoPlayer ref={videoPlayerRef} selectedVideo={selectedVideo} onVideoLoad={handleExtractFrame} dragY={dragY} />
        <Animated.View style={[{ paddingHorizontal: 20 }, panelStyle]}>
          <Animated.View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: "space-between"
            }}>
            <View style={{
              alignItems: 'center',
              flexDirection: 'row',
            }}>
              <AnimatedTextInput
                style={{ color: '#FFFFFF' }}
                animatedProps={minLabelText as any}
                editable={false}
                defaultValue={leftTrimValueRef.current}
              />
              <Text style={{ color: '#FFFFFF' }}>/</Text>
              <AnimatedTextInput
                style={{ color: '#FFFFFF' }}
                animatedProps={maxLabelText as any}
                editable={false}
                defaultValue={rightTrimValueRef.current}
              />
            </View>
            <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              {isPaused ? (
                <Pressable onPress={() => setIsPaused(false)}>
                  <Image
                    source={require('../asset/play.png')}
                    style={{ width: 20, height: 20 }}
                  />
                </Pressable>
              ) : (
                <Pressable onPress={() => setIsPaused(true)}>
                  <Image
                    source={require('../asset/pause.png')}
                    style={{ width: 20, height: 20 }}
                  />
                </Pressable>
              )}
            </View>
            <Text
              style={{ color: '#FFFFFF' }}
            >{rightTrimValueRef.current}</Text>
          </Animated.View>
          <View style={{ marginBottom: 30 }}>
            {selectedVideo && (
              <View style={{ width: '100%', height: 80, position: 'relative' }}>
                <Animated.ScrollView
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                  onTouchStart={() => setIsPaused(true)}
                  alwaysBounceHorizontal={true}
                  scrollEventThrottle={1}
                  onScroll={scrollHandler}
                  style={{ marginLeft: 30, marginRight: 30, }}
                >

                  {frames?.map((item, index) => {
                    return (
                      <Image
                        key={index}
                        source={{
                          uri: `file://${item}?bust=${Date.now()}`,
                        }}
                        style={{
                          width: SCREEN_WIDTH / 5,
                          height: 80,
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
                          width: 30,
                          height: 80,
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
                  <View onTouchStart={handleTouch} style={{ position: 'absolute', height: '100%', left: 15, right: 15, borderColor: '#FFF', borderWidth: 4 }}>

                  </View>
                  <PanGestureHandler onGestureEvent={gestureTimelineHandler}>
                    <Animated.View

                      style={[
                        animatedTimelineThumbStyle,
                        {

                          width: 20,
                          height: '100%',
                          position: 'absolute',
                          borderRadius: 1,
                          top: 0,
                          left: 20,
                          zIndex: 99,
                          justifyContent: 'center',
                          alignItems: 'center'
                        },
                      ]}
                    >
                      <View
                        style={[

                          {
                            backgroundColor: '#FFF',
                            width: 2,
                            height: '100%',
                            borderRadius: 1,
                          },
                        ]}></View>
                    </Animated.View>
                  </PanGestureHandler>
                  <PanGestureHandler onGestureEvent={gestureHandler2}>
                    <Animated.View
                      style={[

                        {
                          position: 'absolute',
                          width: 30,
                          height: 80,
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
            <Text style={{ color: '#FFFFFF' }} onPress={() => {
              let start = getStartTimeMS()
              let end = getEndTimeMS()
              let startTime = getSecToTime(start)
              let endTime = getSecToTime(end)
              let total = (end - start) * 1000
              let prevSize = byteToMB(selectedVideo.fileSize || 0)
              navigation.replace('Process', { processProps: { startTime, endTime, url: selectedVideo.uri || '', duration: total, startTimeS: start * 1000, thumbnail: frames[0], prevSize } })
            }}>Save</Text>
          </View>
        </Animated.View>
        <Animated.View style={[{ flexDirection: 'row', gap: 10, marginHorizontal: 10, position: 'absolute', bottom: 0, zIndex: 99, left: 0, }, buttonStyle]}>
          <ThemeButton onPress={() => { }} style={{ zIndex: 1, flex: 1, backgroundColor: '#FFFFFF', }} typoStyle={{ fontWeight: 'bold', color: '#000' }}>Back</ThemeButton>
          <ThemeButton onPress={handleEdit} style={{ zIndex: 1, flex: 1, backgroundColor: '#FE2C55', }} typoStyle={{ fontWeight: 'bold', color: '#FFFFFF' }}>Edit</ThemeButton>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    backgroundColor: '#000',
  },
  panel: {
    height: SCREEN_HEIGHT / 2,
    padding: 16,
  },
  editOptions: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  optionBox: {
    width: 60,
    height: 60,
    backgroundColor: '#444',
    borderRadius: 12,
  },
});
