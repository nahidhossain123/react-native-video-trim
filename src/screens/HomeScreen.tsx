import { Image, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import ThemeButton from '../component/ui/ThemeButton'
import ThemeText from '../component/ui/ThemeText'
import { launchImageLibrary } from 'react-native-image-picker'

const HomeScreen = ({ navigation }) => {
    const openVideoPicker = async () => {
        const result = await launchImageLibrary({
            mediaType: 'video',
            videoQuality: 'low',
            presentationStyle: 'formSheet',
            assetRepresentationMode: 'current',
        });
        console.log('ImageResult', result);
        if (result.assets) {
            navigation.navigate('Edit', { video: result.assets[0] })
        }

    };
    return (
        <SafeAreaView style={styles.container}>
            <ThemeText style={styles.textStyle}>Trim Video</ThemeText>
            <TouchableOpacity onPress={openVideoPicker} style={styles.imageSelect}>
                <View style={styles.imageContainer}>
                    <Image style={styles.imageStyle} source={require('../asset/image-folder.png')} />
                    <ThemeText>Select videos</ThemeText>
                    <ThemeText>or share them with the app</ThemeText>
                </View>
                <View style={styles.selectButtonContainer}>
                    <ThemeButton onPress={openVideoPicker}>+ Select Videos</ThemeButton>
                </View>
            </TouchableOpacity>


        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'space-between',
        padding: 10
    },
    textStyle: {
        textAlign: 'center'
    },
    imageSelect: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    imageContainer: {
        marginBottom: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageStyle: {
        width: 200,
        height: 200,
        marginBottom: 25
    },
    selectButtonContainer: { justifyContent: 'flex-end', alignItems: 'flex-end' },
})