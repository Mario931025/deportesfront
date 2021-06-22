import React,{Component, Fragment} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet, Text, View, StatusBar,Image,Dimensions,Linking, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import { resetNavigation, getDate } from '../utils/Common'
import { Color, Font } from '../styles/config';
import {menutexts, commontexts, registertexts} from '../utils/apptexts'
import QRCode from 'react-native-qrcode-generator';
//import Geolocation from '@react-native-community/geolocation';
import {check, PERMISSIONS, RESULTS, openSettings} from 'react-native-permissions';
import Permissions from 'react-native-permissions';
import { getassistancecode, registerattendance } from '../services';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { CheckBox, Icon } from 'react-native-elements';
import BottomBar from './BottomBar'
import { BlurView } from '@react-native-community/blur';
import BlurOverlay,{closeOverlay,openOverlay} from 'react-native-blur-overlay';
const STUDENT = require('../resources/icons/student_cap.png');
import GeneralStatusBarColor from '../utils/GeneralStatusBarColor';
import Geolocation from 'react-native-geolocation-service';

import Dialog, { SlideAnimation, DialogContent, FadeAnimation } from 'react-native-popup-dialog';
const fadeAnimation = new FadeAnimation({ animationDuration: 150 });
const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});


const styless = StyleSheet.create({
    checkbox: {
        marginRight: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        marginLeft: 0,
    },
});

export default class RegisterAttendance extends Component {
	constructor(props) {
		super(props);
		this.state = {
            qrtext:'',
            visible:true,
            isexam:false,
            isStudent:this.props.navigation.state.params.isStudent,
            isStudentV:false,
            isRegistered:false,
            registeredDialogShowing:false,
            registeredDate:'Jul/15/2020',
            registeredStudent:'Will Smith'
        }
        
        this.success = this.success.bind(this);
        this.error = this.error.bind(this);

    }

    onExamPress(){
        this.setState({isexam:!this.state.isexam});
    }

    async getLocation(){
        await Geolocation.setRNConfiguration({skipPermissionRequests:false,authorizationLevel:'whenInUse'});
        if(Platform.OS === 'ios'){
          await Geolocation.requestAuthorization("whenInUse");
        }
        var ref = this;
        const options = {
            enableHighAccuracy: true, timeout: 15000, maximumAge: 10000
        };

        setTimeout( () => {
            ref.setState({visible:true});
            Geolocation.getCurrentPosition(ref.success, ref.error, options);
        }, 1000);
    
    }

    reactivateScanner(){
        this.scanner.reactivate()
    }

    showRegisterAlert(title, message){
        Alert.alert(
            title,
            message,
            [
              {
                text: commontexts.ok,
                onPress: () => this.reactivateScanner(),
                style: "cancel"
              },
            ],
            { cancelable: false }
          );
    }
    
    success(pos) {
        var crd = pos.coords;
        this.setState({coordinates:crd});
        if(this.state.isStudent){
            this.generateQRCode(crd);
        }else{
            this.setState({visible:false});
        }
    };

    onCloseOverlay(){
        closeOverlay();
        this.scanner.reactivate();
    }

    seeResults(){
        this.onCloseOverlay();
        this.props.navigation.navigate('Search');
    }

