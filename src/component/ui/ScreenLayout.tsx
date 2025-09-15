import { View, Text, StatusBar, StatusBarStyle } from 'react-native'
import React, { ReactNode } from 'react'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

interface ScreenLayoutProps {
    children: ReactNode,
    backgroundColor: string,
    statusBg?: StatusBarStyle,
    isPaddingTop?: boolean
}

export default function ScreenLayout({ children, backgroundColor, statusBg = 'light-content', isPaddingTop = true }: ScreenLayoutProps) {
    return (
        <SafeAreaProvider>
            <StatusBar translucent backgroundColor="transparent" barStyle={statusBg} />
            <LayoutContent backgroundColor={backgroundColor} isPaddingTop={isPaddingTop}>
                {children}
            </LayoutContent>
        </SafeAreaProvider>
    )
}

const LayoutContent = ({ children, backgroundColor, isPaddingTop = true }: ScreenLayoutProps) => {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={[
                {
                    backgroundColor,
                    flex: 1,
                    paddingTop: isPaddingTop ? insets.top : 0, // Padding for status bar height
                },
            ]}
            edges={['left', 'right', 'bottom']} // exclude 'top' because we add padding manually
        >
            {children}
        </SafeAreaView>
    );
};












