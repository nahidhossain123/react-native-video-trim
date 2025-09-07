import { FlatList, Image, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native'
import React, { useRef } from 'react'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { OnBoardingData, OnboardingDataType } from '../constants/OnBoardingData'
import OnBoardingRenderItem from '../component/OnBoardingRenderItem'
import ThemeButton from '../component/ui/ThemeButton'
import Dot from '../Dot'
import Pagination from '../component/Pagination'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/type'

type propsType = NativeStackScreenProps<RootStackParamList, 'OnBoarding'>
const OnBoardingScreen = ({ navigation }: propsType) => {
    const x = useSharedValue(0)
    const flatListRef = useRef<FlatList<any>>(null)
    const flatListIndex = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler({
        onScroll: event => {
            x.value = event.contentOffset.x;
        }
    })

    const handleViewableItemChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems[0]?.index != null) {
            flatListIndex.value = viewableItems[0].index
        }
    }

    return (
        <View style={styles.container}>
            <Animated.FlatList
                ref={flatListRef}
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
                onViewableItemsChanged={handleViewableItemChanged}
                viewabilityConfig={{
                    minimumViewTime: 300,
                    viewAreaCoveragePercentThreshold: 10
                }}
            />
            <View style={{ position: 'absolute', bottom: 0, width: '100%', justifyContent: 'flex-end', gap: 20, marginBottom: 10, paddingHorizontal: 10 }}>
                <Pagination x={x} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Pressable onPress={() => {
                        flatListRef.current?.scrollToIndex({ index: 3 })
                    }}>
                        <Text style={{ color: '#FFF', fontWeight: "bold" }}>Skip</Text>
                    </Pressable>
                    <ThemeButton icon={require('../asset/next.png')} onPress={() => {
                        if (flatListIndex.value < OnBoardingData.length - 1) {
                            flatListRef.current?.scrollToIndex({ index: flatListIndex.value + 1 })
                        } else {
                            navigation.replace('Home')
                        }
                    }} style={{ borderRadius: 200, paddingHorizontal: 30, backgroundColor: '#FFF', flexDirection: "row", gap: 10 }}>
                        Continue
                    </ThemeButton>
                </View>
            </View>
        </View>
    )
}

export default OnBoardingScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})