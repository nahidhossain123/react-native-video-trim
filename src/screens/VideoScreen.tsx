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
import { GestureDetector, Gesture, GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import ThemeButton from '../component/ui/ThemeButton';
import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import { cleanupAllOldFrames, extractFrame } from '../utils/functions';
import VideoPlayer from '../component/VideoPlayer';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_COUNT = 5;
export default function VideoEditorScreen({ navigation, route }) {
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
  const [frames, setFrames] = useState([]);
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
  const videoPlayerRef = useRef()
  const seekableValue = useSharedValue(0)
  const [isEdit, setIsEdit] = useState(false)



  useEffect(() => {
    return () => {
      cleanupAllOldFrames()
    }
  }, [])


  const handleExtractFrame = () => {

    console.log('ONLoddfdf=================')

    const timestamps = [0.1, 0.3, 0.5, 0.7, 0.9].map(p => p * selectedVideo.duration);

    // Load middle frame first
    extractFrame(selectedVideo.uri, timestamps[2], 2).then(uri => {
      setFrames(Array(FRAME_COUNT).fill(uri)); // fill all with middle frame

      // Load other frames progressively
      [0, 1, 3, 4].forEach(index => {
        extractFrame(selectedVideo.uri, timestamps[index], index).then(newUri => {
          setFrames(prev => {
            const copy = [...prev];
            copy[index] = newUri;
            return copy;
          });
        });
      });
    });
  };

  const seekVal = (time) => {
    if (videoPlayerRef?.current) {
      videoPlayerRef?.current?.onSeek(time)
    }
  }



  const gestureHandler = useAnimatedGestureHandler({
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
  const gestureTimelineHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = timelineThumb.value;
    },
    onActive: (e, ctx) => {
      timelineThumb.value = Math.max(30, Math.min(e.translationX + ctx.startX, 340));
      let time = Math.floor((timelineThumb.value / (SCREEN_WIDTH - 60 - 48)) * selectedVideo.duration)
      console.log('timelineThumb', time)
      runOnJS(seekVal)(time)
    },
    onEnd: () => {
      tempPosition.value = position.value;
    },
  });
  const gestureHandler2 = useAnimatedGestureHandler({
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

  const format = seconds => {
    let mins = parseInt(seconds / 60)
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
    let time = Math.floor((leftThumb.value / (SCREEN_WIDTH - 60 - 48)) * selectedVideo.duration)
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
    let time = Math.floor((((SCREEN_WIDTH - 60 - 48) + rightThumb.value) / (SCREEN_WIDTH - 60 - 48)) * selectedVideo.duration)

    runOnJS(seekVal)(time)
    let h = 0;
    let m = 0;
    let s = 0;
    h = Math.floor(time / 3600);
    m = Math.floor(time % 3600 / 60);
    s = Math.floor(time % 3600 % 60);
    console.log('maxLabelText', time, h, m, s)
    return {
      text: `${h}:${m}:${s}`,
    };
  });

  const getTrimTime = (val) => {
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

  console.log('Frames', frames)
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
                animatedProps={minLabelText}
                editable={false}
                defaultValue={'00.00.00'}
              />
              <Text style={{ color: '#FFFFFF' }}>/</Text>
              <AnimatedTextInput
                style={{ color: '#FFFFFF' }}
                animatedProps={minLabelText}
                editable={false}
                defaultValue={`${Math.floor((selectedVideo.duration / 3600))}:${Math.floor(selectedVideo.duration % 3600 / 60)}:${Math.floor(selectedVideo.duration % 3600 % 60)}`}
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
            <AnimatedTextInput
              style={{ color: '#FFFFFF' }}
              animatedProps={maxLabelText}
              editable={false}
              defaultValue={`${Math.floor((selectedVideo.duration / 3600))}:${Math.floor(selectedVideo.duration % 3600 / 60)}:${Math.floor(selectedVideo.duration % 3600 % 60)}`}
            />
          </Animated.View>
          <View style={{ marginBottom: 30 }} onLayout={findDimention}>
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
            <Text style={{ color: '#FFFFFF' }} onPress={startTrim}>Save</Text>
          </View>
        </Animated.View>
        <Animated.View style={[{ flexDirection: 'row', gap: 10, marginHorizontal: 10, position: 'absolute', bottom: 0, zIndex: 99, left: 0, }, buttonStyle]}>
          <ThemeButton style={{ zIndex: 1, flex: 1, backgroundColor: '#FFFFFF', }} typoStyle={{ fontWeight: 'bold' }}>Back</ThemeButton>
          <ThemeButton onPress={handleEdit} style={{ zIndex: 1, flex: 1, backgroundColor: '#FE2C55', }} typoStyle={{ fontWeight: 'bold', color: '#FFFFFF' }}>Edit</ThemeButton>
        </Animated.View>
      </View>
    </GestureHandlerRootView >
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
