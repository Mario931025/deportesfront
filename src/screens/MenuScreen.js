import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, Text, View, TouchableOpacity ,Image ,ScrollView, Linking, Platform } from 'react-native';
const { width, height } = Dimensions.get('window');
import AsyncStorage from '@react-native-community/async-storage';
import { Icon } from 'react-native-elements';
import { Color, Font } from '../styles/config';
import {menutexts, hometexts} from '../utils/apptexts'
import { resetNavigation, clearStorage } from '../utils/Common'
import { logoutUser } from '../services';
import Spinner from 'react-native-loading-spinner-overlay';
import {ANDROID_SUB, IOS_SUB} from '../utils/Common'

const PERSON = require('../resources/icons/placeholder_icon.jpg');

export default class MenuScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      position:0,
      visible:false
    }
  }

  static propTypes = {
    position:PropTypes.number,
    properties:PropTypes.Object,
    toggleDrawer:PropTypes.function,
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    const { props, state } = this
    const propsChanged = (
      props.expirationDate !== nextProps.expirationDate ||
      props.isSubscriptionExpired !== nextProps.isSubscriptionExpired ||
      props.name !== nextProps.name ||
      props.localizedTitle !== nextProps.localizedTitle ||
      props.isTrialExpired !== nextProps.isTrialExpired

    )

    return propsChanged;

  }

  shouldComponentUpdate(props, nextProps){

  }

  loadMyProfile(){
    this.setState({position:0});
    this.props.toggleDrawer(0);
    this.props.properties.navigation.navigate('Profile',{});
  }


  async openRegisterAttendance(){
    this.setState({position:4});
    this.props.toggleDrawer(4);

    var expired = await AsyncStorage.getItem('expired');
    if(expired == "1"){
        this.setState({inAppDialogshowing:true});
        return;
    }

    if(!this.props.isStudent){
      this.props.onAttendancePress();
    }else{
      this.props.properties.navigation.navigate('RegisterAttendance',{isStudent: this.props.isStudent, title: this.props.isStudent ? hometexts.registerattendance : hometexts.takestudentattendance});
    }
  }

  async loadRecords(){
    this.setState({position:3});
    this.props.toggleDrawer(3);
    var expired = await AsyncStorage.getItem('expired');
    if(expired == "1"){
        this.setState({inAppDialogshowing:true});
        return;
    }
    this.props.properties.navigation.navigate('Records',{});

    /*if(this.state.isStudent){
      this.props.properties.navigation.navigate('Records',{});
    }else{
      this.loadSearch();
    }*/
  }

  async loadSearch(){
    this.setState({position:2});
    this.props.toggleDrawer(3);
    var expired = await AsyncStorage.getItem('expired');
    if(expired == "1"){
        this.setState({inAppDialogshowing:true});
        return;
    }
    this.props.properties.navigation.navigate('Search',{});
  }

  async loadFilter(){
    this.setState({position:2});
    this.props.toggleDrawer(2);
    var expired = await AsyncStorage.getItem('expired');
    if(expired == "1"){
        this.setState({inAppDialogshowing:true});
        return;
    }
    this.props.properties.navigation.navigate('Filter',{});
  }

  async logout(){
    this.setState({visible: true});
    await logoutUser({},this.props.properties);
    this.setState({visible: false});

  }

  openSubscription(){
    this.setState({position:2});
    this.props.toggleDrawer(4);
    this.props.openSubscription();
  }

  cancelSubscription(){
    this.setState({position:2});
    this.props.toggleDrawer(4);
    this.props.cancelSubscription();
    /*if(Platform.OS === 'ios'){
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    }else{
      Linking.openURL('https://play.google.com/store/account/subscriptions?package=com.app.ikmf&sku='+ANDROID_SUB);
    }*/
  }


  render() {
    return(
      <View style={{flex: 1, backgroundColor:'white'}}>
          <Spinner visible={this.state.visible} />
          <View style={{flexDirection:'row', width:'75%', justifyContent:'flex-end', marginTop:20, alignSelf:'center'}}>
            <TouchableOpacity onPress={()=>this.props.toggleDrawer(-1)}>
              <Icon name="md-close-circle-outline" type={Font.TypeIonIcons} size={30} color={Color.brownColor} />
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:'row', alignItems:'center', width:'75%',alignSelf:'center' }}>
              {this.props.photo == '' ?
              <Image style={{width:60, height:60, borderRadius:30}} source={PERSON}/>
              :
              <Image defaultSource={PERSON} style={{width:60, height:60, borderRadius:30}} source={{uri: this.props.photo}}/>
              }
              <View style={{marginLeft:15}}>
                <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color:Color.brownColor, fontWeight:'bold'}}>{this.props.name}</Text>
                <Text style={{fontFamily:'IBMPlexSans', fontSize:17, color:'#828282', marginTop:3 , fontWeight:'normal'}}>{this.props.role}</Text>
                <Text style={{fontFamily:'IBMPlexSans', fontSize:17, color:'#828282', marginTop:3 , fontWeight:'normal'}}>{this.props.academy}</Text>
              </View>
          </View>

          <View style={{width:'75%',alignSelf:'center', marginTop:40 }}>
              <TouchableOpacity onPress={()=>this.loadMyProfile()} style={{flexDirection:'row', width:'100%', alignItems:'center'}}>
                <Icon name="user-o" type={Font.TypeFontAwesome} size={22} color={'#000000'} />
                <Text style={{fontFamily:'IBMPlexSans', fontSize:19, color:'#030303', fontWeight:'normal', paddingLeft:20}}>{menutexts.myprofile}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=>this.loadSearch()} style={{flexDirection:'row', width:'100%', alignItems:'center', marginTop:30}}>
                <Icon name="search" type={Font.TypeFeather} size={22} color={'#030303'} />
                <Text style={{fontFamily:'IBMPlexSans', fontSize:19, color:'#030303', fontWeight:'normal', paddingLeft:20}}>{menutexts.search}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=>this.loadRecords()}  style={{flexDirection:'row', width:'100%', alignItems:'center', marginTop:30}}>
                <Icon name="clock-outline" type={Font.TypeMaterialCommunity} size={22} color={'#030303'} />
                <Text style={{fontFamily:'IBMPlexSans', fontSize:19, color:'#030303', fontWeight:'normal', paddingLeft:20}}>{menutexts.records}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={()=>this.openRegisterAttendance()} style={{flexDirection:'row', width:'100%', alignItems:'center', marginTop:30}}>
                <Icon name="calendar-clock" type={Font.TypeMaterialCommunity} size={22} color={'#030303'} />
                <Text style={{fontFamily:'IBMPlexSans', fontSize:19, color:'#030303', fontWeight:'normal', paddingLeft:20}}>{menutexts.registerattendance}</Text>
              </TouchableOpacity>

              {this.state.isStudent &&
              <View style={{}}>
                {(!this.props.isTrialExpired || this.props.isSubscriptionExpired) &&
                <TouchableOpacity onPress={()=>this.openSubscription()} style={{flexDirection:'row', width:'100%', alignItems:'center', marginTop:30}}>
                  <Icon name="subscriptions" type={Font.TypeMaterialIcons} size={22} color={'#030303'} />
                  <Text style={{fontFamily:'IBMPlexSans', fontSize:19, color:'#030303', fontWeight:'normal', paddingLeft:20}}>{this.props.localizedTitle}</Text>
                </TouchableOpacity>
                }

                {(this.props.expirationDate!=null && this.props.isSubscriptionExpired == false) &&
                <TouchableOpacity onPress={()=>this.cancelSubscription()} style={{flexDirection:'row', width:'100%', alignItems:'center', marginTop:30}}>
                  <Icon name="cancel" type={Font.TypeMaterialCommunity} size={22} color={'#030303'} />
                  <Text style={{fontFamily:'IBMPlexSans', fontSize:19, color:'#030303', fontWeight:'normal', paddingLeft:20}}>{menutexts.cancelsubscription}</Text>
                </TouchableOpacity>
                }
              </View>
              }

              <TouchableOpacity onPress={()=>this.logout()} style={{flexDirection:'row', width:'100%', alignItems:'center', marginTop:40, justifyContent: 'center', borderColor:Color.brownColor, borderWidth:1, borderRadius:5, height:55}}>
                <Icon name="exit-outline" type={Font.TypeIonIcons} size={30} color={Color.brownColor} />
                <Text style={{fontFamily:'IBMPlexSans', fontSize:19, color:Color.brownColor, fontWeight:'bold', paddingLeft:5}}>{menutexts.logout}</Text>
              </TouchableOpacity>

          </View>
          
      </View>

    );
  }
}
