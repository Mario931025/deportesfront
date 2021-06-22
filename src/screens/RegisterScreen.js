import React,{Component} from 'react';
import { SafeAreaView, Modal, ActivityIndicator, ScrollView, TouchableWithoutFeedback, StyleSheet, Text, View, TouchableOpacity, StatusBar,Image,Dimensions,Linking, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import { NavigationActions,StackActions } from 'react-navigation';
import {registertexts} from '../utils/apptexts'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Color, Font } from '../styles/config';
import { Icon } from 'react-native-elements';
import { CommonStyles } from '../styles/commonStyles';
import { register, getcities, getcountries, getgrades, getacamedies, getroles } from '../services';
import {Picker} from '@react-native-community/picker';
import Spinner from 'react-native-loading-spinner-overlay';
import BirthdayPicker from '../utils//BirthdayPicker';
import ReactNative from 'react-native';
import Toast from 'react-native-simple-toast';
import Dialog, { SlideAnimation, DialogContent, FadeAnimation } from 'react-native-popup-dialog';
import { resetNavigation, validateEmail } from '../utils/Common';
import DatePicker from 'react-native-datepicker'

const fadeAnimation = new FadeAnimation({ animationDuration: 150 });
const slideAnimation = new SlideAnimation({
  slideFrom: 'bottom',
});

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

