import { Button, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ThemeButton = ({ onPress, children, style, typoStyle, icon }) => {
  return (
    <Pressable style={[styles.buttonStyle, style]} onPress={onPress}>
      <Text style={[{ textAlign: 'center' }, typoStyle]}>{children}</Text>
      {icon && (<Image style={{ width: 20, height: 20 }} source={icon} />)}
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