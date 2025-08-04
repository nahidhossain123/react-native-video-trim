import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Animated from 'react-native-reanimated';
import ThemeButton from '../component/ui/ThemeButton';

export default function DetailsScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <ThemeButton onPress={() => navigation.goBack()}>
                Go Back
            </ThemeButton>
            <Animated.Image
                source={{ uri: 'https://picsum.photos/id/39/200' }}
                style={{ width: 100, height: 100 }}
                sharedTransitionTag="tag"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 24,
    },
});
