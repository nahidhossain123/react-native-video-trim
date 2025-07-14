import { Image, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import React, { useEffect, useReducer, useState } from 'react'
import ThemeButton from '../component/ui/ThemeButton'
import ThemeText from '../component/ui/ThemeText'
import { launchImageLibrary } from 'react-native-image-picker'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, withSpring, useDerivedValue, interpolate, withSequence } from 'react-native-reanimated'
import { getAsyncStorage, setAsyncStorage } from '../storage/values/AppStorage'
import { HOME_SCREEN, SPLASH_SCREEN_KEYS } from '../storage/keys/AppKeys'

const HomeScreen = ({ navigation }) => {
    const [open, toggle] = useReducer(s => !s, false)
    const [isFirstClickSelectButton, setIsFirstClickSelectButton] = useState(false)
    const { width: SCREEN_WIDTH } = useWindowDimensions()

    const progress = useDerivedValue(() => {
        return open ? withSpring(1) : withSpring(0)
    })
    const openVideoPicker = async () => {
        await setAsyncStorage(HOME_SCREEN.HAS_SELECT_BUTTON_CLICKED, 'true')
        const result = await launchImageLibrary({
            mediaType: 'video',
            videoQuality: 'low',
            presentationStyle: 'formSheet',
            assetRepresentationMode: 'current',
        });
        if (result.assets) {
            navigation.navigate('Edit', { video: result.assets[0] })
        }

    };


    const animatedStyleCircle1 = useAnimatedStyle(() => {
        const scale = interpolate(
            progress.value,
            [0, 1],
            [0, 60],
        )
        return {
            transform: [{ scale }]
        }
    });



    const scale = useSharedValue(0);
    const scale2 = useSharedValue(1.3);
    const opacity = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withTiming(2, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );
        scale2.value = withRepeat(
            withTiming(1.4, { duration: 1000 }),
            -1, // Infinite loop
            true // Don’t reverse
        );
        opacity.value = withRepeat(
            withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        //console.log('first', scale.value * 40, opacity.value)
        return {
            transform: [{ scale: scale.value * 1.8 }],
            opacity: opacity.value,
        }
    });

    const animatedStyleCircle3 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale2.value }],
        }
    });

    const storeData = async () => {
        try {
            await setAsyncStorage(SPLASH_SCREEN_KEYS.HAS_LAUNCHED, 'true')
        } catch (e) {
            // saving error
        }
    };

    const getData = async () => {
        try {
            let value = await getAsyncStorage(SPLASH_SCREEN_KEYS.HAS_LAUNCHED)
            console.log('StoredValue', value)
            return value;
        } catch (e) {
            // saving error
        }
    }

    useEffect(() => {
        let hasLaunched
        let hasClicked
        const getData = async () => {
            try {
                hasLaunched = await getAsyncStorage(SPLASH_SCREEN_KEYS.HAS_LAUNCHED)
                hasClicked = await getAsyncStorage(HOME_SCREEN.HAS_SELECT_BUTTON_CLICKED)
            } catch (e) {
                // saving error
            }
        }
        getData()
        console.log("Value", hasClicked)
        if (!hasLaunched) {
            storeData()
        }
        if (!hasClicked) {
            toggle()
        }
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <ThemeText style={styles.textStyle}>Trim Video</ThemeText>
            <TouchableOpacity onPress={openVideoPicker} style={styles.imageSelect}>
                <View style={styles.imageContainer}>
                    <Image style={styles.imageStyle} source={require('../asset/image-folder.png')} />
                    <ThemeText>Select videos</ThemeText>
                    <ThemeText>or share them with the app</ThemeText>
                </View>
                <View style={styles.selectButtonContainer}>
                    <ThemeButton style={{ zIndex: 1 }} onPress={openVideoPicker}>+ Select Videos</ThemeButton>
                    <View style={{ position: 'absolute', top: -100, left: -200, zIndex: 10, width: SCREEN_WIDTH }}>
                        <ThemeText style={{ fontWeight: 900, fontSize: 20 }}>Select videos</ThemeText>
                        <ThemeText style={{}}>Click here to select one or more videos</ThemeText>
                    </View>
                    <View style={{ position: 'absolute', width: SCREEN_WIDTH, height: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center', }}>
                        <Animated.View style={[{
                            width: 10,
                            height: 10,
                            borderRadius: ((SCREEN_WIDTH * 3) / 2) / 2,
                            backgroundColor: '#009688',
                            position: 'absolute'
                        }, animatedStyleCircle1]} />
                        <Animated.View style={[{
                            width: 150,
                            height: 150,
                            borderRadius: (SCREEN_WIDTH) / 2,
                            backgroundColor: '#FFFFFF',
                            position: 'absolute'
                        },
                            animatedStyle
                        ]} />
                        <Animated.View style={[{
                            width: 170,
                            height: 170,
                            borderRadius: SCREEN_WIDTH / 2,
                            backgroundColor: '#000000',
                            position: 'absolute'
                        }, animatedStyleCircle3]} />
                    </View>
                </View>
            </TouchableOpacity>


        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'space-between',
        padding: 10
    },
    textStyle: {
        textAlign: 'center'
    },
    imageSelect: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    imageContainer: {
        marginBottom: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageStyle: {
        width: 200,
        height: 200,
        marginBottom: 25
    },
    selectButtonContainer: { justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 20, bottom: 20 },
})