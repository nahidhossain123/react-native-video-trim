import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import Video from 'react-native-video';
import ThemeButton from '../component/ui/ThemeButton';


const VideoEditorScreen = ({ navigation, route }) => {
    const [selectedVideo, setSelectedVideo] = useState(route.params.video);

    useEffect(() => {
        console.log('route.params.video.video', route.params.video)
    }, [route])
    return (
        <SafeAreaView style={[styles.container]}>
            <View style={{ flex: 1, gap: 10 }}>
                <View style={{ flex: 1 }}>
                    {selectedVideo && (<Video
                        muted={true}
                        source={{
                            uri: selectedVideo.uri,
                        }}
                        paused={false}
                        resizeMode={'cover'}
                        repeat={true}
                        style={{ width: '100%', flex: 1, borderRadius: 20, }}
                    />)}
                    <View style={{ position: 'absolute', top: 10, right: 10 }}>
                        <Text style={{ color: 'white' }} onPress={() => { navigation.navigate('Edit', { video: route.params.video }) }}>Edit</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 10 }}>
                    <ThemeButton style={{ zIndex: 1, flex: 1 }}>Your Story</ThemeButton>
                    <ThemeButton style={{ zIndex: 1, flex: 1, backgroundColor: 'red', color: 'white' }}>Next</ThemeButton>
                </View>
            </View>

        </SafeAreaView>

    )
}

export default VideoEditorScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'space-between',
    },

});