import { AnimationObject } from "react-native-reanimated";

export interface OnboardingDataType{
    id:number,
    image:AnimationObject,
    text:string,
    subText:string,
    textColor:string,
    backgroundColor:string,
}

export const OnBoardingData:OnboardingDataType[]=[
    {
        id:1,
        animation:'',
        text:'Welcome!',
        subText:`Let's do a quick tour of the app`,
        textColor:'#FFFFFF',
        backgroundColor:'#212121',
    },
    {
        id:2,
        animation:'',
        text:'Cut videos',
        subText:`Trim or cut videos to make them shorter.`,
        textColor:'#FFFFFF',
        backgroundColor:'#263238',
    },
    {
        id:3,
        animation:'',
        text:'Batch processing',
        subText:`Process one or multiple files at the same time.`,
        textColor:'#FFFFFF',
        backgroundColor:'#212121',
    },
    {
        id:4,
        animation:'',
        text:'All done!',
        subText:`You're ready to start using the app!`,
        textColor:'#FFFFFF',
        backgroundColor:'#263238',
    }
]