export default class RegisterScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
            countries:[],
            cities:[],
            roles:[],
            grades:[],
            academies:[],
            visible:true,
            countryDialogShowing:false,
            countryDialogShowingAndroid:false,
            cityDialogShowing:false,
            cityDialogShowingAndroid:false,
            gradeDialogShowing:false,
            gradeDialogShowingAndroid:false,
            academyDialogShowing:false,
            academyDialogShowingAndroid:false,
            userTypeDialogShowing:false,
            userTypeDialogShowingAndroid:false,
            selectcountry:registertexts.country,
            selectcity:registertexts.city,
            selectgrade:registertexts.grade,
            selectacademy:registertexts.academy,
            selectuser:registertexts.usertype,
            birthdayDialogVisible:false,
            birthdate:registertexts.birthdate,
            selectDay:27,
            selectMonth:2,
            selectYear:1988,
            firstname:'',
            lastname:'',
            email:'',
            password:'',
            repassword:'',
            documentnumber:'',
            phone:'',
            selectDate:'1988-01-01',
            
        }
        this._scrollToInput = this._scrollToInput.bind(this);
        this.datepicker = React.createRef();

    }

    

    _scrollToInput (reactNode: any) {
        this.scroll.scrollToFocusedInput(reactNode);
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

    async onGradeSelected(index){
		this.setState({gradeDialogShowingAndroid:false});
		this.setState({selectGradeIndex:index,selectgrade:this.state.grades[index].name,gradeId:this.state.grades[index].id, });
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

    async onAcademySelected(index){
		this.setState({academyDialogShowingAndroid:false});
		this.setState({selectAcademyIndex:index,selectacademy:this.state.academies[index].name,academyId:this.state.academies[index].id, });
    }

    showUserTypeDialog(){
		if(Platform.OS === 'ios'){
			if(!this.state.usertypeId)
			    this.onUserTypeSelected(0);
                
            this.setState({userTypeDialogShowing:true});
		}else{
			this.setState({userTypeDialogShowingAndroid:true});
		}
    }

    async onUserTypeSelected(index){
		this.setState({userTypeDialogShowingAndroid:false});
		this.setState({selectUserTypeIndex:index,selectuser:this.state.roles[index].name,usertypeId:this.state.roles[index].id, });
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
		await this.setState({selectCountryIndex:index, countryId:this.state.countries[index].id, });
        if(Platform.OS === 'android'){
            this.onDoneClicked();
        }
    }

    showCityDialog(){
        if(this.state.countries.length == 0){
            Toast.show(registertexts.countryerror);
            return
        }
        else if(this.state.selectcountry==registertexts.country && this.state.cities.length == 0){
            Toast.show(registertexts.countryerror);
            return
        }

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
        await this.setState({visible:true, countryDialogShowing:false, selectcountry:this.state.countries[this.state.selectCountryIndex].name,});
        var ref = this;
        setTimeout( () => {
            ref.setState({visible:false});
        }, 3000);

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
        if(Platform.OS === 'android'){
            this.setState({birthdate: this.state.selectDate});
            return
        }

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
        let response = await getcountries({});
        this.setState({visible:false});
        if(response && response.length > 0){
            if(response[0]['id']){
                this.setState({countries:response});
            }
        }

        this.loadGrades();
        this.loadAcademies();
        this.loadRoles();
    }
    
    async loadGrades(){
        let response = await getgrades({});
        if(response && response.length > 0){
            if(response[0]['id']){
                this.setState({grades:response});
            }
        }
    }

    async loadAcademies(){
        let response = await getacamedies({});
        if(response && response.length > 0){
            if(response[0]['id']){
                this.setState({academies:response});
            }
        }
    }

    async loadRoles(){
        let response = await getroles({});
        if(response && response.length > 0){
            if(response[0]['id']){
                this.setState({roles:response});
            }
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

    async registerSubmit(){
        if(this.state.firstname.trim() == ''){
            Toast.show(registertexts.blankfirstnameerror);
            return
        }
        else if(this.state.lastname.trim() == ''){
            Toast.show(registertexts.blanklastnameerror);
            return
        }
        else if(this.state.email.trim() == ''){
            Toast.show(registertexts.blankemailerror);
            return
        }
        else if(this.state.password.trim() == ''){
            Toast.show(registertexts.blankpassworderror);
            return
        }
        else if(this.state.repassword.trim() == ''){
            Toast.show(registertexts.blankrepassworderror);
            return
        }
        /*else if(this.state.birthdate.trim() == registertexts.birthdate){
            Toast.show(registertexts.blankbirthdateerror);
            return
        }*/
        else if(this.state.selectcity.trim() == registertexts.city){
            Toast.show(registertexts.blankcityerror);
            return
        }
        else if(this.state.selectcountry.trim() == registertexts.country){
            Toast.show(registertexts.blankcountryerror);
            return
        }
        else if(this.state.selectacademy.trim() == registertexts.academy){
            Toast.show(registertexts.blankacademyerror);
            return
        }
        /*else if(this.state.selectgrade.trim() == registertexts.grade){
            Toast.show(registertexts.blankgradeerror);
            return
        }*/
        else if(this.state.phone.trim() == ''){
            Toast.show(registertexts.blankphonenumbererror);
            return
        }
        /*else if(this.state.documentnumber.trim() == ''){
            Toast.show(registertexts.blankdocumenterror);
            return
        }*/
        else if(this.state.firstname.trim() == '' || this.state.lastname.trim() == '' || this.state.email.trim() == '' || this.state.password.trim() == '' || this.state.repassword.trim() == ''
        || /*this.state.birthdate.trim() == registertexts.birthdate  ||*/ this.state.selectcity.trim() == registertexts.city || this.state.selectcountry.trim() == registertexts.country
        || this.state.selectacademy.trim() == registertexts.academy || /*this.state.selectgrade.trim() == registertexts.grade ||*/ this.state.phone == '' /*|| this.state.documentnumber.trim() == ''*/){
            Toast.show(registertexts.blankfielderror);
            return
        }
        else if(!validateEmail(this.state.email)){
            Toast.show(registertexts.validemail);
            return
        }
        else if(this.state.password != this.state.repassword){
            Toast.show(registertexts.passworderror);
            return
        }
        else if(this.state.password.length <8){
            Toast.show(registertexts.passwordlengtherror);
            return
        }
        else if(this.state.phone.length <6){
            Toast.show(registertexts.phoneerror);
            return
        }

        var selectRole = 1;
        var filteredData = this.state.roles;
        filteredData = filteredData.filter(function(el) {
            return el.name == "Solo Alumno";
        });
        if(filteredData.length > 0){
            selectRole = filteredData[0].id;
        }
        

        let params = {
            email:this.state.email,
            name:this.state.firstname,
            last_name:this.state.lastname,
            birthday:this.state.birthdate == registertexts.birthdate ? null : this.state.birthdate,
            /*role_id:selectRole,*/
            city_id:this.state.cityId,
            academy_id:this.state.academyId,
            password:this.state.password,
            document_number:this.state.documentnumber,
            phone:this.state.phone,
            academy_id:this.state.academyId,
            /*grade_id:this.state.gradeId,*/
        };

        this.setState({visible:true});
        let response = await register(params);
        let { message, status } = response;
        this.setState({visible:false});
        if(status == 200){
            resetNavigation('Login', {}, this.props);
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
            <Spinner visible={this.state.visible} />
            <KeyboardAwareScrollView  ref={ref => {this.scroll = ref}} contentContainerStyle={{alignItems:'center'}} style={{flex:1}}>
                <View style={{height:50}} />

                <Text style={{textAlign:'center',fontFamily:'IBMPlexSans', fontSize:43, color:Color.brownColor, fontWeight:'bold'}}>{registertexts.register}</Text>
                <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:40}}>
                    <TextInput
                    underlineColorAndroid="transparent"
                    placeholder={registertexts.firstname}
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
                    placeholder={registertexts.lastname}
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
                    ref={(c) => this.lastNameInput = c}
                    onFocus={(event: Event)=> {
                        this._scrollToInput(ReactNative.findNodeHandle(this.lastNameInput))
                    }}
                    />
                </View>
                <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                    <TextInput
                    underlineColorAndroid="transparent"
                    placeholder={registertexts.email}
                    placeholderTextColor={Color.brownColor}
                    style={[CommonStyles.inputFieldL,{flex:1}]}
                    keyboardType={'email-address'}
                    onChangeText={email => this.setState({ email })}
                    value={this.state.email}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                        this.phoneInput.focus()
                    }}
                    ref={(c) => this.emailInput = c}
                    onFocus={(event: Event)=> {
                        this._scrollToInput(ReactNative.findNodeHandle(this.emailInput))
                    }}
                    />
                </View>

                <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                    <TextInput
                    underlineColorAndroid="transparent"
                    placeholder={registertexts.phone}
                    placeholderTextColor={Color.brownColor}
                    style={[CommonStyles.inputFieldL,{flex:1}]}
                    keyboardType={'phone-pad'}
                    onChangeText={phone => this.setState({ phone })}
                    value={this.state.phone}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                        this.documentInput.focus()
                    }}
                    ref={(c) => this.phoneInput = c}
                    onFocus={(event: Event)=> {
                        this._scrollToInput(ReactNative.findNodeHandle(this.phoneInput))
                    }}
                    />
                </View>

                <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                    <TextInput
                    underlineColorAndroid="transparent"
                    placeholder={registertexts.documentnumber}
                    placeholderTextColor={Color.brownColor}
                    style={[CommonStyles.inputFieldL,{flex:1}]}
                    keyboardType={'default'}
                    onChangeText={documentnumber => this.setState({ documentnumber })}
                    value={this.state.documentnumber}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                    }}
                    ref={(c) => this.documentInput = c}
                    onFocus={(event: Event)=> {
                        this._scrollToInput(ReactNative.findNodeHandle(this.documentInput))
                    }}
                    />
                </View>


                <TouchableOpacity onPress={() => this.showBirthdayDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.birthdate}</Text>
                </TouchableOpacity>

                

                {/*<TouchableOpacity onPress={() => this.showUserTypeDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectuser}</Text>
                    <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                        <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.showGradeDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectgrade}</Text>
                    <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                        <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                    </View>
                </TouchableOpacity>*/}

                <TouchableOpacity onPress={() => this.showCountryDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectcountry}</Text>
                    <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                        <Icon style={{backgroundColor:'transparent', alignSelf:'flex-end'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.showCityDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectcity}</Text>
                    <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                        <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.showAcademyDialog()} style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20, height:40,}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:18,color:Color.brownColor, paddingLeft:10}} >{this.state.selectacademy}</Text>
                    <View style={{flexDirection:'row', flex:1, justifyContent:'flex-end'}}>
                        <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={30} color={Color.brownColor} name={"chevron-down"}  />
                    </View>
                </TouchableOpacity>

                
                <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                    <TextInput
                    underlineColorAndroid="transparent"
                    placeholder={registertexts.password}
                    placeholderTextColor={Color.brownColor}
                    style={[CommonStyles.inputFieldL,{flex:1}]}
                    secureTextEntry={true}
                    keyboardType={'default'}
                    onChangeText={password => this.setState({ password })}
                    value={this.state.password}
                    returnKeyType={'next'}
                    onSubmitEditing={() => {
                        this.repasswordInput.focus()
                    }}
                    ref={(c) => this.passwordInput = c}
                    onFocus={(event: Event)=> {
                        this._scrollToInput(ReactNative.findNodeHandle(this.passwordInput))
                    }}
                    />
                </View>
                <View style={{flexDirection:'row', width:'80%', alignSelf:'center', alignItems:'center', borderBottomWidth:1, borderColor: '#BDBDBD', marginTop:20}}>
                    <TextInput
                    underlineColorAndroid="transparent"
                    placeholder={registertexts.repassword}
                    placeholderTextColor={Color.brownColor}
                    style={[CommonStyles.inputFieldL,{flex:1}]}
                    secureTextEntry={true}
                    keyboardType={'default'}
                    onChangeText={repassword => this.setState({ repassword })}
                    value={this.state.repassword}
                    returnKeyType={'done'}
                    ref={(c) => this.repasswordInput = c}
                    onFocus={(event: Event)=> {
                        this._scrollToInput(ReactNative.findNodeHandle(this.repasswordInput))
                    }}
                    />
                </View>
                <TouchableOpacity onPress={()=>this.registerSubmit()} style={{borderRadius:5,backgroundColor:Color.brownColor,marginTop:40, width:width*80/100, alignSelf:'center', flexDirection:'row', height:45, justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'bold'}}>{registertexts.save}</Text>
                </TouchableOpacity>

                <Text style={{flexDirection:'row', alignItems:'center', marginTop: 15, textAlign:'center', width:'90%', alignSelf:'center'}}>
                      <Text style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor}}>Al registrarte, acepta nuestros </Text>
                      <Text onPress={()=>this.props.navigation.navigate('InAppPage',{url:'http://ikmf.upload.com.py/terms_of_use.pdf'})} style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor, fontWeight:'bold', textDecorationLine:'underline'}}>términos de uso</Text>
                      <Text style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor}}> y </Text>
                      <Text onPress={()=>this.props.navigation.navigate('InAppPage',{url:'http://kravmaga.com.py/privacidad/'})} style={{fontFamily:'IBMPlexSans', fontSize:14, color:Color.brownColor, fontWeight:'bold', textDecorationLine:'underline'}}>política de privacidad</Text>
                </Text>

                <Text style={{fontFamily:'IBMPlexSans', fontSize:12, color:Color.brownColor, fontWeight:'normal', marginTop:20}}>{registertexts.alreadyhaveaccount}</Text>
                <Text onPress={()=>this.props.navigation.goBack()} style={{fontFamily:'IBMPlexSans', fontSize:12, color:Color.brownColor, fontWeight:'bold', marginTop:5, marginBottom:20}}>{registertexts.login}</Text>

            </KeyboardAwareScrollView>
            
            <Dialog
                ref="countrydialog"
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
                    <Text style={{justifyContent:'flex-start',color: "white",fontSize: 16,}}>Cancel</Text>
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
                        <TouchableOpacity onPress={() => this.onGradeSelected(index)}  style={{width:'100%', height:50, justifyContent:'center', paddingLeft:10}}>
                            <Text onPress={() => this.onGradeSelected(index)} style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}>{grade.name}</Text>
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
                onTouchOutside={() => {
                    this.setState({ userTypeDialogShowingAndroid: false });
                }}
                visible={this.state.userTypeDialogShowingAndroid}
                width={(width*90)/100}
                height={(this.state.roles.length*50+50) > 300 ?300:(this.state.roles.length*50+50)}
                dialogAnimation={fadeAnimation}
                >
                <DialogContent style={{width:'100%', height:'100%',backgroundColor:'white'}}>
                    <Text style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939', fontWeight:'bold', textAlign:'center', marginTop:10 }}>{registertexts.usertype}</Text>
                    <View style={{height:10}}></View>
                    <ScrollView style={{width:'100%', flex:1}}>
                    {this.state.roles.map((role, index) => (
                        <TouchableOpacity onPress={() => this.onUserTypeSelected(index)}  style={{width:'100%', height:50, justifyContent:'center', paddingLeft:10}}>
                            <Text onPress={() => this.onUserTypeSelected(index)} style={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}>{role.name}</Text>
                        </TouchableOpacity>
                    ))}
                    </ScrollView>
                </DialogContent>
            </Dialog>

            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.userTypeDialogShowing}
            >
                <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                    <View style={styles.buttonContainer}>
                    <Text style={{justifyContent:'flex-start',color: "white",fontSize: 16,}}>Done</Text>
                    <Text style={{ fontFamily:'IBMPlexSans',fontSize:15,color:'#393939',fontWeight:'bold', justifyContent:'center'}}>{registertexts.selectuser}</Text>
                    <Text style={{ fontFamily:'IBMPlexSans',fontSize:13,color:'#393939',justifyContent:'flex-end' }} onPress={() => this.setState({ userTypeDialogShowing: false })}>Done</Text>
                    </View>
                    <View>
                    <Picker
                        style={{backgroundColor:'white'}}
                        selectedValue={this.state.usertypeId}
                        onValueChange={(itemValue, itemIndex) => this.onUserTypeSelected(itemIndex)}
                    >
                        {this.state.roles.map((role, index) => (
                        <Picker.Item
                            key={index}
                            itemStyle={{fontFamily:'IBMPlexSans',fontSize:13,color:'#393939'}}
                            label={role.name}
                            value={role.id}
                        />
                        ))}
                    </Picker>
                    </View>
                </View>
                </TouchableWithoutFeedback>
            </Modal>
            <DatePicker
            ref={(ref)=>this.datePickerRef=ref}
            style={{width: 200}}
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
            />          
                
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
        
	    );
	}
}