    renderBlurChilds() {
        return (
          <View style={{flex:1}}>
            <View style={{height:100}} />
            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', justifyContent:'flex-end',}}>
                <Icon onPress={()=>this.onCloseOverlay()} style={{backgroundColor:'transparent'}} type={Font.TypeIonIcons} size={30} color={Color.whiteColor} name={"md-close-circle-outline"}  />
            </View>
            <View style={{flex:1, marginTop:100, alignItems:'center'}}>
                <View style={{backgroundColor:Color.brownColor, width:140, height:140, borderRadius:70, justifyContent:'center', alignItems:'center', borderColor:'white', borderWidth:5}}>
                    <Icon style={{backgroundColor:'transparent'}} name={'check'} size={100} type={Font.TypeMaterialIcons} color="white"/>
                </View>
                <Text style={{fontFamily:'IBMPlexSans', fontSize:28, color:Color.whiteColor, fontWeight:'bold', marginTop:40}}>{registertexts.registered}</Text>
                <View style={{height:30}} />
                <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialIcons} size={20} color={Color.white} name={"calendar-today"}  />
                    <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'normal', marginLeft:10}}>{this.state.registeredDate}</Text>
                </View>
                <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                    <Image style={{width:20, height: 20}} source={STUDENT}/>
                    <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'normal', marginLeft:10}}>{commontexts.student+": "+this.state.registeredStudent}</Text>
                </View>

                <TouchableOpacity onPress={()=>this.seeResults()} style={{borderRadius:5,marginTop:30,flexDirection:'row', width:'70%', alignSelf:'center', height:45, backgroundColor:'white', justifyContent: 'center', alignItems:'center'}}>
                    <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.black, fontWeight:'bold'}}>{commontexts.seeresults}</Text>
                </TouchableOpacity>
            </View>
          </View>
        );
    }

    onSuccess = async e => {
        var data = e.data;
        /*if(!this.state.coordinates){
            setTimeout( () => {
                Toast.show(commontexts.locationerror, Toast.LONG);
            }, 100);
            return
        }*/
        this.setState({visible: true});
        let response = await registerattendance({isexam: this.state.isexam, code: data, /*latitude: this.state.coordinates.latitude, longitude: this.state.coordinates.longitude*/}, this.props)
        this.setState({visible: false});
        var ref = this;
        let { status, message, code, errors, errorText } = response;
        if(status == 200){
            setTimeout( () => {
                ref.setState({registeredDate:getDate(response.student_user), registeredStudent: response.student_user.name+' '+response.student_user.last_name})
                //this.reactivateScanner();
                openOverlay();
                //this.showRegisterAlert(commontexts.success, message);
            }, 100);
        }else{
            if(errors){
                //this.reactivateScanner();
                this.setState({errors:true});
                setTimeout( () => { 
                    if(errorText){
                       //Toast.show(errorText, Toast.LONG);
                       this.showRegisterAlert(commontexts.error, errorText);
                    }else{
                        //Toast.show(message, Toast.LONG);
                        this.showRegisterAlert(commontexts.error, message);
                    }
                }, 100);
            }else{
                setTimeout( () => { 
                    //Toast.show(message, Toast.LONG);
                    this.showRegisterAlert(commontexts.error, message);
                }, 100);
            }
        }
    };

    async generateQRCode(crd){
        let response = await getassistancecode({/*latitude: crd.latitude, longitude: crd.longitude*/}, this.props);
        this.setState({ visible: false})
        let { status, message, code} = response;
        if(status == 200){
            this.setState({qrtext: code});
        }else{
            let {errors, message, errorText} = response;
            if(errors){
                this.setState({errors:true});
                setTimeout( () => {
                    if(errorText){
                        Toast.show(errorText, Toast.LONG);
                    }else{
                        Toast.show(message, Toast.LONG);
                    }
                }, 100);
            }
        }
    }
    
    error(err) {
        this.setState({ visible: false})
        Toast.show(commontexts.locationerror);
    };

    showPermissionError(){
		var message = "Habilite el permiso de ubicación para que la asistencia al registro funcione";
		if(Platform.OS === 'ios'){
			message = "Habilite el permiso de ubicación para que la asistencia al registro funcione";
		}
		Alert.alert(
			"Error de permiso",
			message,
			[
			  { text: "OK", onPress: () => {openSettings().catch(() => console.warn('cannot open settings')) } }
			],
			{ cancelable: false }
		  );
	}

    checkForLocationPermission = () => {

		var permission = null;
		if(Platform.OS === 'ios'){
			permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
		}else{
			permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
			/*this._pickImage();
			return;*/
		}

		check(permission)
		.then((result) => {
			switch (result) {
			case RESULTS.UNAVAILABLE:
				//console.log('This feature is not available (on this device / in this context)',);
				break;
			case RESULTS.DENIED:
				//if(Platform.OS === 'ios'){
					Permissions.request(permission).then(() => this.checkForLocationPermission())
					.catch((error) => console.error(error));
				//}
				//console.log('The permission has not been requested / is denied but requestable',);
				break;
			case RESULTS.GRANTED:
				//console.log('The permission is granted');
				this.getLocation();
				break;
			case RESULTS.BLOCKED:
				this.showPermissionError();
				//console.log('The permission is denied and not requestable anymore');
				break;
			}
		})
		.catch((error) => {
			// …
			alert(error)
		});
	}


	async componentDidMount() {
        this.setState({visible:true});

        if(Platform.OS === 'ios'){
            //this.getLocation()
        }

        var ref = this;
        if(this.state.isStudent){
            this.generateQRCode(null);
        }else{
            this.setState({visible:false});
        }
        /*setTimeout( () => {
            ref.setState({visible:false});
            ref.checkForLocationPermission();
        }, 3000);*/

        let value = await AsyncStorage.getItem('isStudent');
        if(value == "1"){
            this.setState({isStudentV: true});
        }
	}

	// Render any loading content that you like here
	render() {
        StatusBar.setBarStyle('light-content', true);

		return (
            <View style={{flex:1}}>
            <Fragment>
                <SafeAreaView style={{ flex:0, backgroundColor: Color.brownColor}} />
                <SafeAreaView style={{
                    flex: 1,
                    backgroundColor:Color.brownColor
                }}>

                <View style={{flex:1, backgroundColor:Color.white}}>
                    <Spinner visible={this.state.visible} />
                    <View style={{width:'100%', backgroundColor:Color.brownColor, height:60, zIndex:999}}>
                        <View style={{flexDirection:'row', width:'85%', alignSelf:'center', alignItems:'center', height:'100%'}}>
                            <TouchableOpacity style={{}} onPress={()=>this.props.navigation.goBack()}>
                                <Icon name="keyboard-backspace" size={30} type={Font.TypeMaterialIcons} color={Color.whiteColor}/>
                            </TouchableOpacity>
                            <Text numberOfLines={2} style={{fontFamily:'IBMPlexSans', fontSize:20, color:Color.whiteColor, fontWeight:'bold', marginLeft:10, marginRight:10}}>{this.props.navigation.state.params.title}</Text>
                        </View>
                    </View>
                    <View style={{}}>
                        {this.state.qrtext!='' && this.state.isStudent &&
                        <View style={{alignItems:'center', marginTop:50}}>
                            <QRCode
                            value={this.state.qrtext}
                            style={{}}
                            size={250}
                            bgColor='black'
                            fgColor='white'/>
                        </View>
                        }

                        {!this.state.isStudent &&
                            <View style={{marginTop:50}}>
                                <View style={{width:300, height:380, alignSelf:'center'}}>
                                    <QRCodeScanner
                                        ref={(node) => { this.scanner = node }}
                                        onRead={this.onSuccess}
                                        flashMode={RNCamera.Constants.FlashMode.off}
                                        cameraStyle={{width:300, height:250, alignSelf:'center', zIndex:-2}}
                                    />
                                    <View style={{height:30}} />
                                    <CheckBox
                                        containerStyle={[styless.checkbox,{margin:0, padding:0}]}
                                        title={commontexts.exam}
                                        iconLeft
                                        textStyle={[{fontFamily:'IBMPlexSans', fontSize:18, color:Color.brownColor, fontWeight:'normal' , margin:0, padding:0, paddingBottom:3}]}
                                        onPress={() => this.onExamPress()}
                                        checked={this.state.isexam}
                                        uncheckedIcon="square-o"
                                        checkedColor={"black"}
                                        uncheckedColor={"black"}
                                        checkedIcon="check-square"
                                        size={30}
                                        
                                        />
                                </View>
                                
                            </View>
                        }
                    </View>
                    {/*
                    <TouchableOpacity onPress={()=>openOverlay()} style={{borderRadius:5,backgroundColor:Color.brownColor,marginTop:40, width:width*70/100, alignSelf:'center', flexDirection:'row', height:45, justifyContent:'center', alignItems:'center'}}>
                        <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'bold'}}>{commontexts.captureqrcode}</Text>
                    </TouchableOpacity>
                    */}
                    <BottomBar properties={this.props} isStudent={this.state.isStudentV} />
                </View>
                </SafeAreaView>
                <BlurOverlay
                    radius={50}
                    downsampling={2}
                    brightness={-100}
                    onPress={() => {
                    }}
                    customStyles={{alignItems: 'center', justifyContent: 'center', flex:1}}
                    blurStyle="dark"
                    children={this.renderBlurChilds()}
                />
            </Fragment>
            </View>
	    );
	}
}
