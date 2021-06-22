import React,{Component} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet, Text, View, TouchableOpacity, StatusBar,Image,Dimensions,Linking, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import { NavigationActions,StackActions } from 'react-navigation';
import {forgottexts} from '../utils/apptexts'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Color, Font } from '../styles/config';
import { Icon } from 'react-native-elements';
import { CommonStyles } from '../styles/commonStyles';
import { forgotpassword } from '../services';
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import { resetNavigation, validateEmail } from '../utils/Common';

const styles = StyleSheet.create({
 
});

export default class ForgotPasswordScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
            visible:false,
            email:'',
		}
	}


	async componentDidMount() {
        
    }
    
    async onForgotClicked(){
        if(!validateEmail(this.state.email)){
            Toast.show(forgottexts.validemail);
            return
        }
        this.setState({visible:true});
        let response = await forgotpassword({email:this.state.email});
        this.setState({visible:false});
        let {status, message} = response;
        if(status == 200){
            this.setState({email:''});
        }
        setTimeout( () => {
            Toast.show(message);
        }, 100);

    }

	// Render any loading content that you like here
	render() {
        StatusBar.setBarStyle('light-content', true);

		return (
            <SafeAreaView style={{
                flex: 1,
                backgroundColor:'white'
            }}
        >
            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', marginTop:20}}>
                <TouchableOpacity style={{}} onPress={() => this.props.navigation.goBack()}>
                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={35} color={Color.brownColor} name={"arrow-left"}  />
                </TouchableOpacity>
            </View>
            <Spinner visible={this.state.visible} />
            <KeyboardAwareScrollView contentContainerStyle={{alignItems:'center'}} style={{flex:1}}>
                <View style={{height:50}} />

                <Text style={{textAlign:'center',fontFamily:'IBMPlexSans', fontSize:43, color:Color.brownColor, fontWeight:'bold'}}>{forgottexts.forgotyourpassword}</Text>
                <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:40}}>
                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={25} color={Color.brownColor} name={"email"}  />
                    <TextInput
                    underlineColorAndroid="transparent"
                    placeholder={forgottexts.email}
                    placeholderTextColor={Color.brownColor}
                    style={[CommonStyles.inputFieldL,{flex:1}]}
                    secureTextEntry={false}
                    keyboardType={'default'}
                    onChangeText={email => this.setState({ email })}
                    value={this.state.email}
                    returnKeyType={'next'}
                    />
                </View>
                <TouchableOpacity onPress={()=>this.onForgotClicked()} style={{borderRadius:5,backgroundColor:Color.brownColor,marginTop:40, width:width*80/100, alignSelf:'center', flexDirection:'row', height:45, justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'bold'}}>{forgottexts.resetpassword}</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
            
        </SafeAreaView>
	    );
	}
}
