import { View, Text, useWindowDimensions, StyleSheet } from 'react-native'
import React from 'react'
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated'

const Dot = ({ index, x }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions()
  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        (index) * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH
      ],
      [10, 15, 10],
      Extrapolate.CLAMP
    )
    return {
      width: widthAnimation
    }
  })
  return (
    <Animated.View style={[styles.dot, animatedDotStyle]} />
  )
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF'
  }
})

export default Dot