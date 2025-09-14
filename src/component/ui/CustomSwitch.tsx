import { View, Text, StyleSheet, Touchable } from 'react-native'
import React, { useCallback, useDeferredValue, useEffect } from 'react'
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
interface CustomSwitchPropsType {
    active: boolean,
    activeBgColor: string,
    inactiveBgColor: string,
    thumbColor?: string,
    duration?: number,
    onToggle: (isActive: boolean) => void
}

export default function CustomSwitch({ active, activeBgColor, inactiveBgColor, thumbColor, duration = 200, onToggle }: CustomSwitchPropsType) {
    const isActive = useSharedValue(active)
    const progress = useDerivedValue(() => {
        return withTiming(isActive.value ? 1 : 0, { duration })
    })
    useEffect(() => {
        isActive.value = active
    }, [active])

    const handleToggle = useCallback(() => {
        isActive.value = !isActive.value
        if (onToggle) {
            onToggle(isActive.value)
        }
    }, [isActive, onToggle])

    const thumbAnimationStyle = useAnimatedStyle(() => {
        return {
            transform: [{
                translateX: withSpring(isActive.value ? 20 : 0, {
                    damping: 15,
                    stiffness: 150
                })
            }]
        }
    })

    const bgAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [inactiveBgColor, activeBgColor]
        )
        return { backgroundColor }
    })


    return (
        <TouchableWithoutFeedback onPress={handleToggle}>
            <Animated.View style={[styles.container, bgAnimatedStyle]}>
                <Animated.View style={[styles.thumbStyle, thumbAnimationStyle]} />
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 50,
        height: 30,
        borderRadius: 30,
        backgroundColor: '#ccccccff',
        padding: 3,
    },
    thumbStyle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF'
    }
})