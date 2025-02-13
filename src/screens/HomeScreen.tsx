import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const HomeScreen = ({ navigation }) => {
    return (
        <View >
            <Pressable onPress={() => {
                console.log('Clicking')
                navigation.navigate('Edit')
            }}>
                <Text style={{ marginTop: 20 }} >Open Video</Text>
            </Pressable>



        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({})