import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import VideoTrimmer from '../component/VideoTrimmer'

const EditScreen = () => {
    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <VideoTrimmer />
        </View>
    )
}

export default EditScreen

const styles = StyleSheet.create({})