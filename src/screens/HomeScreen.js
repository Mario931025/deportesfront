import React,{Component, Fragment} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet, Text, View, StatusBar,Image,Dimensions,Linking, TouchableOpacity, ImageBackground, Alert, Platform } from 'react-native';
const MENU = require('../resources/icons/menu.png');
const PERSON = require('../resources/icons/placeholder_icon.jpg');
const STUDENT = require('../resources/icons/student_cap.png');
const moment = require('moment');

import { Color, Font } from '../styles/config';
import { Icon } from 'react-native-elements';
import SafeArea, { type SafeAreaInsets } from 'react-native-safe-area';
const { width, height } = Dimensions.get('window');
import {hometexts, footertexts, logintexts, registertexts, commontexts} from '../utils/apptexts'
import {ANDROID_SUB, IOS_SUB} from '../utils/Common'

const ATTENDANCE = require('../resources/icons/attendance.png');
const RIGHTARROW = require('../resources/icons/rightarrow_home.png');
const PERSONLOGO = require('../resources/icons/person.png');
const STUDENTCAP = require('../resources/icons/student_cap_black.png');
import BlurOverlay,{closeOverlay,openOverlay} from 'react-native-blur-overlay';
import messaging from '@react-native-firebase/messaging';
import {check, PERMISSIONS, RESULTS, openSettings} from 'react-native-permissions';
import Permissions from 'react-native-permissions';
import { getprofile, getroles, storetoken, getsubscription, postsubscription, cancelsubscription, getsubscriptiondata, logoutUser, starttrial } from '../services';
import Toast from 'react-native-simple-toast';
import Modal, { ModalContent } from 'react-native-modals';

import Drawer from 'react-native-drawer'
import MenuScreen from './MenuScreen'
import BottomBar from './BottomBar'
import Spinner from 'react-native-loading-spinner-overlay';
import Dialog, { SlideAnimation, DialogContent, FadeAnimation } from 'react-native-popup-dialog';
import AsyncStorage from '@react-native-community/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
const fadeAnimation = new FadeAnimation({ animationDuration: 150 });
const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});
const drawerStyles = {
    drawer: { shadowColor: '#FFFFFF', shadowOpacity: 1.0, shadowRadius: 0, backgroundColor:'white'},
    main: {paddingRight: 0},
}
const INITTEXT = "La Aplicación de Krav Maga Latinoamérica le facilita el registro de asistencias, consultar su historial, y ver sus promociones.\nPara empezar a disfrutar de estas funciones por favor indique su tipo de suscripción."
const TRIALEXPIREDTEXT = "El periodo de prueba gratuito a culminado, para seguir disfrutando de las funciones de la aplicación de Krav Maga Latinoamérica por favor suscríbase al plan anual. periodo";
const LOGO = require('../resources/images/IKMF_logo.png');
const LOGOWIDTH = 40;
const LOGOHEIGHT = 0.916 * LOGOWIDTH;



const itemSubs = Platform.select({
    ios: [
        IOS_SUB
    ],
    android: [
        ANDROID_SUB
    ],
  });
let purchaseUpdateSubscription;
let purchaseErrorSubscription;

import RNIap, {
    InAppPurchase,
    PurchaseError,
    SubscriptionPurchase,
    acknowledgePurchaseAndroid,
    consumePurchaseAndroid,
    finishTransaction,
    finishTransactionIOS,
    purchaseErrorListener,
    purchaseUpdatedListener,
  } from 'react-native-iap';

