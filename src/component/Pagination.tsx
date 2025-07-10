import { View, Text } from 'react-native'
import React from 'react'
import { OnBoardingData } from '../constants/OnBoardingData'
import Dot from '../Dot'

const Pagination = ({ x }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {(OnBoardingData.map((_, index) => (
                <Dot index={index} x={x} />
            )))}
        </View>
    )
}

export default Pagination