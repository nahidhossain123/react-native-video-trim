import { View, Text, StatusBar } from 'react-native'
import React, { ReactNode } from 'react'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

interface ScreenLayoutProps {
    children: ReactNode,
    backgroundColor: string
}

export default function ScreenLayout({ children, backgroundColor }: ScreenLayoutProps) {
    return (
        <SafeAreaProvider>
            <StatusBar translucent backgroundColor="transparent" barStyle='light-content' />
            <LayoutContent backgroundColor={backgroundColor}>
                {children}
            </LayoutContent>
        </SafeAreaProvider>
    )
}

const LayoutContent = ({ children, backgroundColor }: ScreenLayoutProps) => {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={[
                {
                    backgroundColor,
                    flex: 1,
                    paddingTop: insets.top, // Padding for status bar height
                },
            ]}
            edges={['left', 'right', 'bottom']} // exclude 'top' because we add padding manually
        >
            {children}
        </SafeAreaView>
    );
};












