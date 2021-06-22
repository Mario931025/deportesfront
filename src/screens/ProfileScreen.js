import React,{Component, Fragment} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet, TextInput, Text, View, StatusBar,Image,Dimensions,Linking, Modal, ScrollView, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import { resetNavigation } from '../utils/Common'
import BottomBar from './BottomBar'
import { Color, Font } from '../styles/config';
import { Icon } from 'react-native-elements';
const BACK = require('../resources/icons/back_brown.png');
import {profiletexts, registertexts} from '../utils/apptexts'
import { TouchableOpacity } from 'react-native-gesture-handler';
import ReactNative from 'react-native';
import BirthdayPicker from '../utils//BirthdayPicker';
import {Picker} from '@react-native-community/picker';
import moment from "moment";
import Toast from 'react-native-simple-toast';
import ImagePicker from 'react-native-image-crop-picker';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Permissions from 'react-native-permissions';
import DatePicker from 'react-native-datepicker'
import SafeArea, { type SafeAreaInsets } from 'react-native-safe-area';

import { getprofile, updateprofile, updatesocialprofileinfo, getcities, getcountries, getgrades, getacamedies, getroles, updatephoto } from '../services';
import ViewPager from '@react-native-community/viewpager';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { CommonStyles } from '../styles/commonStyles';
import Dialog, { SlideAnimation, DialogContent, FadeAnimation } from 'react-native-popup-dialog';
import Spinner from 'react-native-loading-spinner-overlay';
const fadeAnimation = new FadeAnimation({ animationDuration: 150 });
const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});
const PERSON = require('../resources/icons/placeholder_icon.jpg');

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    buttonContainer: {
        justifyContent: "space-between",
        flexDirection: "row",
        padding: 10,
        height:42,
        backgroundColor: "white",
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    }
});

