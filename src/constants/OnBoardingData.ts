import { AnimationObject } from "react-native-reanimated";

export interface OnboardingDataType{
    id:string,
    animation:string,
    text:string,
    subText:string,
    textColor:string,
    backgroundColor:string,
}

export const OnBoardingData:OnboardingDataType[]=[
    {
        id:'1',
        animation:require('../asset/lottie-animations/welcome.json'),
        text:'Welcome!',
        subText:`Let's do a quick tour of the app`,
        textColor:'#FFFFFF',
        backgroundColor:'#212121',
    },
    {
        id:'2',
        animation:require('../asset/lottie-animations/edit.json'),
        text:'Cut videos',
        subText:`Trim or cut videos to make them shorter.`,
        textColor:'#FFFFFF',
        backgroundColor:'#263238',
    },
    {
        id:'4',
         animation:require('../asset/lottie-animations/success.json'),
        text:'All done!',
        subText:`You're ready to start using the app!`,
        textColor:'#FFFFFF',
        backgroundColor:'#263238',
    }
]