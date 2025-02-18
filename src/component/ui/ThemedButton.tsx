import { Button, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ThemedButton = ({ onPress, children, style }) => {
  return (
    <Pressable >
      <Text style={[styles.buttonStyle, style]}>{children}</Text>
    </Pressable>
  )
}

export default ThemedButton

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: 5,
    backgroundColor: '#FFCDD2',
    padding: 10,
    fontSize: 18
  }
})