export default class HomeScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
            topinsets:0,
            bottominsets:0,
            fromMenu:false,
            midHeight:0,
            visible:false,
            role:'',
            grade:'',
            firstname:'',
            lastname:'',
            photo:'',
            isStudent:false,
            registerDialogShowing:false,
            inAppDialogshowing:false,
            isTrialExpired:false,
            productList: [],
            receipt: '',
            availableItemsMessage: '',
            localizedPrice:'',
            closeShown:false,
            days:3,
            allowed:true,
            iscancelallowed:true,
            isBuyClicked:false,
            trialperiod:'',
            paidperiod:'',
            duration:'',
            localizedTitle:'Suscripción mensual',
            periodText:'Período - ',
        }
        
        this.reRenderSomething = this.props.navigation.addListener('willFocus', () => {
            this.loadProfile();
         });
    }

    showCancelSubError(message){
        Alert.alert(
            "Error",
            message,
            [
              { text: "OK", style:'cancel', onPress: () => { } },
            ],
            { cancelable: false }
          );
    }

    showCancelSubAlert(){
        var store = "Google Play";
        if(!this.state.iscancelallowed){
            if(Platform.OS === 'ios'){
                store = "Apple";
            }
            this.showCancelSubError('No hay ninguna suscripción asociada a su cuenta de '+store+'. Cambie la cuenta de '+store+' de este dispositivo o utilice el dispositivo desde el que compró la suscripción para cancelarla.');
            return;
        }

        if(this.state.expiration_date!=null){
            var expDate = this.state.expiration_date;
            //console.log('expiration ::'+expDate)
            var dateString = moment(+expDate).format("DD-MM-YYYY");

            //console.log('dateString ::'+dateString)

            let message = commontexts.areyousure+" "+dateString;
            Alert.alert(
                "Cancelar suscripción",
                message,
                [
                  { text: "No", style:'cancel', onPress: () => { } },
                  { text: "Si", onPress: () => this.cancelSubscription() }
    
                ],
                { cancelable: false }
              );
        }
    }

    showSubError(message){
        Alert.alert(
            "Error",
            message,
            [
              { text: "OK", style:'cancel', onPress: () => { } },
              { text: "SIGN OUT", onPress: () => this.logout() }

            ],
            { cancelable: false }
          );
    }

    async logout(){
        this.setState({visible: true, inAppDialogshowing:false});
        await logoutUser({},this.props);
        this.setState({visible: false});
    
    }

    openSubscription(){
        this.setState({inAppDialogshowing:true, fromMenu:true});
    }

    showPermissionError(){
        var message = "Acepta el permiso de ubicación";
        if(Platform.OS === 'ios'){
            message = "Acepta el permiso de ubicación";
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
				break;
			case RESULTS.BLOCKED:
				//this.showPermissionError();
				//console.log('The permission is denied and not requestable anymore');
				break;
			}
		})
		.catch((error) => {
			// …
			alert(error)
		});
    }
    
    async submitDeviceToken(){
        const authorizationStatus = await messaging().hasPermission();
    
        if (authorizationStatus == messaging.AuthorizationStatus.AUTHORIZED) {
          const fcmToken = await messaging().getToken();
          let response = await storetoken({device_token:fcmToken},this.props);
        }
    }

    async handleInApps(){
        try {
            const result = await RNIap.initConnection();
            await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
            //console.log('result', result);
            } catch (err) {
            console.warn(err.code, err.message);
        }
        var ref = this;
        purchaseUpdateSubscription = purchaseUpdatedListener( async (purchase: ProductPurchase) => {
              //console.log('purchaseUpdateSubscription::'+JSON.stringify(purchase));
              const receipt = purchase.transactionReceipt;

              if (receipt) {
                try {
                    if(Platform.OS === 'ios'){
                        await this.setState({transactionId: purchase.transactionId, receipt: JSON.stringify(purchase)});
                    }else{
                        await this.setState({purchase});
                        
                    }
                  // if (Platform.OS === 'ios') {
                  //   finishTransactionIOS(purchase.transactionId);
                  // } else if (Platform.OS === 'android') {
                  //   // If consumable (can be purchased again)
                  //   consumePurchaseAndroid(purchase.purchaseToken);
                  //   // If not consumable
                  //   acknowledgePurchaseAndroid(purchase.purchaseToken);
                  // }
                  //Call server Api
                // this._sendPurchaseDataToServer(receipt, purchase);
                  
                  //const ackResult = await finishTransaction(purchase, true, this.state.userid+"");
                  
                } catch (ackErr) {
                  console.warn('ackErr', ackErr);
                }
                if(Platform.OS === 'ios'){
                    this.goNext();
                }else{
                    this.setState({receipt}, () => this.goNext());
                }
              }
            },
          );
      
          purchaseErrorSubscription = purchaseErrorListener(async (error: PurchaseError) => {
              //console.log('purchaseErrorListener', error);
              ref.setState({isBuyClicked:false});

              //Alert.alert('Purchase Error:', JSON.stringify(error));
              //ref.setState({inAppDialogshowing:false});
            },
          );
    }

    goNext = async () => {
        if(!this.state.isBuyClicked){
            return;
        }
        this.setState({isBuyClicked:false});
        //console.log('receipt::' + this.state.receipt)
        //Alert.alert('Receipt', this.state.receipt);
        var receipt;
        receipt = JSON.parse(this.state.receipt);
        await AsyncStorage.setItem('receipt', this.state.receipt);

        this.setState({visible:true});
        //let { orderId, purchaseTime, purchaseState, purchaseToken, acknowledged} = this.state.receipt;
        var response;
        if(Platform.OS === 'android'){
            response = await postsubscription({purchase_date:receipt.purchaseTime,plataform: Platform.OS.toLowerCase(), receipt: 'receipt',
            raw_data: 'receipt', order_id: receipt.orderId, purchase_token: receipt.purchaseToken, subscription_id: Platform.OS === 'android' ? ANDROID_SUB : IOS_SUB, package_name:"com.app.ikmf"},this.props);
        }else{
            response = await postsubscription({purchase_date:receipt.transactionDate,plataform: Platform.OS.toLowerCase(), receipt: receipt.transactionId,
            raw_data: receipt.transactionReceipt, order_id: receipt.transactionId, purchase_token: receipt.originalTransactionIdentifierIOS ? receipt.originalTransactionIdentifierIOS:receipt.transactionId, subscription_id: Platform.OS === 'android' ? ANDROID_SUB : IOS_SUB, package_name:"com.app.ikmf"},this.props);
        }
                ////console.log('subscription response::'+JSON.stringify(response));

        let { status, subscription } = response;
        if(status == 200){
            AsyncStorage.setItem('receipt', '');
            if(Platform.OS === 'ios'){
                if(receipt.transactionId){
                    finishTransactionIOS(receipt.transactionId);
                    RNIap.clearTransactionIOS();
                }
            }else{
                if(this.state.purchase){
                    const ackResult = await finishTransaction(this.state.purchase);
                    //console.log('ackResult::'+JSON.stringify(ackResult));
                }
            }
            if(subscription){
                var expiration_date = subscription['expiration_date'];
                var today = new Date().getTime();

                if(expiration_date!=null && today < expiration_date){
                    await AsyncStorage.setItem('expired','0');
                }else{
                    if(expiration_date!=null){
                        await AsyncStorage.setItem('expired','1');
                    }
                }
            }
        }
        var ref = this;
        setTimeout( () => {
            ref.setState({inAppDialogshowing:false, visible: false});
        }, 500);
    };


    requestSubscription = async (sku) => {
        //console.log('ids::'+this.state.email+","+this.state.userid)
        try {
          RNIap.requestSubscription(sku, true, '', '', '', this.state.userid+"", this.state.userid+"");
          this.setState({isBuyClicked: true});
        } catch (err) {
          //console.log('requestSubscriptionerror::'+err.message)
          Alert.alert(err.message);
        }
    };    

    componentWillUnmount = () => {
        if (purchaseUpdateSubscription) {
          purchaseUpdateSubscription.remove();
          purchaseUpdateSubscription = null;
        }
        if (purchaseErrorSubscription) {
          purchaseErrorSubscription.remove();
          purchaseErrorSubscription = null;
        }
        RNIap.endConnection();
    }

    async componentDidMount(){
        

        var ref = this;
        setTimeout( () => {
            //ref.checkForLocationPermission();
        }, 3000);

        await messaging().requestPermission();
        await messaging().subscribeToTopic('all').then(() => {});

        var ref = this;
		SafeArea.getSafeAreaInsetsForRootView()
			.then((result) => {
			////console.log(result);
			var topinsets = result.safeAreaInsets.top;
			var bottominsets = result.safeAreaInsets.bottom;

			ref.setState({topinsets:topinsets,bottominsets:bottominsets});
            var midHeight = height - (topinsets + bottominsets + 20 + 95 + 30);
            ref.setState({midHeight: midHeight, boxHeight: 150});
        })
        
        this.setState({visible: true});
        await this.loadRoles();
        await this.loadProfile();
        this.setState({visible: false});

        setTimeout( () => {
            this.submitDeviceToken();
          }, 5000);

        //await this.handleSubscriptions();
        
        if(this.state.isStudent){
            await this.handleInApps();
            await this.getSubscriptions();
            
            var ref = this;
            let receipt = await AsyncStorage.getItem('receipt');
            if(receipt && receipt!=''){
                await this.setState({receipt, isBuyClicked: true});

                setTimeout( () => {
                    this.goNext();
                }, 3000);
            }
        }
        
        
    }

    async handleSubscriptions(){
        let response = await getsubscription({plataform: Platform.OS.toLowerCase()}, this.props);
        let { trial_expired, disabled, plataform, receipt, expiration_date, trial_expiration_date, trialperiod, paidperiod, duration} = response;
        var today = new Date().getTime();
        const format = "YYYY-MM-DD HH:mm:ss";
        var isSubscriptionExpired = false;

        
        this.setState({ trialperiod, paidperiod, duration });

        if(trial_expiration_date == null && expiration_date == null){
            isSubscriptionExpired = true;
            trial_expired = false;
            this.setState({inAppDialogshowing: true, isSubscriptionExpired, isTrialExpired:false});
            return;
        }


        if(trial_expired && expiration_date == null){
            this.setState({inAppDialogshowing: true});
        }else{
            this.setState({inAppDialogshowing: false});
        }


        if(expiration_date == null || today > expiration_date){
            if(expiration_date == null && trial_expired){
                isSubscriptionExpired = true;
            }

            if(expiration_date!=null && today > expiration_date){
                trial_expired = true;
                isSubscriptionExpired = true;
            }else{
                isSubscriptionExpired = false;
            }
        }

        if(isSubscriptionExpired){
            //console.log('isSubscriptionExpired')
            this.setState({inAppDialogshowing: true});
            await AsyncStorage.setItem('expired','1');
        }else{
            if(trial_expiration_date == null && isSubscriptionExpired){
                trial_expired = false;
                await AsyncStorage.setItem('expired','1');
                this.setState({inAppDialogshowing:true});
            }
        }
        
        await this.setState({isTrialExpired: trial_expired, expiration_date: expiration_date, isSubscriptionExpired});
    }

    async cancelSubscription(){
        if(Platform.OS === 'android'){
            const SKU = ANDROID_SUB;
            const PACKAGENAME = 'com.app.ikmf';
            Linking.openURL('https://play.google.com/store/account/subscriptions?sku='+SKU+'&package='+PACKAGENAME);
            /*this.setState({visible:true});
            let response = await cancelsubscription({plataform:Platform.OS.toLowerCase()}, this.props);
            this.setState({visible:false, isDrawerOpen:false});
            let { status } = response;
            if(status == 200){
                setTimeout( () => {
                    Toast.show(commontexts.subscriotioncancelled, Toast.LONG);
                }, 100);
            }else{
                setTimeout( () => {
                    Toast.show(commontexts.subscriptioncancelerror,Toast.LONG);
                }, 100);
            }*/
        }else{
            // open url for iOS
            Linking.openURL('https://apps.apple.com/account/subscriptions');
        }
        
        ////console.log('cancelSubscription:'+JSON.stringify(response));
    }

    buySubscription(){
        var store = "Google Play";
        if(this.state.allowed == false){
            if(Platform.OS === 'ios'){
                store = "Apple";
            }
            this.showSubError('Su cuenta de '+store+' ya tiene una suscripción activa con un usuario de aplicación diferente '+ this.state.inAppEmail + '. Cambie la cuenta principal de '+store+' o inicie sesión con ' + this.state.inAppEmail)
            return;
        }
        var productList = this.state.productList;
        if(productList.length > 0){
            this.requestSubscription(productList[0].productId);
        }else{
            var ref = this;
            setTimeout( () => {
                //ref.setState({inAppDialogshowing:false});
                Toast.show('No se encontró ninguna suscripción. Comuníquese con el desarrollador de la aplicación');
            }, 100);
            
        }
    }

    getPurchaseHistory = async () => {
        var products = this.state.productList;
        if(products.length > 0){
            var sub = products[0];
            let purchaseHistory = await RNIap.getPurchaseHistory();
            //console.log("purchaseHistory length::"+purchaseHistory.length)

            if(purchaseHistory.length == 0){
                this.setState({iscancelallowed:false});
            }

            for(var i = 0;i<purchaseHistory.length;i++){
                var purchaseData = purchaseHistory[i];
                //console.log("purchasedata::"+JSON.stringify(purchaseData));
                var purchaseToken;
                if(Platform.OS === 'android'){
                    purchaseToken = purchaseData['purchaseToken'];
                }else{
                    purchaseToken = purchaseData['originalTransactionIdentifierIOS'];
                }
                //console.log("purchaseToken::"+purchaseToken)
                let data = await getsubscriptiondata({plataform:Platform.OS.toLowerCase(), purchase_token: purchaseToken, package_name:'com.app.ikmf', subscription_id: Platform.OS === 'ios'? IOS_SUB : ANDROID_SUB}, this.props);
                let {obfuscated_external_profile_id, name, last_name, email, status, expiryTimeMillis} = data;
                if(status == 200 && obfuscated_external_profile_id){
                    var today = new Date().getTime();
                    //console.log('inside:');
                    if(today < expiryTimeMillis){
                        //console.log('inside::');
                        if(this.state.userid != obfuscated_external_profile_id){
                            //console.log('inside:::');
                            this.setState({allowed:false, inAppName: name, inAppLastName: last_name, inAppEmail: email});
                            break;
                        }
                    }
                }
            }
        }
    }

    getSubscriptions = async () => {
        try {
          const products = await RNIap.getSubscriptions(itemSubs);
          console.log('Products:', products);
          await this.setState({productList: products});
          if(products.length > 0){
            const localizedPrice = products[0].localizedPrice;
            this.setState({ localizedPrice, localizedTitle: products[0].title });
            this.getPurchaseHistory();
          }else{
              this.setState({localizedPrice: '$1.49'});
          }
        } catch (err) {
            this.setState({localizedPrice: '$1.49'});
            console.log("err.code", err.code+" "+err.message);
        }
    };

    async trialPeriodClicked(){
        this.setState({visible: true});
        let response = await starttrial({plataform:Platform.OS.toLowerCase()}, this.props);
        this.setState({visible: false});

        let {status} = response;
        if(status == 200){
            this.setState({inAppDialogshowing: false});
        }else{
            setTimeout( () => {
                Toast.show(commontexts.trialerror);
            }, 100);
            
        }
    }

    async loadRoles(){
        let response = await getroles({});
        if(response && response.length > 0){
            if(response[0]['id']){
                await this.setState({roles:response});
            }
        }
    }

    async loadProfile(){
        var role = await AsyncStorage.getItem('role');
        var isStudentVal = await AsyncStorage.getItem('isStudent');
        await this.setState({isStudent: isStudentVal == "0" ? false:true, role:role});
        let response = await getprofile({}, this.props);

        let { status } = response;
        let {errors, message, errorText} = response;
        if(status == 200){
            this.setState({ photo: response.profile_photo == 'http://ikmf.upload.com.py/storage' ? '':response.profile_photo,firstname: response.name, lastname: response.last_name && response.last_name!=null ? response.last_name:'',
            grade: response.grade!=null ? response.grade.name:'', email:response.email, userid: response.id, academy: (response.academy && response.academy!=null) ? response.academy?.name:''});

        }else{
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
        setTimeout( () => {
            //Toast.show(message);
        }, 100);
        
        if(this.state.isStudent){
            this.handleSubscriptions();
        }
    }

    async registerPress(isStudent){

        closeOverlay();
        this.setState({registerDialogShowing: false});

        var expired = await AsyncStorage.getItem('expired');
        if(expired == "1"){
            this.setState({inAppDialogshowing:true});
            return;
        }
        this.props.navigation.navigate('RegisterAttendance',{ isStudent: isStudent, title: isStudent ? hometexts.registerattendance : hometexts.takestudentattendance});
    }

    async openRegisterAsStudent(){
        var expired = await AsyncStorage.getItem('expired');
        if(expired == "1"){
            this.setState({inAppDialogshowing:true});
            return;
        }
        this.props.navigation.navigate('RegisterAttendance',{ isStudent: true, title: hometexts.registerasstudent});
    }

    async openRegisterAttendance(){
        var expired = await AsyncStorage.getItem('expired');
        if(expired == "1"){
            this.setState({inAppDialogshowing:true});
            return;
        }
        this.props.navigation.navigate('RegisterAttendance',{ isStudent: this.state.isStudent, title: this.state.isStudent ? hometexts.registerattendance : hometexts.takestudentattendance});
    }

    async seeRecords(){
        var expired = await AsyncStorage.getItem('expired');
        if(expired == "1"){
            this.setState({inAppDialogshowing:true});
            return;
        }
        this.props.navigation.navigate('Records');
    }

    renderBlurChilds() {
        return (
          <View style={{flex:1}}>
            <View style={{height:100}} />
            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', justifyContent:'flex-end',}}>
                <Icon onPress={()=>closeOverlay()} style={{backgroundColor:'transparent'}} type={Font.TypeIonIcons} size={30} color={Color.whiteColor} name={"md-close-circle-outline"}  />
            </View>
            <View style={{flex:1, marginTop:100, alignItems:'center'}}>
                <Text style={{fontFamily:'IBMPlexSans', fontWeight:'bold', fontSize:24, color:Color.whiteColor}}>{hometexts.registerattendance}</Text>
                <TouchableOpacity onPress={()=>this.registerPress(false)} style={{backgroundColor:'white', borderRadius: 10, width:100, height:100, marginTop:50, justifyContent:'center', alignItems:'center'}}>
                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeIonIcons} size={20} color={Color.black} name={"person-outline"}  />
                    <Text style={{fontFamily:'IBMPlexSans', fontWeight:'normal', fontSize:14, color:Color.black, marginTop:10}}>{logintexts.instructor}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>this.registerPress(true)} style={{backgroundColor:'white', borderRadius: 10, width:100, height:100, marginTop:30, justifyContent:'center', alignItems:'center'}}>
                    <Image style={{width: 24, height:15}} source={STUDENTCAP} />
                    <Text style={{fontFamily:'IBMPlexSans', fontWeight:'normal', fontSize:14, color:Color.black, marginTop:10}}>{logintexts.student}</Text>
                </TouchableOpacity>
            </View>
          </View>
        )
    }

    toggleDrawer = (index) => {
        if(this.state.isDrawerOpen){
            this.setState({fromMenu:false});
        }
        this.setState({isDrawerOpen:!this.state.isDrawerOpen,position:index, autoPlayEnable:false});
    }
    
    render() {
        StatusBar.setBarStyle('light-content', true);

		return (
            <Fragment>
            <SafeAreaView style={{ flex:0, backgroundColor: Color.brownColor}} />
            <SafeAreaView style={{
                flex: 1,
                backgroundColor:Color.brownColor
            }}
            >
            <Drawer
				side={"left"}
				open={this.state.isDrawerOpen}
				type="overlay"
				content={
                    <MenuScreen localizedTitle={this.state.localizedTitle} isTrialExpired={this.state.isTrialExpired} isSubscriptionExpired={this.state.isSubscriptionExpired} expirationDate={this.state.expiration_date} openSubscription={()=>this.openSubscription()} cancelSubscription={()=>this.showCancelSubAlert()} onAttendancePress={()=>openOverlay()} isStudent={this.state.isStudent} name={this.state.firstname+' '+this.state.lastname} role={this.state.role} academy={this.state.academy} photo={this.state.photo} position={this.state.position} properties={this.props} toggleDrawer={() => this.toggleDrawer(-1)}/>
				}
				tapToClose={true}
				openDrawerOffset={0.0} // 20% gap on the right side of drawer
				panCloseMask={0.2}
				onClose={() => {
					this.setState({isDrawerOpen: false})
				}}
				closedDrawerOffset={-3}
				styles={drawerStyles}
				tweenHandler={(ratio) => ({
					main: { opacity:(2-ratio)/2 }
				})}
				>
                <Spinner visible={this.state.visible} />
                <View style={{flex:1, backgroundColor:'white'}}>
                    <View style={{flexDirection:'row', alignItems:'center', width:'80%', alignSelf:'center', marginTop:20, marginBottom:0}}>
                        
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity style={{}} onPress={this.toggleDrawer}>
                                <Image style={{width:23, height:14}} source={MENU}/>
                            </TouchableOpacity>
                            <View style={{width:20}} />
                            <Image style={{width:LOGOWIDTH, height:LOGOHEIGHT}} source={LOGO}/>

                        </View>
                        
                        <View style={{justifyContent:'flex-end', flexDirection:'row', flex:1}}>
                            <View style={{}}>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    {this.state.photo == '' ?
                                    <Image style={{width:25, height:25, borderRadius:12.5}} source={PERSON}/>
                                    :
                                    <Image defaultSource={PERSON} style={{width:25, height:25, borderRadius:12.5}} source={{uri: this.state.photo}}/>
                                    }
                                    <Text style={{fontFamily:'IBMPlexSans', fontSize:12, color:Color.homeBrownColor, marginLeft:5}}>{this.state.firstname+' '+ this.state.lastname}</Text>
                                    
                                </View>
                                <View style={{alignItems:'flex-end'}}>
                                    {this.state.grade!='' &&
                                    <Text style={{fontFamily:'IBMPlexSans', fontSize:12, color:Color.homeBrownColor}}>{registertexts.grade+': '+this.state.grade}</Text>
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                    {!this.state.visible &&
                    <View style={{height: this.state.midHeight, width:'100%'}}>
                        <ScrollView contentContainerStyle={{alignItems:'center'}} style={{height: '100%', width:'100%', marginTop:5 }}>
                            <View style={{backgroundColor:Color.brownColor, width:'80%', alignSelf:'center', borderRadius:5, height:this.state.boxHeight, marginTop:30}}>
                                <TouchableOpacity onPress={()=>this.openRegisterAttendance()} style={{flex:1, alignItems:'center', justifyContent: 'center',}}>
                                    <View style={{flexDirection:'row', alignItems:'center', width:'85%', alignSelf:'center',}}>
                                        <View style={{flexDirection:'row', width:'70%'}}>
                                            <Text numberOfLines={2} style={{fontFamily:'IBMPlexSans', fontWeight:'bold', fontSize:20, color:Color.whiteColor}}>{this.state.isStudent ? hometexts.registerattendance: hometexts.takestudentattendance}</Text>
                                        </View>
                                        <View style={{flexDirection:'row', width:'30%', justifyContent:'flex-end',}}>
                                            <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={50} color={Color.whiteColor} name={"calendar-clock"}  />
                                        </View>
                                    </View>
                                    <View style={{position:'absolute', left: (width - width *0.85)/2, bottom:15}}>
                                        <Image style={{width: 16, height: 12,}} source={RIGHTARROW} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{backgroundColor:Color.brownColor, width:'80%', alignSelf:'center', borderRadius:5, height:120, marginTop:20}}>
                                <TouchableOpacity onPress={()=>this.seeRecords()} style={{flex:1, alignItems:'center', justifyContent: 'center',}}>
                                    <View style={{flexDirection:'row', alignItems:'center', width:'85%', alignSelf:'center'}}>
                                        <View style={{flexDirection:'row', width:'75%'}}>
                                            <Text numberOfLines={2} style={{fontFamily:'IBMPlexSans', fontWeight:'bold', fontSize:20, color:Color.whiteColor}}>{hometexts.seerecords}</Text>
                                        </View>
                                        <View style={{flexDirection:'row', width:'25%', justifyContent:'flex-end',}}>
                                            {this.state.isStudent ?
                                            <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={50} color={Color.whiteColor} name={"clock-time-four-outline"}  />
                                            :
                                            <Image style={{width:65, height: 65}} source={STUDENT}/>
                                            }
                                        </View>
                                        
                                    </View>
                                    <View style={{position:'absolute', left: (width - width *0.85)/2, bottom:15}}>
                                        <Image style={{width: 16, height: 12,}} source={RIGHTARROW} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            
                            {!this.state.isStudent &&
                            <View style={{backgroundColor:Color.brownColor, width:'80%', alignSelf:'center', borderRadius:5, height:this.state.boxHeight, marginTop:20}}>
                                <TouchableOpacity onPress={()=>this.openRegisterAsStudent()} style={{flex:1, alignItems:'center', justifyContent: 'center',}}>
                                    <View style={{flexDirection:'row', alignItems:'center', width:'85%', alignSelf:'center',}}>
                                        <View style={{flexDirection:'row', width:'70%'}}>
                                            <Text numberOfLines={2} style={{fontFamily:'IBMPlexSans', fontWeight:'bold', fontSize:20, color:Color.whiteColor}}>{hometexts.registerasstudent}</Text>
                                        </View>
                                        <View style={{flexDirection:'row', width:'30%', justifyContent:'flex-end',}}>
                                            <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={50} color={Color.whiteColor} name={"calendar-clock"}  />
                                        </View>
                                    </View>
                                    <View style={{position:'absolute', left: (width - width *0.85)/2, bottom:15}}>
                                        <Image style={{width: 16, height: 12,}} source={RIGHTARROW} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            }

                            <View style={{backgroundColor:Color.brownColor, width:'80%', alignSelf:'center', borderRadius:5, height:this.state.boxHeight, marginTop:20}}>
                                <TouchableOpacity onPress={()=>this.props.navigation.navigate('Profile')} style={{flex:1, alignItems:'center', justifyContent: 'center',}}>
                                    <View style={{flexDirection:'row', alignItems:'center', width:'85%', alignSelf:'center'}}>
                                        <View style={{flexDirection:'row', width:'70%'}}>
                                            <Text numberOfLines={2} style={{fontFamily:'IBMPlexSans', fontWeight:'bold', fontSize:20, color:Color.whiteColor}}>{hometexts.userprofile}</Text>
                                        </View>
                                        <View style={{flexDirection:'row', width:'30%', justifyContent:'flex-end',}}>
                                            <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialIcons} size={50} color={Color.whiteColor} name={"person-outline"}  />
                                        </View>
                                    </View>
                                    <View style={{position:'absolute', left: (width - width *0.85)/2, bottom:15}}>
                                        <Image style={{width: 16, height: 12,}} source={RIGHTARROW} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{height:30}}></View>
                        </ScrollView>
                    </View>
                    }
                    <BottomBar isStudent={this.state.isStudent} properties={this.props}/>
                </View>
                </Drawer>
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
                <Modal
                    onTouchOutside={() => {
                        this.setState({ registerDialogShowing: false });
                    }}
                    visible={this.state.registerDialogShowing}
                    width={width}
                    height={height}
                    dialogAnimation={fadeAnimation}
                    dialogStyle={{}}
                    >
                    <ModalContent style={{width:'100%', height:'100%',backgroundColor:'rgba(0,0,0,0.5)'}}>
                        <View style={{height:100}} />
                        <View style={{flexDirection:'row', width:'80%', alignSelf:'center', justifyContent:'flex-end',}}>
                            <Icon onPress={()=>this.setState({registerDialogShowing:false})} style={{backgroundColor:'transparent'}} type={Font.TypeIonIcons} size={30} color={Color.whiteColor} name={"md-close-circle-outline"}  />
                        </View>
                        <View style={{flex:1, marginTop:100, alignItems:'center'}}>
                            <Text style={{fontFamily:'IBMPlexSans', fontWeight:'bold', fontSize:24, color:Color.whiteColor}}>{hometexts.registerattendance}</Text>
                            <TouchableOpacity onPress={()=>this.registerPress(false)} style={{backgroundColor:'white', borderRadius: 10, width:100, height:100, marginTop:50, justifyContent:'center', alignItems:'center'}}>
                                <Icon style={{backgroundColor:'transparent'}} type={Font.TypeIonIcons} size={20} color={Color.black} name={"person-outline"}  />
                                <Text style={{fontFamily:'IBMPlexSans', fontWeight:'normal', fontSize:14, color:Color.black, marginTop:10}}>{logintexts.instructor}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={()=>this.registerPress(true)} style={{backgroundColor:'white', borderRadius: 10, width:100, height:100, marginTop:30, justifyContent:'center', alignItems:'center'}}>
                                <Image style={{width: 24, height:15}} source={STUDENTCAP} />
                                <Text style={{fontFamily:'IBMPlexSans', fontWeight:'normal', fontSize:14, color:Color.black, marginTop:10}}>{logintexts.student}</Text>
                            </TouchableOpacity>
                        </View>
                    </ModalContent>
                </Modal>

                <Modal
                onTouchOutside={() => {
                    this.setState({ inAppDialogshowing: false });
                }}
                visible={this.state.inAppDialogshowing}
                width={width}
                height={height}
                dialogAnimation={fadeAnimation}
                dialogStyle={{}}
                >
                    <ModalContent style={{width:'90%', height:'100%',backgroundColor:'#fff', alignItems:'center', alignSelf:'center'}}>
                        <Image style={{width: 70, height: 0.916 * 70, marginTop:30}} source={LOGO} />
                        <Text style={{fontFamily:'IBMPlexSans-Light', fontSize:16, color:Color.homeBrownColor, marginTop:20, lineHeight:20, textAlign:'center'}}>{this.state.isTrialExpired ? TRIALEXPIREDTEXT : INITTEXT}</Text>
                        <View style={{width:'100%', height:1, backgroundColor:'lightgray', marginTop:20, marginBottom:20}} />

                        <Text style={{fontFamily:'IBMPlexSans-Bold', fontSize:18, color:Color.homeBrownColor, marginTop:30, textAlign:'center'}}>{this.state.localizedTitle}</Text>
                        <Text style={{fontFamily:'IBMPlexSans-Bold', fontSize:18, color:Color.homeBrownColor, marginTop:5, textAlign:'center'}}>{this.state.periodText}{this.state.paidperiod}</Text>

                        {(!this.state.isTrialExpired && !this.state.fromMenu) &&
                        <TouchableOpacity onPress={()=>this.trialPeriodClicked()} style={{ width: '100%', height: 45, borderRadius: 5, borderWidth:1, borderColor:Color.homeBrownColor, alignItems:'center', justifyContent: 'center', marginTop: 25}}>
                            <Text style={{fontFamily:'IBMPlexSans-Medium', fontSize:16, color:Color.homeBrownColor}}>Iniciar prueba gratuita de {this.state.trialperiod}</Text>
                        </TouchableOpacity>
                        }

                        <TouchableOpacity onPress={()=>this.buySubscription()} style={{ width: '100%', height: 45, borderRadius: 5, alignItems:'center', justifyContent: 'center', marginTop: 25, backgroundColor:Color.homeBrownColor}}>
                            <Text style={{fontFamily:'IBMPlexSans-Medium', fontSize:16, color:'white'}}>Suscribirme por {this.state.localizedPrice} {this.state.duration}</Text>
                        </TouchableOpacity>

                        {!this.state.fromMenu ?
                        <Text onPress={()=>this.logout()} style={{fontFamily:'IBMPlexSans-Light', fontSize:15, color:Color.homeBrownColor, textDecorationLine: 'underline', textAlign:'center', marginTop:40}}>{commontexts.cancelnlogout}</Text>
                        :
                        <Text onPress={()=>this.setState({inAppDialogshowing:false})} style={{fontFamily:'IBMPlexSans-Light', fontSize:15, color:Color.homeBrownColor, textDecorationLine: 'underline', textAlign:'center', marginTop:40}}>{commontexts.cancel}</Text>
                        }

                    </ModalContent>
                </Modal>
            </SafeAreaView>
            
            </Fragment>
	    );
	}
}