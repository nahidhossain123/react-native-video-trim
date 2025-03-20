import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import VideoTrimmer from '../component/VideoTrimmer'

const EditScreen = ({ navigation, route }) => {
    console.log("Router", route.params)
    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <VideoTrimmer video={route.params} />
        </View>
    )
}

export default EditScreen

const styles = StyleSheet.create({})