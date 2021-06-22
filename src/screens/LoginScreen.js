import React,{Component} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet,TextInput, Text, View, StatusBar,Image,Dimensions,Linking, Platform } from 'react-native';
import {logintexts} from '../utils/apptexts'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Spinner from 'react-native-loading-spinner-overlay';
import { Color, Font } from '../styles/config';
import { CheckBox, Icon } from 'react-native-elements';
import { CommonStyles } from '../styles/commonStyles';
import { TouchableOpacity } from 'react-native-gesture-handler';
const { width, height } = Dimensions.get('window');
const GOOGLE = require('../resources/icons/google.png');
const FACEBOOK = require('../resources/icons/fb.png');
const APPLE = require('../resources/icons/apple_signin.png');
import Toast from 'react-native-simple-toast';
import { login, sociallogin, getroles } from '../services';
import AsyncStorage from '@react-native-community/async-storage';
import { resetNavigation } from '../utils/Common'
import ReactNative from 'react-native';
import {FBLogin, FBLoginManager} from 'react-native-facebook-login';
import { GoogleSignin, GoogleSigninButton,statusCodes } from '@react-native-community/google-signin';
import RCTDeviceEventEmitter from 'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import jwt_decode from "jwt-decode";


const styles = StyleSheet.create({
    checkbox: {
        marginRight: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        marginLeft: 0,
    },
});

if(Platform.OS === 'ios'){
    var subscriber = RCTDeviceEventEmitter.addListener(
      FBLoginManager.Events["Login"],
      (eventData) => {
        //console.log("[Login] ", eventData);
      }
    );
  }

