import { StyleSheet, Text, TextStyle, View } from 'react-native'
import React, { ReactNode } from 'react'

const ThemeText = ({ children, style }: { children: ReactNode, style?: TextStyle }) => {
    return (
        <View>
            <Text style={[styles.textStyle, style]}>{children}</Text>
        </View>
    )
}

export default ThemeText

const styles = StyleSheet.create({
    textStyle: {
        color: '#FFF'
    }
})