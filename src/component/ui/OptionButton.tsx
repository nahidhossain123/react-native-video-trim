import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native'
import React, { ReactNode } from 'react'

type OptionPressType = {
    children: ReactNode,
    onPress: () => void,
    icon: ImageSourcePropType
}

export default function OptionButton({ children, onPress, icon }: OptionPressType) {
    return (
        <View style={styles.btnContainer}>
            <Text onPress={onPress} style={styles.textBtnStyle}>{children}</Text>
            <Image style={{ width: 25, height: 25 }} source={icon} />
        </View>
    )
}

const styles = StyleSheet.create({
    videoContainer: {
        backgroundColor: '#000',
    },
    btnContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
    textBtnStyle: { color: '#FFFFFF', fontWeight: 'bold' }

});