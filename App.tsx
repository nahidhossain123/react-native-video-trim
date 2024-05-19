/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
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
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import RNFS, {stat} from 'react-native-fs';
import {FFmpegKit, ReturnCode, FFmpegKitConfig} from 'ffmpeg-kit-react-native';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

export const FRAME_PER_SEC = 1;
export const FRAME_WIDTH = 30;

const FRAME_STATUS = Object.freeze({
  LOADING: {name: Symbol('LOADING')},
  READY: {name: Symbol('READY')},
});

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [selectedVideo, setSelectedVideo] = useState('');
  const [handlePosition,setHandlePosition] = useState(0)
  const [isPaused, setIsPaused] = useState(false);
  const [frames, setFrames] = useState([]);
  const position = useSharedValue(0);
  const position2 = useSharedValue(0);
  const tempPosition = useSharedValue(0);
  const tempPosition2 = useSharedValue(0);
  const sliderwidth = useSharedValue(1000);
  const [outputVideoPath, setOutputVideoPath] = useState('');
  const leftThumb = useSharedValue(0);
  const trimStart = useSharedValue(0);
  const trimEnd = useSharedValue(0)
  const rightThumb = useSharedValue(SCREEN_WIDTH-15)
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
            `Encode failed with state ${state} and rc ${returnCode}.${
              (failStackTrace, '\\n')
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
          `Encode failed with state ${state} and rc ${returnCode}.${
            (failStackTrace, '\\n')
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
      durationLimit: 100,
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
    const numberOfFrames = Math.ceil(selectedVideo.duration)/5;
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
    },
    onActive: (e, ctx) => {
      console.log('onactive1', e, ctx);
      // if (
      //   e.translationX >= 0 &&
      //   e.translationX <= selectedVideo.duration * 20
      // ) {
      //   sliderwidth.value = position2.value - position.value;
      //   position.value = ctx.startX + e.translationX;
      // }
      // leftThumb.value = ctx.startX + e.translationX;
      // sliderwidth.value = rightThumb.value - leftThumb.value;
      console.log("SLiderVal",e.translationX,ctx)
      if (ctx.startX + e.translationX < 0) {
        leftThumb.value = 0;
      } else if (ctx.startX + e.translationX > rightThumb.value) {
        leftThumb.value = rightThumb.value;
        sliderwidth.value = rightThumb.value - leftThumb.value;
      } else {
        leftThumb.value = ctx.startX + e.translationX;
        sliderwidth.value = rightThumb.value - leftThumb.value;
      }
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

      // if (
      //   e.translationX >= 0 &&
      //   e.translationX <= selectedVideo.duration * 20
      // ) {
      //   sliderwidth.value = position2.value - position.value;
      //   position2.value = ctx.startX + e.translationX;
      // }
      // rightThumb.value = ctx.startX + e.translationX;
      //   sliderwidth.value = rightThumb.value - leftThumb.value;
      if (ctx.startX + e.translationX > selectedVideo.duration * 20) {
        rightThumb.value = selectedVideo.duration * 20;

      } else if (ctx.startX + e.translationX < leftThumb.value) {
        rightThumb.value = leftThumb.value;
        sliderwidth.value = rightThumb.value - leftThumb.value;
     
      } else {
        rightThumb.value = ctx.startX + e.translationX;
        sliderwidth.value = rightThumb.value - leftThumb.value;
      
      }
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
    transform: [{translateX: leftThumb.value}],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{translateX: rightThumb.value}],
  }));
  const sliderwidthAnim = useAnimatedStyle(() => ({
    width: sliderwidth.value,
    transform: [{translateX: leftThumb.value}],
  }));
  const seekAbleStyle = useAnimatedStyle(() => ({

    transform: [{translateX: seekableValue.value}],
  }));

  const format = seconds => {
    let mins = parseInt(seconds / 60)
      .toString()
      .padStart(2, '0');
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const seekVal = (time)=>{
     let t =0 +Math.floor(time / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
    videoRef.current.seek(t)
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      position.value =  event.contentOffset.x;
      position2.value = event.contentOffset.x;
  
      runOnJS(seekVal)(position.value)
      // tempPosition.value = position.value-event.contentOffset.x;
      // tempPosition2.value = position2.value-event.contentOffset.x;
      //setHandlePosition({pos1:leftPos,pos2:rightPos})
      //runOnJS(setHandlePosition)({pos1:leftPos,pos2:rightPos});
      console.log('Onscroll', event.contentOffset.x);
    },
  });
  Animated.addWhitelistedNativeProps({text: true});
  const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
  const minLabelText = useAnimatedProps(() => {
    // return {
    //   text: `00.${Math.floor(leftThumb.value +position.value)}`,
    // };
    runOnJS(seekVal)(position.value+leftThumb.value)
    let time =0 +Math.floor((position.value+leftThumb.value) / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
    let h=0;
    let m=0;
    let s=0;
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
    runOnJS(seekVal)(position.value+rightThumb.value)
    let time = 0 +Math.floor((position2.value+rightThumb.value) / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
    let h=0;
    let m=0;
    let s=0;
     h = Math.floor(time / 3600);
     m = Math.floor(time % 3600 / 60);
     s = Math.floor(time % 3600 % 60);
  
    return {
      text: `${h}:${m}:${s}`,
    };
  });

  const getTrimTime = (val)=>{
    console.log("Secornds",val)
    let time = 0 +Math.floor((val) / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1
    let h=0;
    let m=0;
    let s=0;
     h = Math.floor(time / 3600);
     m = Math.floor(time % 3600 / 60);
     s = Math.floor(time % 3600 % 60);
    return `${h}:${m}:${s}`;
  }

  const trimVideo = () => {

    let outputImagePath = `${RNFS.DownloadDirectoryPath}/rn_video_trim_1.mp4`;
    setOutputVideoPath(outputImagePath)
    const ffmpegCommand = `-y -i ${selectedVideo.uri} -ss ${getTrimTime((position.value+leftThumb.value))} -to ${getTrimTime((position2.value+rightThumb.value))} -c:v copy -c:a copy ${outputImagePath}`;
    console.log("Cmd",ffmpegCommand)
    FFmpegKit.executeAsync(ffmpegCommand).then(async session => {
      const state = FFmpegKitConfig.sessionStateToString(
        await session.getState(),
      );
      const returnCode = await session.getReturnCode();
      const failStackTrace = await session.getFailStackTrace();
      const duration = await session.getDuration();
      console.log(
        'Session',
        await session.getDuration(),
        ReturnCode.isSuccess(returnCode),
      );

      if (ReturnCode.isSuccess(returnCode)) {
        console.log(
          `Encode completed successfully in ${duration} milliseconds;.`,
        );
        console.log(
          `Check at ${outputImagePath.replace(
            '%4d',
            String(1).padStart(4, 0),
          )}`,
        );
        // ${filePath.replace('%4d', String(1).padStart(4, 0))}
        successCallback(
          outputImagePath.replace('%4d', String(1).padStart(4, 0)),
        );
      } else {
        console.log('Encode failed. Please check log for the details.');
        console.log(
          `Encode failed with state ${state} and rc ${returnCode}.${
            (failStackTrace, '\\n')
          }`,
        );
        //errorCallback();
      }
      // console.log(
      //   `Async FFmpeg process started with sessionId ${JSON.stringify(
      //     session,
      //   )}.`,
      // );
    });
  };

  console.log('minLabelText', SCREEN_WIDTH);
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={backgroundStyle}>
        <Video
        ref={videoRef}
        onProgress={x => {
          let duration = x.currentTime*20

          let time =(0 +Math.floor(duration / ((SCREEN_WIDTH) / ((20 - 0) / 1))) * 1)
          console.log('x.seekableDuration',time,x.currentTime)
          seekableValue.value = time
        }}
          paused={isPaused}
          source={{
            uri: selectedVideo.uri,
          }} // Can be a URL or a local file.
          // Store reference
          resizeMode={'cover'}
          repeat={true}
          onLoad={handleVideoLoad}
          style={{width: '100%', height: 300}}
        />

        {selectedVideo && (
          <View   style={{width:SCREEN_WIDTH}}>
            <Animated.ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              onTouchStart={()=>setIsPaused(true)}
              alwaysBounceHorizontal={true}
              scrollEventThrottle={1}
              onScroll={scrollHandler}
              // onScroll={e => {
              //   let currentScroll = e.nativeEvent.contentOffset.x / (1 * 20);
              //   if (currentScroll > preViousScroll) {
              //     position.value = currentScroll;
              //     position2.value = currentScroll;
              //   } else {
              //     position.value -= 1;
              //     position2.value -= 1;
              //   }
              //   preViousScroll = currentScroll;
              //   console.log(
              //     'onscroll',
              //     e.nativeEvent.contentOffset.x / (1 * 20),
              //     currentScroll,
              //   );
              // }}
            >
              {/* <View
                style={{
                  backgroundColor: 'gray',
                  width: selectedVideo?.duration * 10,
                  height: 50,
                }}></View> */}
              {frames?.map((item, index) => {
                return (
                  <Image
                    key={index}
                    source={{
                      uri: 'file://' + item,
                    }}
                    style={{
                      width:SCREEN_WIDTH/4,
                      height: 50,
                    }}
                  />
                  // <View style={{width: 20,
                  //   height: 50,
                  //   backgroundColor: 'rgba(0,0,0,0.05)',
                  //   borderColor: 'rgba(0,0,0,0.1)',
                  //   borderWidth: 1,}} key={index}></View>
                );
              })}

             
            </Animated.ScrollView>
            <Animated.View
                style={[
                  seekAbleStyle,
                  {
                  
                    backgroundColor: 'red',
                    width:2,
                    height: 50,
                    position: 'absolute',
                    borderRadius: 5,
                    top: 0,
                  
                  },
                ]}></Animated.View>
            <Animated.View
                style={[
                  sliderwidthAnim,
                  {
                    // borderColor: '#f5d442',
                    // borderWidth: 2,
                    backgroundColor: '#f5d442',
                    
                    height: 5,
                    position: 'absolute',
                    borderRadius: 5,
                    top: 0,
                  },
                ]}></Animated.View>
              <Animated.View
                style={[
                  sliderwidthAnim,
                  {
                    // borderColor: '#f5d442',
                    // borderWidth: 2,
                    backgroundColor: '#f5d442',
                   
                    height: 5,
                    position: 'absolute',
                    borderRadius: 5,
                    bottom: 0,
                  },
                ]}></Animated.View>
              <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View
                  style={[
                    animatedStyle,
                    {
                      width: 15,
                      height: 50,
                      backgroundColor: '#f5d442',
                      position: 'absolute',
                      borderBottomLeftRadius: 5,
                      borderTopLeftRadius: 5,
                    },
                  ]}></Animated.View>
              </PanGestureHandler>

              <PanGestureHandler onGestureEvent={gestureHandler2}>
                <Animated.View
                  style={[
                    animatedStyle2,
                    {
                      position: 'absolute',
                      width: 15,
                      height: 50,
                      backgroundColor: '#f5d442',
                      borderTopRightRadius: 5,
                      borderBottomRightRadius: 5,
                    },
                  ]}></Animated.View>
              </PanGestureHandler>
          </View>
        )}
        <Animated.View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 20,
          }}>
          <AnimatedTextInput
            animatedProps={minLabelText}
            editable={false}
            defaultValue={'00.00.00'}
          />
          <AnimatedTextInput
            animatedProps={maxLabelText}
            editable={false}
            defaultValue={'00.00.00'}
          />
        </Animated.View>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 20,
          }}>
          <Text>Cancel</Text>
          {isPaused ? (
            <Pressable onPress={() => setIsPaused(false)}>
              <Image
                source={require('./src/asset/play-button.png')}
                style={{width: 30, height: 30}}
              />
            </Pressable>
          ) : (
            <Pressable onPress={() => setIsPaused(true)}>
              <Image
                source={require('./src/asset/pause.png')}
                style={{width: 30, height: 30}}
              />
            </Pressable>
          )}

          <Text onPress={trimVideo}>Save</Text>
        </View>
        <Text onPress={() => openVideoPicker()}>Open Video</Text>
        <View>{console.log('outputVideoPath','file://'+outputVideoPath)}</View>
        {outputVideoPath && (
          <Video
          paused={isPaused}
            source={{
              uri: 'file://' + outputVideoPath,
            }} // Can be a URL or a local file.
            // Store reference
            resizeMode={'cover'}
            repeat={true}
            style={{
              width: '100%',
              height: 300,
              borderColor: 'red',
              borderWidth: 2,
            }}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
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
});

export default App;
