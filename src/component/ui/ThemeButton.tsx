import { Button, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ThemeButton = ({ onPress, children, style }) => {
  return (
    <Pressable onPress={onPress}>
      <Text style={[styles.buttonStyle, style]}>{children}</Text>
    </Pressable>
  )
}

export default ThemeButton

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: 5,
    backgroundColor: '#FFCDD2',
    padding: 10,
    fontSize: 18
  }
})