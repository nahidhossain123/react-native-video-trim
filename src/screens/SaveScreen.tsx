import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { RootStackParamList } from '../navigation/type'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import ThemeButton from '../component/ui/ThemeButton'
type propsType = NativeStackScreenProps<RootStackParamList, 'Files'>
export default function SaveScreen({ navigation, route }: propsType) {
    const { url, name, thumbnail, duration, prevSize, currentSize } = route.params.filesProps
    return (
        <View style={{ paddingHorizontal: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Pressable onPress={() => {
                    navigation.navigate('Home')
                }}>
                    <Image style={{ width: 30, height: 30 }} source={require('../asset/back.png')} />
                </Pressable>
                <Text style={{ fontSize: 20, }}>Saved Files</Text>
            </View>
            <View style={{ position: 'relative', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, backgroundColor: '#ededed', padding: 5, borderRadius: 20, gap: 10 }}>
                <Image source={{ uri: thumbnail }} style={{ borderRadius: 20 }} alt='image' width={100} height={100} />
                <Text style={{ position: 'absolute', left: 10, bottom: 10, zIndex: 10, color: 'white', fontWeight: 'bold' }}>{duration}</Text>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{name}</Text>
                        <Text style={{}}>{url}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{prevSize} mB</Text>
                            <Image style={{ width: 15, height: 15 }} source={require('../asset/next.png')} />
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{currentSize} mB</Text>
                        </View>
                    </View>

                </View>
            </View>
        </View>
    )
}