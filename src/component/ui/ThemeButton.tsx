import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'
import React, { ReactNode } from 'react'

const ThemeButton = ({ onPress, children, style, typoStyle, icon }: { onPress: () => void, children: ReactNode, style?: ViewStyle, typoStyle?: TextStyle, icon?: ImageSourcePropType }) => {
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
    borderRadius: 8,
    backgroundColor: '#FFCDD2',
    padding: 10,
    fontSize: 18
  }
})