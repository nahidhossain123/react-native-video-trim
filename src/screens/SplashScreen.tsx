import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { OnBoardingData } from '../constants/OnBoardingData'
import OnBoardingRenderItem from '../component/OnBoardingRenderItem'
import ThemeButton from '../component/ui/ThemeButton'
import Dot from '../Dot'
import Pagination from '../component/Pagination'

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
            <View style={{ position: 'absolute', bottom: 0, width: '100%', justifyContent: 'flex-end', gap: 20, marginBottom: 10, paddingHorizontal: 10 }}>
                <Pagination x={x} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#FFF', fontWeight: "bold" }}>Skip</Text>
                    <ThemeButton onPress={() => { }} style={{ borderRadius: 200, paddingHorizontal: 30, color: '#000', backgroundColor: '#FFF' }}>Continue</ThemeButton>
                </View>
            </View>
        </View>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})