export default class LoginScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
            visible:false,
            email:'',
            password:'',
            isstudent:true,
            isProtected:true
		}
    }

    _scrollToInput (reactNode: any) {
        this.scroll.scrollToFocusedInput(reactNode);
    }
    

    onStudentPress(value){
        if(!this.state.isstudent){
            if(this.state.isinstructor){
                this.setState({isinstructor:false});
            }
        }
        this.setState({isstudent:!this.state.isstudent});
    }

    onInstructorPress(value){
        if(!this.state.isinstructor){
            if(this.state.isstudent){
                this.setState({isstudent:false});
            }
        }
        this.setState({isinstructor:!this.state.isinstructor});
    }

    fetchFBEmail(token,userid){
        var api = `https://graph.facebook.com/v2.3/${userid}?fields=name,email,picture&access_token=${token}`;
    
        fetch(api)
          .then((response) => response.json())
          .then((responseData) => {
            this.setState({
                name : responseData.name,
                email: responseData.email,
                userid:userid,
                avatar:responseData.picture.data.url
            });
            if(responseData.email){
              this.loginSocialUser('facebook');
            }else{
              this.setState({email:userid,userid:userid,name:'John Doe'});
              this.loginSocialUser('facebook');
            }
          })
          .done();
    }

    async componentDidMount(){
        await AsyncStorage.setItem('expired','0');

        let response = await getroles({});
        if(response && response.length > 0){
            if(response[0].id){
                await AsyncStorage.setItem('roles',JSON.stringify(response));
                this.setState({roles:response});
                var filteredData = response;
                filteredData = filteredData.filter(function(el) {
                    return el.name == "Solo Alumno";
                });
                await AsyncStorage.setItem('student_role',filteredData[0].id+"");
                this.setState({student_role:filteredData[0].id});

                var filteredData1 = response;
                filteredData1 = filteredData1.filter(function(el) {
                    return el.name == "Instructor";
                });
                this.setState({instructor_role:filteredData1[0].id});

                await AsyncStorage.setItem('instructor_role',filteredData1[0].id+"");
            }
        }

        if(Platform.OS === 'android'){
            await GoogleSignin.configure({ webClientId:"548763831575-3qrmfttjepbbs6r8acn322dqti39b81l.apps.googleusercontent.com", offlineAccess: true });
          }else{
            await GoogleSignin.configure({ webClientId:"548763831575-3qrmfttjepbbs6r8acn322dqti39b81l.apps.googleusercontent.com", offlineAccess: true });
        }
    }

     parseJwt(token){

        var decoded = jwt_decode(token);
        var email = decoded['email'];
        console.log('parsed token::'+JSON.stringify(decoded));

        if(email){
          return email;
        }else{
          return null;
        }
    };

     _signInFB = async () => {
        var ref = this;
        FBLoginManager.loginWithPermissions(["email"], function(error, data){
          if (!error) {
            //console.log("Login data: ", data);
            if(data.credentials){
              ref.setState({isFBLogin:true});
              ref.fetchFBEmail(data.credentials.token,data.credentials.userId);
            }else{
              alert('some error occured');
            }
            //alert("Welcome "+data.credentials.userId);
          } else {
            alert("Error:"+error);
          }
        })
      }

      _signInApple = async () => {

        /*const appleAuthRequestResponse = {fullName:'Harry Mash', email:'apple@apple.com', identityToken:'asdsadas3343'};
        if(appleAuthRequestResponse.fullName!=null){
          await AsyncStorage.setItem('apple_name',appleAuthRequestResponse.fullName);
          await this.setState({name: appleAuthRequestResponse.fullName});
        }else{
            let name = AsyncStorage.getItem('apple_name');
            await this.setState({name});
        }

        if(appleAuthRequestResponse.email!=null){
          await AsyncStorage.setItem('apple_email',appleAuthRequestResponse.email);
          await this.setState({email: appleAuthRequestResponse.email});
        }else{
          let email = AsyncStorage.getItem('apple_email');
          await this.setState({email});
        }

        await this.setState({ userid:appleAuthRequestResponse.identityToken});
        console.log('apple::'+JSON.stringify(appleAuthRequestResponse));
        this.loginSocialUser("apple");*/

        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
  
        try {
        // get current authentication state for user
        const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
  
        // use credentialState response to ensure the user is authenticated
        if (credentialState === appleAuth.State.AUTHORIZED) {
          await this.setState({ userid:appleAuthRequestResponse.user});
          console.log('response::'+JSON.stringify(appleAuthRequestResponse));
          var email = this.parseJwt(appleAuthRequestResponse.identityToken);
          if(email != null){
            await this.setState({ email:email});

            let fullName = appleAuthRequestResponse.fullName;
            if(fullName && fullName!=null){
              var fullNameStr = "";
              if(fullName.givenName!=null){
                fullNameStr = fullName.givenName +" "+ fullName.familyName;
                await AsyncStorage.setItem('apple_name',fullNameStr);
              }else{
                fullNameStr = await AsyncStorage.getItem('apple_name');
              }
              
                await this.setState({name: fullNameStr});
            }else{
                let name = AsyncStorage.getItem('apple_name');
                if(name && name!=null){
                  await this.setState({name: name});
                }else{
                  await this.setState({name: ''});
                }
            }
          }else{
              alert('Not able to fetch your email ID. Please make sure your Apple account has email ID associated with it.')
              console.log('parsed response::'+this.parseJwt(appleAuthRequestResponse.identityToken));
              return
          }

          this.loginSocialUser("apple");

        }
        else{
          
        }
      } catch (error) {
        //alert(JSON.stringify(error));
        if (error.code === "1001") {
          alert('The user canceled the authorization attempt.')
        }
        if (error.code === "1004") {
          alert('The authorization attempt failed.')
  
        }
        if (error.code === "1002") {
          alert('The authorization request received an invalid response.')
        }
        if (error.code === "1003") {
          alert("The authorization request wasn't handled.")
        }
        if (error.code === "1000") {
          alert('The authorization attempt failed for an unknown reason.')
        }
      }
    }
    
      _signInGoogle = async () => {
        try {
          //console.log('_signInGoogle');
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
          this.setState({ email:userInfo.user.email,userid:userInfo.user.id,name:userInfo.user.name, avatar: userInfo.photo });
          //console.log('google::'+JSON.stringify(userInfo));
          this.loginSocialUser("google");
        } catch (error) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (f.e. sign in) is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
          } else {
            // some other error happened
          }
          //console.log('google signinerror:'+JSON.stringify(error));
        }
      };
    
      async loginSocialUser(type){
        this.setState({visible:true});
        let response = await sociallogin({provider:type,email: this.state.email, id: this.state.userid, name: this.state.name, avatar: this.state.avatar ? this.state.avatar:null});
        this.setState({visible:false});

        let {access_token, error, message} = response;
        if(access_token){
            await AsyncStorage.setItem('token',access_token);
            await AsyncStorage.setItem('logintype',type);
            await AsyncStorage.setItem('isStudent', "1");
            await AsyncStorage.setItem('role', 'Solo Alumno');
            await AsyncStorage.setItem('email',this.state.email);
            await AsyncStorage.setItem('type',this.state.isstudent ? 's':'i');

            resetNavigation('Home', {}, this.props);
        }else if(error){
            setTimeout( () => {
            Toast.show(message);
            }, 100);
        }else{
            setTimeout( () => {
            Toast.show(message);
            }, 100);
    
        }
         
      }

      async onLoginClicked(){
        if(this.state.email=='' || this.state.password == ''){
            Toast.show(logintexts.usernamepassworderror);
            return;
        }
        else if(!this.state.isstudent && !this.state.isinstructor){
            Toast.show(logintexts.selectorerror);
            return;
        }
        var selectRole = this.state.student_role;
        if(this.state.isinstructor){
            selectRole = this.state.instructor_role;
        }
        this.setState({visible:true});
        let response = await login({email: this.state.email, password: this.state.password/*, role_id: selectRole*/});
        this.setState({visible:false});

        let {access_token, error, message} = response;
        if(access_token){
            await AsyncStorage.setItem('email',this.state.email);
            await AsyncStorage.setItem('token',access_token);
            await AsyncStorage.setItem('type',this.state.isstudent ? 's':'i');
            await AsyncStorage.setItem('logintype','normal');

            if(response.roles && response.roles.length == 1){
              var roleName = response.roles[0].name;
              await AsyncStorage.setItem('role', roleName);
              if(roleName === 'Solo Alumno'){
                  this.setState({isStudent:true});
                  await AsyncStorage.setItem('isStudent', "1");
              }else{
                  await AsyncStorage.setItem('isStudent', "0");
              }
            }else if(response.roles.length == 2){

                var roles = response.roles;
                var filteredRoles = roles.filter(function(el) {
                    return el.name == 'Instructor';
                });

                if(filteredRoles.length > 0){
                    var rName = filteredRoles[0].name;
                    await AsyncStorage.setItem('role', rName);
                    if(rName === 'Solo Alumno'){
                        await AsyncStorage.setItem('isStudent', "1");
                    }else{
                        await AsyncStorage.setItem('isStudent', "0");
                    }
                }else{
                    var filteredData = response.roles;

                    const currentRole = response.current_role;
                    filteredData = filteredData.filter(function(el) {
                        return el.id == currentRole;
                    });
                    if(filteredData.length > 0){
                        var roleName = filteredData[0].name;
                        await AsyncStorage.setItem('role', roleName);
                        if(roleName === 'Solo Alumno'){
                            await AsyncStorage.setItem('isStudent', "1");
                        }else{
                            await AsyncStorage.setItem('isStudent', "0");
                        }
                    }
                }
                
            }

            resetNavigation('Home', {}, this.props);
        }else if(error){
            setTimeout( () => {
            Toast.show(message);
            }, 100);
        }else{
            setTimeout( () => {
            Toast.show(message);
            }, 100);
    
        }

      }
    
    render() {
        StatusBar.setBarStyle('light-content', true);

		return (
            <SafeAreaView style={{
                flex: 1,
                backgroundColor:'white'
            }}
        >
            <Spinner visible={this.state.visible} />
            <KeyboardAwareScrollView ref={ref => {this.scroll = ref}} showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems:'center',}} style={{flex:1}}>
                <View style={{height:50}} />
                <Text style={{fontFamily:'IBMPlexSans', fontSize:43, color:Color.brownColor, fontWeight:'bold'}}>{logintexts.welcome}</Text>
                {/*<Text style={{marginTop:25,fontFamily:'IBMPlexSans', fontSize:18, color:Color.brownColor}}>{logintexts.selectprofile}</Text>
                <View style={{flexDirection:'row', alignItems:'center', marginTop:30, justifyContent:'center', width:'100%'}}>
                    <CheckBox
                    containerStyle={[styles.checkbox,{margin:0, padding:0}]}
                    title={logintexts.student}
                    iconRight
                    textStyle={[{fontFamily:'IBMPlexSans', fontSize:18, color:Color.brownColor, fontWeight:'normal' , margin:0, padding:0, paddingBottom:3}]}
                    onPress={() => this.onStudentPress()}
                    checked={this.state.isstudent}
                    uncheckedIcon="square-o"
                    checkedColor={"black"}
                    uncheckedColor={"black"}
                    checkedIcon="check-square"
                    size={30}
                    
                    />
                    <View style={{width:30}} />
                    <CheckBox
                    containerStyle={[styles.checkbox,{margin:0, padding:0}]}
                    title={logintexts.instructor}
                    iconRight
                    textStyle={[{fontFamily:'IBMPlexSans', fontSize:18, color:Color.brownColor, fontWeight:'normal' , margin:0, padding:0, paddingBottom:3}]}
                    onPress={() => this.onInstructorPress()}
                    checked={this.state.isinstructor}
                    uncheckedIcon="square-o"
                    checkedColor={"black"}
                    uncheckedColor={"black"}
                    checkedIcon="check-square"
                    size={30}
                    />
                </View>*/}
                <View style={{marginTop:30, width:'100%', alignSelf:'center'}}>
                    <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD',}}>
                        <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={25} color={Color.brownColor} name={"account"}  />

                        <TextInput
                        underlineColorAndroid="transparent"
                        placeholder={logintexts.email}
                        placeholderTextColor={Color.brownColor}
                        style={[CommonStyles.inputFieldL,{flex:1}]}
                        keyboardType={'email-address'}
                        ref={(c) => this.emailInput = c}
                        onChangeText={email => this.setState({ email })}
                        value={this.state.email}
                        returnKeyType={'next'}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                            this.passwordInput.focus();
                        }}
                        onFocus={(event: Event)=> {
                            this._scrollToInput(ReactNative.findNodeHandle(this.emailInput))
                        }}
                        />
                    </View>
                    <View style={{height:25}} />
                    <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD',}}>
                        <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={25} color={Color.brownColor} name={"lock"}  />
                        <TextInput
                        ref={(c) => this.passwordInput = c}
                        underlineColorAndroid="transparent"
                        placeholder={logintexts.password}
                        placeholderTextColor={Color.brownColor}
                        style={[CommonStyles.inputFieldL,{flex:1}]}
                        secureTextEntry={this.state.isProtected}
                        keyboardType={'default'}
                        onChangeText={password => this.setState({ password })}
                        value={this.state.password}
                        returnKeyType={'done'}
                        onFocus={(event: Event)=> {
                            this._scrollToInput(ReactNative.findNodeHandle(this.passwordInput))
                        }}
                        />
                        <TouchableOpacity onPress={()=>this.setState({isProtected:!this.state.isProtected})} style={{alignSelf:'flex-end'}}>
                            <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={20} color={Color.brownColor} name={this.state.isProtected ? "eye-off":"eye"}  />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end', marginTop:15, width:'80%', alignSelf:'center'}}>
                    <Text onPress={()=>this.props.navigation.navigate('ForgotPassword')} style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor}}>{logintexts.forgotmypassword}</Text>
                </View>

                <TouchableOpacity onPress={()=>this.onLoginClicked()} style={{borderRadius:5,backgroundColor:Color.brownColor,marginTop:30, width:width*80/100, alignSelf:'center', flexDirection:'row', height:45, justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'bold'}}>{logintexts.login}</Text>
                </TouchableOpacity>

                <Text style={{flexDirection:'row', alignItems:'center', marginTop: 15, textAlign:'center', width:'90%', alignSelf:'center'}}>
                      <Text style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor}}>Al iniciar sesión, acepta nuestros </Text>
                      <Text onPress={()=>this.props.navigation.navigate('InAppPage',{url:'http://ikmf.upload.com.py/terms_of_use.pdf'})} style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor, fontWeight:'bold', textDecorationLine:'underline'}}>términos de uso</Text>
                      <Text style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor}}> y </Text>
                      <Text onPress={()=>this.props.navigation.navigate('InAppPage',{url:'http://kravmaga.com.py/privacidad/'})} style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor, fontWeight:'bold', textDecorationLine:'underline'}}>política de privacidad</Text>
                </Text>
                
                {Platform.OS === 'android' && 
                <Text style={{fontFamily:'IBMPlexSans', fontSize:12, color:Color.brownColor, fontWeight:'bold', marginTop:40}}>{logintexts.connectwith}</Text>
                }
                
                <View style={{flexDirection:'row', width:'100%', alignItems:'center', justifyContent: 'center', marginTop:30, marginBottom:20}}>
                    <TouchableOpacity onPress={()=>this._signInGoogle()} style={{}}><Image style={{width:35, height:35}} source={GOOGLE} /></TouchableOpacity>
                    <View style={{width:20}} />
                    <TouchableOpacity onPress={()=>this._signInFB()} style={{}}><Image style={{width:35, height:35}} source={FACEBOOK} /></TouchableOpacity>
                    {Platform.OS === 'ios' && appleAuth.isSupported &&
                        <View style={{flexDirection:'row'}}>
                            <View style={{width:20}} />
                            <TouchableOpacity onPress={()=>this._signInApple()} style={{}}><Image style={{width:35, height:35}} source={APPLE} /></TouchableOpacity>
                        </View>
                    }
                </View>
                
                <Text style={{fontFamily:'IBMPlexSans', fontSize:12, color:Color.brownColor, fontWeight:'normal', marginTop:10}}>{logintexts.donthaveaccount}</Text>
                <Text onPress={()=>this.props.navigation.navigate('Register')} style={{fontFamily:'IBMPlexSans', fontSize:12, color:Color.brownColor, fontWeight:'bold', marginTop:5}}>{logintexts.createaccount}</Text>

            </KeyboardAwareScrollView>
        </SafeAreaView>
	    );
	}
}