import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemedButton from '../component/ui/ThemedButton'
import ThemedText from '../component/ui/ThemedText'

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <ThemedText style={styles.textStyle}>Trim Video</ThemedText>
            <Pressable style={styles.imageSelect}>
                <View style={styles.imageContainer}>
                    <Image style={styles.imageStyle} source={require('../asset/image-folder.png')} />
                    <ThemedText>Select videos</ThemedText>
                    <ThemedText>or share them with the app</ThemedText>
                </View>
                <View style={styles.selectButtonContainer}>
                    <ThemedButton>+ Select Videos</ThemedButton>
                </View>
            </Pressable>


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