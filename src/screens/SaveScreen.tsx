import { View, Text, Image } from 'react-native'
import React from 'react'
import { RootStackParamList } from '../navigation/type'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
type propsType = NativeStackScreenProps<RootStackParamList, 'Files'>
export default function SaveScreen({ navigation, route }: propsType) {
    const { url, name, thumbnail, duration } = route.params.filesProps
    return (
        <View style={{ paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Saved Files</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, backgroundColor: '#ededed', padding: 5, borderRadius: 20, gap: 10 }}>
                <Image source={{ uri: thumbnail }} style={{ borderRadius: 20 }} alt='image' width={150} height={150} />
                <View>
                    <Text style={{ flex: 1 }}>{name}</Text>
                    <Text style={{ flex: 1 }}>{duration}</Text>
                </View>
            </View>
        </View>
    )
}