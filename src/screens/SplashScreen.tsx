import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { OnBoardingData } from '../constants/OnBoardingData'
import OnBoardingRenderItem from '../component/OnBoardingRenderItem'

const SplashScreen = () => {
    const x = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler({
        onScroll: event => {
            x.value = event.contentOffset.x;
        }
    })
    return (
        <View style={styles.container}>
            <Animated.FlatList
                data={OnBoardingData}
                onScroll={onScroll}
                renderItem={({ item, index }) => {
                    return <OnBoardingRenderItem item={item} index={index} x={x} />
                }}
                keyExtractor={item => item.id.toString()}
                scrollEventThrottle={16}
                horizontal
                bounces={false}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})