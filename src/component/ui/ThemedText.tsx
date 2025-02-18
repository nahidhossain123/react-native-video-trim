import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ThemedText = ({ children, style }) => {
    return (
        <View>
            <Text style={[styles.textStyle, style]}>{children}</Text>
        </View>
    )
}

export default ThemedText

const styles = StyleSheet.create({
    textStyle: {
        color: '#FFF'
    }
})