export default class ProfileScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
            selectTab:1,
            currentPage:0,
            pages:2,
            roles:[],
            academies:[],
            grades:[],
            countries:[],
            cities:[],
            image:'',
            cityId:-1,
            countryDialogShowing:false,
            countryDialogShowingAndroid:false,
            cityDialogShowing:false,
            cityDialogShowingAndroid:false,
            academyDialogShowing:false,
            gradeDialogShowing:false,
            gradeDialogShowingAndroid:false,
            academyDialogShowingAndroid:false,
            selectcountry:registertexts.country,
            selectcity:registertexts.city,
            selectacademy:registertexts.academy,
            selectgrade:registertexts.grade,
            firstname:'',
            lastname:'',
            email:'',
            spinnerText:'',
            documentnumber:'',
            phone:'',
            twitter:'',
            facebook:'',
            youtube:'',
            linkedin:'',
            birthdate:registertexts.birthdate,
            selectDay:27,
            selectMonth:2,
            selectYear:1988,
            isStudent:false,
            selectDate:'1988-01-01',
            topinsets:0,
            bottominsets:0,
            keyboardOpen:false
            
        }
        this.pager = React.createRef();
        this._scrollToInput = this._scrollToInput.bind(this);
        this._scroll1ToInput = this._scroll1ToInput.bind(this);
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));


    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow () {
      this.setState({keyboardOpen:true});
    }
    
    _keyboardDidHide () {
        this.setState({keyboardOpen:false});
    }

    showPermissionError(){
		var message = "Please accept the files & media permission from the settings";
		if(Platform.OS === 'ios'){
			message = "Please accept the photos library permission from the settings";
		}
		Alert.alert(
			"Permission Error",
			message,
			[
			  { text: "OK", onPress: () => {openSettings().catch(() => console.warn('cannot open settings')) } }
			],
			{ cancelable: false }
		  );
	}

	checkForPhotosPermission = (type) => {

		var permission = null;
		if(Platform.OS === 'ios'){
			permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
		}else{
			permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
			/*this._pickImage();
			return;*/
		}

		check(permission)
		.then((result) => {
			switch (result) {
			case RESULTS.UNAVAILABLE:
				//console.log('This feature is not available (on this device / in this context)');
				break;
			case RESULTS.DENIED:
				//if(Platform.OS === 'ios'){
					Permissions.request(permission).then(() => this.checkForPhotosPermission(type))
					.catch((error) => console.error(error));
				//}
				//console.log('The permission has not been requested / is denied but requestable',);
				break;
			case RESULTS.GRANTED:
				//console.log('The permission is granted');
				if(type == 'photo'){
					this._pickImage();
				}else{
				}
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

    async uploadPhoto(path){
        this.setState({ visible: true, spinnerText: profiletexts.updatingphototext});
        var extIndex = path.lastIndexOf(".");
        var ext = path.substring(extIndex+1,path.length);


        let response = await updatephoto({ 
            profile_photo: {
                uri: path,
                name: Date.now() + 'img.'+ext,
                type:'image/'+ext
            }
        }, this.props);
        this.setState({ visible: false, spinnerText: ''});

        let {status, message} = response;
        if(status == 200){
            this.setState({ image: path });
            setTimeout( () => {
                Toast.show(message);
            }, 100);
        }
        else{
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

    _pickImage = async () => {
		ImagePicker.openPicker({
		  width: width,
		  height: width,
		  cropping: true
		}).then(image => {
			let mimeType = image.mime;
			let size = image.size;
			var path = image.path;
			////console.log('path::'+path);
			if(Platform.OS === 'ios'){
				path = image.path;
			}
			if(mimeType == 'image/jpeg' || mimeType == 'image/png' || mimeType == 'image/gif'){
				//alert('size::'+size);
				if(size>2000000){
					alert('File size cannot be more than 2 MB');
				}else{
                    this.uploadPhoto(path);
				}
			}else{
				alert('Sorry, this image type is not supported');
			}
		});
	};
    
    _scrollToInput (reactNode: any) {
        this.scroll.scrollToFocusedInput(reactNode);
    }

    _scroll1ToInput (reactNode: any) {
        this.scroll1.scrollToFocusedInput(reactNode);
    }

    getDate(birthday){
        if(birthday == null){
            return profiletexts.registertexts.birthdate;
        }
        birthday = birthday.substring(0, birthday.lastIndexOf('T'));
        var dates = birthday.split("-")
        const momentDate = moment(birthday, 'YYYY-MM-DD HH:mm:ss')
        var year = dates[0];
        var date = dates[2];
        var month = dates[1];
    
        
        return year+"-"+month+"-"+date;
    }

    showAcademyDialog(){
		if(Platform.OS === 'ios'){
			if(!this.state.academyId)
			    this.onAcademySelected(0);
                
            this.setState({academyDialogShowing:true});
		}else{
			this.setState({academyDialogShowingAndroid:true});
		}
    }

    showGradeDialog(){
		if(Platform.OS === 'ios'){
			if(!this.state.gradeId)
			    this.onGradeSelected(0);
                
            this.setState({gradeDialogShowing:true});
		}else{
			this.setState({gradeDialogShowingAndroid:true});
		}
    }

    showBirthdayDialog(){
        if(Platform.OS === 'android'){
            //this.setState({birthdayDialogVisibleAndroid:true});
            this.datePickerRef.onPressDate();
        }else{
            this.setState({birthdayDialogVisible:true});
        }
    }

    async updateProfileInfo(){

        if(this.state.firstname.trim() == '' || this.state.lastname.trim() == '' || this.state.cityId == -1 ||
         /*this.state.birthdate.trim() == registertexts.birthdate ||*/ this.state.selectcity.trim() == registertexts.selectcity
        || this.state.selectacademy.trim() == registertexts.academy || this.state.phonenumber == '' /*|| this.state.documentnumber.trim() == '' || this.state.selectgrade.trim() == registertexts.grade*/){
            Toast.show(registertexts.blankfielderror);
            return
        }
        else if(this.state.phonenumber.length <6){
            Toast.show(registertexts.phoneerror);
            return
        }
        this.setState({visible: true});
        var params = {name: this.state.firstname, last_name: this.state.lastname,
            phone: this.state.phonenumber, document_number: this.state.document, birthday: this.state.birthdate == profiletexts.registertexts.birthdate ? null:this.state.birthdate,
            city_id: this.state.cityId, academy_id: this.state.academyId,/* grade_id: this.state.gradeId*/};
        
        console.log('params::'+JSON.stringify(params));

        let response = await updateprofile(params, this.props);
        let { message, status } = response;
        this.setState({visible: false});

        if(status == 200){
            setTimeout( () => {
                Toast.show(message);
            }, 100);
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

    async updateSocialProfile(){
        this.setState({visible: true});
        let response = await updatesocialprofileinfo({facebook: this.state.facebook, twitter: this.state.twitter,
        linkedin: this.state.linkedin, youtube: this.state.youtube}, this.props);
        this.setState({visible: false});
        
        let {status, message} = response;
        if(status == 200){
            setTimeout( () => {
                Toast.show(message);
            }, 100);
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

    async onAcademySelected(index){
		this.setState({academyDialogShowingAndroid:false});
		this.setState({selectAcademyIndex:index,selectacademy:this.state.academies[index].name,academyId:this.state.academies[index].id, });
    }

    async onGradeSelected(index){
		this.setState({gradeDialogShowingAndroid:false});
		this.setState({selectGradeIndex:index,selectgrade:this.state.grades[index].name,gradeId:this.state.grades[index].id, });
    }

    showCountryDialog(){
		if(Platform.OS === 'ios'){
			if(!this.state.countryId)
			    this.onCountrySelected(0);
                
            this.setState({countryDialogShowing:true});
		}else{
			this.setState({countryDialogShowingAndroid:true});
		}
    }   

    async onCountrySelected(index){

		await this.setState({countryDialogShowingAndroid:false});
		await this.setState({selectCountryIndex:index,countryId:this.state.countries[index].id, });
        if(Platform.OS === 'android'){
            this.onDoneClicked();
        }
    }

    showCityDialog(){
		if(Platform.OS === 'ios'){
			if(!this.state.cityId)
			    this.onCitySelected(0);
                
            this.setState({cityDialogShowing:true});
		}else{
			this.setState({cityDialogShowingAndroid:true});
		}
    }
    
    async onCitySelected(index){
		this.setState({cityDialogShowingAndroid:false});
		this.setState({selectCityIndex:index,selectcity:this.state.cities[index].name,cityId:this.state.cities[index].id, });
        
    }

    async onDoneClicked(){
        await this.setState({visible:true, countryDialogShowing:false, countryDialogShowing:false, selectcountry:this.state.countries[this.state.selectCountryIndex].name,});
        let response = await getcities({country_id: this.state.countryId});
        this.setState({visible:false});

        if(response && response.length > 0){
            if(response[0]['id']){
                this.setState({cities:response, selectcity: response[0].name, cityId: response[0]['id']});
            }
        }else{
            this.setState({cities:[], selectcity: registertexts.city, cityId:-1})
        }
    }

    onBirthdaySelect(){
        var day = this.state.selectDay;
        var month = this.state.selectMonth;

        if(day <=9){
            day = "0"+day;
        }
        if(month <=9){
            month = "0"+month;
        }
        this.setState({birthdate:this.state.selectYear+"-"+month+"-"+day, birthdayDialogVisible:false})
    }

	async componentDidMount() {

        var ref = this;
        SafeArea.getSafeAreaInsetsForRootView()
        .then((result) => {
        ////console.log(result);
        var topinsets = result.safeAreaInsets.top;
        var bottominsets = result.safeAreaInsets.bottom;

        ref.setState({topinsets:topinsets,bottominsets:bottominsets});
        })

        this.setState({visible:true});
        

        let response = await getcountries({});
        if(response && response.length > 0){
            if(response[0]['id']){
                await this.setState({countries:response});
            }
        }

        let value = await AsyncStorage.getItem('isStudent');
        if(value == "1"){
            this.setState({isStudent: true});
        }

        await this.loadAcademies();
        await this.loadRoles();
        await this.loadGrades();
        await this.loadProfile();
    }

    async loadGrades(){
        let response = await getgrades({});
        if(response && response.length > 0){
            if(response[0]['id']){
                this.setState({grades:response});
            }
        }
    }


    async loadProfile(){
        this.setState({visible:true});
        let response = await getprofile({}, this.props);
        this.setState({visible:false});

        let { status } = response;
        if(status == 200){
            await this.setState({image: response.profile_photo == null ? '':response.profile_photo,firstname: response.name!=null ?response.name:profiletexts.registertexts.firstname, lastname: response.last_name!=null ? response.last_name: '', phonenumber: response.phone!=null ? response.phone : '',
            email: response.email, document: response.document_number!=null ? response.document_number: '', birthdate: this.getDate(response.birthday),
            selectacademy: response.academy!=null ? response.academy.name: profiletexts.registertexts.academy,
            selectgrade: response.grade!=null ? response.grade.name: profiletexts.registertexts.grade,
            academyId: response.academy_id, gradeId: response.grade_id, academy: response.academy && response.academy!=null ? response.academy.name:''});

            this.setState({fullname: this.state.firstname+' '+this.state.lastname});
            
            if(response.city!=null){
                this.setState({selectcity: response.city.name, selectcountry:response.city.country.name, cityId: response.city_id, countryId:response.city.country.id});
                let cityResponse = await getcities({country_id: response.city.country.id, cityId: response.city_id, countryId: response.city.country.id});

                if(cityResponse && cityResponse.length > 0){
                    if(cityResponse[0]['id']){
                        this.setState({cities:cityResponse});
                    }
                }
            }

            if(response.social_network!=null){
                let socialProfiles = response.social_network;
                this.setState({twitter:socialProfiles.twitter, facebook: socialProfiles.facebook, 
                youtube: socialProfiles.youtube, linkedin: socialProfiles.linkedin });
            }
            
        }
    }

    async loadAcademies(){
        let response = await getacamedies({});
        if(response && response.length > 0){
            if(response[0]['id']){
                await this.setState({academies:response});
            }
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

    onPageSelected = (e: PageSelectedEvent) => {
        //this.setState({page: e.nativeEvent.position});
        var position = e.nativeEvent.position;
        this.setState({currentPage:position, selectTab:position+1});
    };
    

    /*onPageSelected(params){
        //console.log('params::'+(params['position']+1))
        this.setState({currentPage:params['position'], selectTab:params['position']+1});
    }*/
    
    selectTab(index){
        this.setState({selectTab:index});
        const indicator = this.pager;
        if(indicator && indicator.current!=null){
            indicator.current.setPage(index - 1, true);
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
                }}
                >   
                    <Spinner visible={this.state.visible} />
                    <View style={{flex:1, backgroundColor:'white'}}>
                        
                        <View style={{flexDirection:'row', width:'90%', alignSelf:'center', alignItems:'center', marginTop:30}}>
                            <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                                {/*<Image style={{width:22, height:17}} source={BACK} />*/}
                                <Icon name="keyboard-backspace" size={30} type={Font.TypeMaterialIcons} color={Color.brownColor}/>
                            </TouchableOpacity>
                            <Text style={{fontFamily:'IBMPlexSans', fontSize:20, color:Color.brownColor, fontWeight:'bold', marginLeft:10}}>{profiletexts.profile}</Text>
                        </View>
                        <TouchableOpacity onPress={()=>this.checkForPhotosPermission('photo')} style={{alignItems:'center', marginTop:20, alignSelf:'center'}}>
                            {this.state.image == '' ?
                            <Image style={{width:80, height:80, borderRadius:40, zIndex:-1}} source={PERSON}/>
                            :
                            <Image defaultSource={PERSON} style={{width:80, height:80, borderRadius:40, zIndex:-1}} source={{uri: this.state.image}}/>
                            }
                            
                            <View style={{width:140, zIndex:999, position:'absolute', top: 60, left:30, alignSelf:'center'}}>
                                {!this.state.visible &&
                                <View style={{}}>
                                    <Icon style={{}} type={Font.TypeIonIcons} size={25} color={Color.brownColor} name={"camera"}  />
                                </View>
                                }
                            </View>

                            <View style={{marginTop:5}}>
                                <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color:Color.brownColor, fontWeight:'bold', textAlign:'center'}}>{this.state.fullname}</Text>
                                <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color:Color.brownColor, fontWeight:'normal',  textAlign:'center'}}>{this.state.academy}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{width:'100%', backgroundColor:'white', width:'100%', marginBottom:100, flex:1}}>
                            <View style={{flexDirection:'row', width:'95%', alignSelf:'center', alignItems:'center', marginTop:30, height:40}}>
                                <View style={{width:'50%', height:'100%', borderBottomWidth:this.state.selectTab == 1 ?2:0, borderColor:Color.brownColor }}>
                                    <TouchableOpacity onPress={()=>this.selectTab(1)} style={{width:'100%', alignItems:'center', height:'100%'}}>
                                        <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color:this.state.selectTab == 1 ?Color.brownColor:'#828282', fontWeight:'normal'}}>{profiletexts.personaldata}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{width:'50%', height:'100%', borderBottomWidth:this.state.selectTab == 2 ?2:0, borderColor:Color.brownColor }}>
                                    <TouchableOpacity onPress={()=>this.selectTab(2)} style={{width:'100%', alignItems:'center', height:'100%'}}>
                                        <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color:this.state.selectTab == 2 ?Color.brownColor:'#828282', fontWeight:'normal'}}>{profiletexts.socialnetworks}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{flex:1}}>
                                <ViewPager onPageSelected={this.onPageSelected.bind(this)} ref={this.pager} style={{width:'100%', height:'100%'}} initialPage={0}>
                                    <View style={{flex:1}}>
                                        <KeyboardAwareScrollView ref={ref => {this.scroll = ref}} contentContainerStyle={{alignItems:'center'}} style={{flex:1}}>

                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:30}}>
                                                <TextInput
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.registertexts.firstname}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1}]}
                                                keyboardType={'name-phone-pad'}
                                                onChangeText={firstname => this.setState({ firstname })}
                                                value={this.state.firstname}
                                                returnKeyType={'next'}
                                                blurOnSubmit={false}
                                                onSubmitEditing={() => {
                                                    this.lastNameInput.focus()
                                                }}
                                                ref={(c) => this.firstNameInput = c}
                                                onFocus={(event: Event)=> {
                                                    this._scrollToInput(ReactNative.findNodeHandle(this.firstNameInput))
                                                }}
                                                />
                                            </View>
                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                                                <TextInput
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.registertexts.lastname}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1}]}
                                                keyboardType={'name-phone-pad'}
                                                onChangeText={lastname => this.setState({ lastname })}
                                                value={this.state.lastname}
                                                returnKeyType={'next'}
                                                blurOnSubmit={false}
                                                onSubmitEditing={() => {
                                                    this.emailInput.focus()
                                                }}
                                                ref={(c) => this.firstNameInput = c}
                                                onFocus={(event: Event)=> {
                                                    this._scrollToInput(ReactNative.findNodeHandle(this.firstNameInput))
                                                }}
                                                />
                                                
                                            </View>
                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                                                <TextInput
                                                editable={false}
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.registertexts.email}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1}]}
                                                keyboardType={'email-address'}
                                                onChangeText={email => this.setState({ email })}
                                                value={this.state.email}
                                                returnKeyType={'next'}
                                                blurOnSubmit={false}
                                                onSubmitEditing={() => {
                                                }}
                                                ref={(c) => this.firstNameInput = c}
                                                onFocus={(event: Event)=> {
                                                    this._scrollToInput(ReactNative.findNodeHandle(this.firstNameInput))
                                                }}
                                                />
                                            </View>
                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', marginTop:20, height:40, borderBottomWidth:1, borderColor: '#BDBDBD'}}>
                                                <TouchableOpacity onPress={() => this.showBirthdayDialog()} style={{width:'100%', height:'100%', justifyContent:'flex-end',}}>
                                                    <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10, paddingBottom:7}} >{this.state.birthdate}</Text>
                                                </TouchableOpacity>
                                            </View>
                                            
                                            <TouchableOpacity onPress={()=>this.showCountryDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                                                <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectcountry}</Text>
                                                <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                                                    <Icon style={{backgroundColor:'transparent', alignSelf:'flex-end'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={()=>this.showCityDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                                                <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectcity}</Text>
                                                <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={()=>this.showAcademyDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                                                <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectacademy}</Text>
                                                <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                                                </View>
                                            </TouchableOpacity>

                                            {/*<TouchableOpacity onPress={()=>this.showGradeDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                                                <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectgrade}</Text>
                                                <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                                                </View>
                                            </TouchableOpacity>*/}

                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                                                <TextInput
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.registertexts.documentnumber}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1}]}
                                                keyboardType={'default'}
                                                onChangeText={document => this.setState({ document })}
                                                value={this.state.document}
                                                returnKeyType={'next'}
                                                blurOnSubmit={false}
                                                onSubmitEditing={() => {
                                                    this.phoneInput.focus()
                                                }}
                                                ref={(c) => this.documentInput = c}
                                                onFocus={(event: Event)=> {
                                                    this._scrollToInput(ReactNative.findNodeHandle(this.documentInput))
                                                }}
                                                />
                                            </View>

                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                                                <TextInput
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.phonenumber}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1}]}
                                                keyboardType={'number-pad'}
                                                onChangeText={phonenumber => this.setState({ phonenumber })}
                                                value={this.state.phonenumber}
                                                returnKeyType={'done'}
                                                blurOnSubmit={true}
                                                ref={(c) => this.phoneInput = c}
                                                onSubmitEditing={() => {
                                                }}
                                                onFocus={(event: Event)=> {
                                                    this._scrollToInput(ReactNative.findNodeHandle(this.phoneInput))
                                                }}
                                                />
                                            </View>
                                            
                                            <TouchableOpacity onPress={()=>this.updateProfileInfo()} style={{borderRadius:5,backgroundColor:Color.brownColor,marginTop:40, width:width*80/100, alignSelf:'center', flexDirection:'row', height:45, justifyContent:'center', alignItems:'center'}}>
                                                <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'bold'}}>{profiletexts.registertexts.save}</Text>
                                            </TouchableOpacity>
                                            <View style={{height:10}} />
                                        </KeyboardAwareScrollView>
                                    </View>
                                    <View style={{flex:1}}>
                                        <KeyboardAwareScrollView ref={ref => {this.scroll1 = ref}} contentContainerStyle={{alignItems:'center'}} style={{flex:1}}>
                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:30}}>
                                                <View style={{flexDirection:'row', width:20, justifyContent:'center'}}>
                                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeFontAwesome} size={20} color={Color.brownColor} name={"twitter"}  />
                                                </View>
                                                <TextInput
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.twitter}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1}]}
                                                keyboardType={'default'}
                                                onChangeText={twitter => this.setState({ twitter })}
                                                value={this.state.twitter}
                                                returnKeyType={'next'}
                                                blurOnSubmit={false}
                                                onSubmitEditing={() => {
                                                    this.facebookInput.focus()
                                                }}
                                                ref={(c) => this.twitterInput = c}
                                                onFocus={(event: Event)=> {
                                                    this._scroll1ToInput(ReactNative.findNodeHandle(this.twitterInput))
                                                }}
                                                />
                                            </View>
                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                                                <View style={{flexDirection:'row', width:20, justifyContent:'center'}}>
                                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeFontAwesome} size={20} color={Color.brownColor} name={"facebook"}  />
                                                </View>                                                
                                                <TextInput
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.facebook}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1}]}
                                                keyboardType={'default'}
                                                onChangeText={facebook => this.setState({ facebook })}
                                                value={this.state.facebook}
                                                returnKeyType={'next'}
                                                blurOnSubmit={false}
                                                onSubmitEditing={() => {
                                                    this.youtubeInput.focus()
                                                }}
                                                ref={(c) => this.facebookInput = c}
                                                onFocus={(event: Event)=> {
                                                    this._scroll1ToInput(ReactNative.findNodeHandle(this.facebookInput))
                                                }}
                                                />
                                            </View>
                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                                                <View style={{flexDirection:'row', width:20, justifyContent:'center'}}>
                                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeFontAwesome} size={20} color={Color.brownColor} name={"youtube-play"}  />
                                                </View>                                                
                                                <TextInput
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.youtube}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1, paddingLeft:10}]}
                                                keyboardType={'default'}
                                                onChangeText={youtube => this.setState({ youtube })}
                                                value={this.state.youtube}
                                                returnKeyType={'next'}
                                                blurOnSubmit={false}
                                                onSubmitEditing={() => {
                                                    this.linkedInInput.focus()
                                                }}
                                                ref={(c) => this.youtubeInput = c}
                                                onFocus={(event: Event)=> {
                                                    this._scroll1ToInput(ReactNative.findNodeHandle(this.youtubeInput))
                                                }}
                                                />
                                            </View>

                                            <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                                                <View style={{flexDirection:'row', width:20, justifyContent:'center'}}>
                                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeFontAwesome} size={20} color={Color.brownColor} name={"linkedin"}  />
                                                </View>                                                
                                                <TextInput
                                                underlineColorAndroid="transparent"
                                                placeholder={profiletexts.linkedin}
                                                placeholderTextColor={Color.brownColor}
                                                style={[CommonStyles.inputFieldL,{flex:1, paddingLeft:10}]}
                                                keyboardType={'default'}
                                                onChangeText={linkedin => this.setState({ linkedin })}
                                                value={this.state.linkedin}
                                                returnKeyType={'next'}
                                                blurOnSubmit={false}
                                                ref={(c) => this.linkedInInput = c}
                                                onFocus={(event: Event)=> {
                                                    this._scroll1ToInput(ReactNative.findNodeHandle(this.linkedInInput))
                                                }}
                                                />
                                            </View>
                                            <TouchableOpacity onPress={()=>this.updateSocialProfile()} style={{borderRadius:5,backgroundColor:Color.brownColor,marginTop:40, width:width*80/100, alignSelf:'center', flexDirection:'row', height:45, justifyContent:'center', alignItems:'center'}}>
                                                <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'bold'}}>{profiletexts.registertexts.save}</Text>
                                            </TouchableOpacity>
                                            <View style={{height:10}} />
                                        </KeyboardAwareScrollView>
                                    </View>
                                </ViewPager>
                            </View>
                        </View>
                        {!this.state.keyboardOpen &&
                        <BottomBar properties={this.props} isStudent={this.state.isStudent} />
                        }
                    </View>
                    

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.countryDialogShowing}
                >
                    <TouchableWithoutFeedback
                    >
                    <View style={styles.modalContainer}>
                        <View style={styles.buttonContainer}>
                        <Text onPress={()=>this.setState({countryDialogShowing:false})} style={{justifyContent:'flex-start',color: "red",fontSize: 16,}}>Cancel</Text>
                        <Text style={{ fontFamily:'IBMPlexSans',fontSize:16,color:'#393939',fontWeight:'bold', justifyContent:'center'}}>{registertexts.selectcountry}</Text>
                        <Text  style={{ fontFamily:'IBMPlexSans',fontSize:16,color:'#393939',justifyContent:'flex-end' }} onPress={()=>this.onDoneClicked()}>Done</Text>
                        </View>
                        <View>
                        <Picker
                            style={{backgroundColor:'white'}}
                            selectedValue={this.state.countryId}
                            onValueChange={(itemValue, itemIndex) => this.onCountrySelected(itemIndex)}
                        >
                            {this.state.countries.map((country, index) => (
                            <Picker.Item
                                key={index}
                                itemStyle={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}
                                label={country.name}
                                value={country.id}
                            />
                            ))}
                        </Picker>
                        </View>
                    </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <Dialog
                    ref="citydialog"
                    onTouchOutside={() => {
                        this.setState({ cityDialogShowingAndroid: false });
                    }}
                    visible={this.state.cityDialogShowingAndroid}
                    width={(width*90)/100}
                    height={(this.state.cities.length*50+50) > 300 ?300:(this.state.cities.length*50+50)}
                    dialogAnimation={fadeAnimation}
                    dialogStyle={{}}
                    >
                    <DialogContent style={{width:'100%', height:'100%',backgroundColor:'white'}}>
                        <Text style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939', fontWeight:'bold', textAlign:'center', marginTop:10 }}>{registertexts.selectcity}</Text>
                        <View style={{height:10}}></View>
                        <ScrollView style={{width:'100%'}}>
                        {this.state.cities.map((city, index) => (
                            <TouchableOpacity onPress={() => this.onCitySelected(index)}  style={{width:'100%', height:50, justifyContent:'center', paddingLeft:10}}>
                                <Text onPress={() => this.onCitySelected(index)} style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}>{city.name}</Text>
                            </TouchableOpacity>
                        ))}
                        </ScrollView>
                    </DialogContent>
                </Dialog>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.cityDialogShowing}
                >
                    <TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                        <View style={styles.buttonContainer}>
                        <Text style={{justifyContent:'flex-start',color: "white",fontSize: 16,}}>Done</Text>
                        <Text style={{ fontFamily:'IBMPlexSans',fontSize:16,color:'#393939',fontWeight:'bold', justifyContent:'center'}}>{registertexts.selectcity}</Text>
                        <Text style={{ fontFamily:'IBMPlexSans',fontSize:16,color:'#393939',justifyContent:'flex-end' }} onPress={() => this.setState({ cityDialogShowing: false })}>Done</Text>
                        </View>
                        <View>
                        <Picker
                            style={{backgroundColor:'white'}}
                            selectedValue={this.state.cityId}
                            onValueChange={(itemValue, itemIndex) => this.onCitySelected(itemIndex)}
                        >
                            {this.state.cities.map((city, index) => (
                            <Picker.Item
                                key={index}
                                itemStyle={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}
                                label={city.name}
                                value={city.id}
                            />
                            ))}
                        </Picker>
                        </View>
                    </View>
                    </TouchableWithoutFeedback>
                </Modal>


                <Dialog
                    onTouchOutside={() => {
                        this.setState({ academyDialogShowingAndroid: false });
                    }}
                    visible={this.state.academyDialogShowingAndroid}
                    width={(width*90)/100}
                    height={(this.state.academies.length*50+50) > 300 ?300:(this.state.academies.length*50+50)}
                    dialogAnimation={fadeAnimation}
                    dialogStyle={{}}
                    >
                    <DialogContent style={{width:'100%', height:'100%',backgroundColor:'white'}}>
                        <Text style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939', fontWeight:'bold', textAlign:'center', marginTop:10 }}>{registertexts.selectacademy}</Text>
                        <View style={{height:10}}></View>
                        <ScrollView style={{width:'100%'}}>
                        {this.state.academies.map((academy, index) => (
                            <TouchableOpacity onPress={() => this.onAcademySelected(index)}  style={{width:'100%', height:50, justifyContent:'center', paddingLeft:10}}>
                                <Text onPress={() => this.onAcademySelected(index)} style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}>{academy.name}</Text>
                            </TouchableOpacity>
                        ))}
                        </ScrollView>
                    </DialogContent>
                </Dialog>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.academyDialogShowing}
                >
                    <TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                        <View style={styles.buttonContainer}>
                        <Text style={{justifyContent:'flex-start',color: "white",fontSize: 16,}}>Done</Text>
                        <Text style={{ fontFamily:'IBMPlexSans',fontSize:15,color:'#393939',fontWeight:'bold', justifyContent:'center'}}>{registertexts.selectacademy}</Text>
                        <Text style={{ fontFamily:'IBMPlexSans',fontSize:13,color:'#393939',justifyContent:'flex-end' }} onPress={() => this.setState({ academyDialogShowing: false })}>Done</Text>
                        </View>
                        <View>
                        <Picker
                            style={{backgroundColor:'white'}}
                            selectedValue={this.state.academyId}
                            onValueChange={(itemValue, itemIndex) => this.onAcademySelected(itemIndex)}
                        >
                            {this.state.academies.map((academy, index) => (
                            <Picker.Item
                                key={index}
                                itemStyle={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}
                                label={academy.name}
                                value={academy.id}
                            />
                            ))}
                        </Picker>
                        </View>
                    </View>
                    </TouchableWithoutFeedback>
                 </Modal>
                 <Dialog
                onTouchOutside={() => {
                    this.setState({ gradeDialogShowingAndroid: false });
                }}
                visible={this.state.gradeDialogShowingAndroid}
                width={(width*90)/100}
                height={(this.state.grades.length*50+50) > 300 ?300:(this.state.grades.length*50+50)}
                dialogAnimation={fadeAnimation}
                dialogStyle={{}}
                >
                <DialogContent style={{width:'100%', height:'100%',backgroundColor:'white'}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939', fontWeight:'bold', textAlign:'center', marginTop:10 }}>{registertexts.selectgrade}</Text>
                    <View style={{height:10}}></View>
                    <ScrollView style={{width:'100%'}}>
                    {this.state.grades.map((grade, index) => (
                        <TouchableOpacity onPress={() => this.onCitySelected(index)}  style={{width:'100%', height:50, justifyContent:'center', paddingLeft:10}}>
                            <Text onPress={() => this.onCitySelected(index)} style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}>{grade.name}</Text>
                        </TouchableOpacity>
                    ))}
                    </ScrollView>
                </DialogContent>
            </Dialog>

            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.gradeDialogShowing}
            >
                <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                    <View style={styles.buttonContainer}>
                    <Text style={{justifyContent:'flex-start',color: "white",fontSize: 16,}}>Done</Text>
                    <Text style={{ fontFamily:'IBMPlexSans',fontSize:15,color:'#393939',fontWeight:'bold', justifyContent:'center'}}>{registertexts.selectgrade}</Text>
                    <Text style={{ fontFamily:'IBMPlexSans',fontSize:13,color:'#393939',justifyContent:'flex-end' }} onPress={() => this.setState({ gradeDialogShowing: false })}>Done</Text>
                    </View>
                    <View>
                    <Picker
                        style={{backgroundColor:'white'}}
                        selectedValue={this.state.gradeId}
                        onValueChange={(itemValue, itemIndex) => this.onGradeSelected(itemIndex)}
                    >
                        {this.state.grades.map((grade, index) => (
                        <Picker.Item
                            key={index}
                            itemStyle={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}
                            label={grade.name}
                            value={grade.id}
                        />
                        ))}
                    </Picker>
                    </View>
                </View>
                </TouchableWithoutFeedback>
            </Modal>
                <Dialog
                ref="birthday_dialog"
                onTouchOutside={() => {
                    this.setState({ birthdayDialogVisible: false });
                }}
                width={width*90/100}
                height={height*50/100}
                visible={this.state.birthdayDialogVisible}
                dialogAnimation={fadeAnimation}
                >
                    <DialogContent style={{width:'100%', height:'90%', alignSelf:'center',alignItems:'center'}}>
                        <View style={{flexDirection:'row', width:'90%', justifyContent:'space-between',alignSelf:'center',marginTop:10}}>
                            <TouchableOpacity onPress={()=>this.setState({birthdayDialogVisible:false})} style={{justifyContent:'flex-start'}}>
                                <Text style={styles.dialogBtnTitle}>Cancel</Text>
                            </TouchableOpacity>
                            <View style={{}}></View>
                            <TouchableOpacity onPress={()=>this.onBirthdaySelect()}  style={{justifyContent:'flex-end'}}>
                                <Text style={styles.dialogBtnTitle}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{height:10}}></View>
                        <BirthdayPicker
                            selectedYear={this.state.selectYear}
                            selectedMonth={this.state.selectMonth}
                            selectedDay={this.state.selectDay}
                            yearsBack={100}
                            onYearValueChange={(year,i) => this.setState({selectYear:year})}
                            onMonthValueChange={(month,i) => this.setState({selectMonth:month})}
                            onDayValueChange={(day,i) => this.setState({selectDay:day})}
                            />
                </DialogContent>
            </Dialog>
                
            </SafeAreaView>
            </Fragment>
            <Dialog
                onTouchOutside={() => {
                    this.setState({ countryDialogShowingAndroid: false });
                }}
                visible={this.state.countryDialogShowingAndroid}
                width={(width*90)/100}
                height={(this.state.countries.length*50+50) > 300 ?300:(this.state.countries.length*50+50)}
                dialogAnimation={fadeAnimation}
                dialogStyle={{}}
                >
                <DialogContent style={{width:'100%', height:'100%',backgroundColor:'white'}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939', fontWeight:'bold', textAlign:'center', marginTop:10 }}>{registertexts.selectcountry}</Text>
                    <View style={{height:10}}></View>
                    <ScrollView style={{width:'100%'}}>
                    {this.state.countries.map((country, index) => (
                        <TouchableOpacity onPress={() => this.onCountrySelected(index)}  style={{width:'100%', height:50, justifyContent:'center', paddingLeft:10}}>
                            <Text onPress={() => this.onCountrySelected(index)} style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}>{country.name}</Text>
                        </TouchableOpacity>
                    ))}
                    </ScrollView>
                </DialogContent>
            </Dialog>
            <DatePicker
            ref={(ref)=>this.datePickerRef=ref}
            style={{width: 200, backgroundColor:'white', height:0}}
            date={'1988-01-01'}
            mode="date"
            showIcon={false}
            hideText={true}
            androidVariant="iosClone"
            placeholder="select birthdate"
            format="YYYY-MM-DD"
            minDate="1920-01-01"
            maxDate="2016-01-01"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"                    
            onDateChange={(date) => {this.setState({birthdate: date})}}
            customStyles={{
                dateIcon: {
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  marginLeft: 0,
                  height:0,
                  width:0
                },
                dateInput: {
                  height: 0,
                  width:0
                },

                // ... You can check the source to find the other keys.
              }}
            />
            
           </View>
	    );
	}
}
