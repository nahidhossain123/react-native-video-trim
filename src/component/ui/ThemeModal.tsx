import { View, Text, Modal, StyleSheet } from 'react-native'
import React, { forwardRef, ReactNode, useImperativeHandle, useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import ThemeButton from './ThemeButton';

export type ThemeModalRef = {
    toggle: () => void
}

interface themeModalPropsType {
    children: ReactNode
}

function ThemeModal({ children }: themeModalPropsType, ref: React.Ref<ThemeModalRef>) {
    const [modalVisible, setModalVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        toggle: toggleModal
    }))

    const toggleModal = () => {
        setModalVisible(prevState => !prevState)
    }
    console.log('setModalVisible', modalVisible)
    return (
        <Modal
            animationType='none'
            transparent={true}
            visible={modalVisible}
            presentationStyle={'pageSheet'}
        >
            <View style={styles.overlay}>
                {children}
            </View>
        </Modal>
    )
}

export default forwardRef(ThemeModal)

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10
    },
});
