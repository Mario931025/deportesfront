
import { NavigationActions,StackActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { Platform } from 'react-native';
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Set","Oct","Nov","Dic"];
import moment from "moment";
export const ANDROID_SUB = "com.ikmf.monthly";
export const IOS_SUB = "com.ikmf.monthlyios";
//export const IOS_SUB = "com.ikmfyear";

export async function clearStorage(){
  const asyncStorageKeys = await AsyncStorage.getAllKeys();
  if (asyncStorageKeys.length > 0) {
    if (Platform.OS === 'android') {
      await AsyncStorage.clear();
    }
    if (Platform.OS === 'ios') {
      await AsyncStorage.multiRemove(asyncStorageKeys);
    }
  }
}

export function getDate(item){
  const momentEndDate = moment(item.created_at, 'YYYY-MM-DD HH:mm:ss')
  var year = momentEndDate.year();
  var date = momentEndDate.date();
  var month = MONTHS[momentEndDate.month()];

  if(date<=9){
    date = "0"+date;
  }

  return month+"/"+date+"/"+year;
}

export function validateEmail(text){
  let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  var isValid = false;
  if(reg.test(text) === false)
  {
    //this.setState({isEmailError:true});
    isValid = false;
  }
  else {
    //this.setState({isEmailError:false});
    isValid = true;
  }

  return isValid;
}

export function resetNavigation(targetRoute, params, props){
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: targetRoute,params:params }),
      ],
    });
    props.navigation.dispatch(resetAction);
  }