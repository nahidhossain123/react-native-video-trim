import { Asset } from "react-native-image-picker";

export type RootStackParamList = {
OnBoarding:undefined,
Home:undefined,
Video:{video:Asset},
Process:{processProps:{startTime:string,endTime:string,url:string,duration:number,startTimeS:number,thumbnail:string}},
Files:{filesProps:{url:string,name:string,thumbnail:string,duration:string}}
}