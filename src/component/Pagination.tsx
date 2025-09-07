import { View, Text } from 'react-native'
import React from 'react'
import { OnBoardingData } from '../constants/OnBoardingData'
import Dot from '../Dot'
import { SharedValue } from 'react-native-reanimated'

const Pagination = ({ x }: { x: SharedValue<number> }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {(OnBoardingData.map((_, index) => (
                <View key={index}>
                    <Dot index={index} x={x} />
                </View>
            )))}
        </View>
    )
}

export default Pagination