import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import React from 'react'
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import LottieView from 'lottie-react-native';
import { OnboardingDataType } from '../constants/OnBoardingData';

const OnBoardingRenderItem = ({ item, index, x }: { item: OnboardingDataType, index: number, x: SharedValue<number> }) => {
    const { width: SCREEN_WIDTH } = useWindowDimensions()
    console.log('Animation', item)

    const lottieAnimationStyle = useAnimatedStyle(() => {
        const translateYAnimation = interpolate(
            x.value,
            [
                (index - 1) * SCREEN_WIDTH,
                (index) * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH
            ],
            [200, 0, -200],
            Extrapolate.CLAMP
        )
        return {
            transform: [{ translateY: translateYAnimation }]
        }
    })

    const circleAnimation = useAnimatedStyle(() => {
        const scale = interpolate(
            x.value,
            [
                (index - 1) * SCREEN_WIDTH,
                (index) * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH
            ],
            [1, 4, 4],
            Extrapolate.CLAMP
        )
        return {
            transform: [{ scale: scale }]
        }
    })
    return (
        <View style={[styles.container, { width: SCREEN_WIDTH }]}>
            <View style={{ position: 'absolute' }}>
                <Animated.View style={[{
                    width: SCREEN_WIDTH,
                    height: SCREEN_WIDTH,
                    backgroundColor: item.backgroundColor,
                    borderRadius: SCREEN_WIDTH / 2
                }, circleAnimation]}

                />
            </View>
            <Animated.View style={lottieAnimationStyle}>
                <View style={{ height: SCREEN_WIDTH * 0.9 }}>
                    <LottieView style={{ width: '100%', height: '100%' }} source={item.animation} autoPlay loop />
                </View>
            </Animated.View>
            <View>
                <Text style={styles.text}>{item.text}</Text>
                <Text style={styles.subtext}>{item.subText}</Text>
            </View>
        </View>
    )
}

export default OnBoardingRenderItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 35,
        fontWeight: '900'
    },
    subtext: {
        color: '#FFFFFF',
        fontWeight: 'bold'
    },
    buttonStyle: {
        borderRadius: 30
    }
})