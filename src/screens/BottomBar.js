import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, Text, View, TouchableOpacity ,Image ,ScrollView, Linking } from 'react-native';
const { width, height } = Dimensions.get('window');
import AsyncStorage from '@react-native-community/async-storage';
import { Icon } from 'react-native-elements';
import { Color, Font } from '../styles/config';
import {footertexts, hometexts} from '../utils/apptexts'

const CENTERMENU = require('../resources/icons/menucenter.png');
const BOTTOMCURVE = require('../resources/images/bottom_curve.png');

export default class BottomBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      position:0
    }
  }

  static propTypes = {
    position:PropTypes.number,
    properties:PropTypes.Object,
  };

  async loadFilter(){
    this.setState({position:2});
    var expired = await AsyncStorage.getItem('expired');
    if(expired == "1"){
        this.setState({inAppDialogshowing:true});
        return;
    }
    this.props.properties.navigation.navigate('Filter',{});
  }

  async loadSearch(){
    this.setState({position:2});
    var expired = await AsyncStorage.getItem('expired');
    if(expired == "1"){
        this.setState({inAppDialogshowing:true});
        return;
    }
    this.props.properties.navigation.navigate('Search',{});
  }

  async loadRecords(){
    this.setState({position:2});
    var expired = await AsyncStorage.getItem('expired');
    if(expired == "1"){
        this.setState({inAppDialogshowing:true});
        return;
    }
    this.props.properties.navigation.navigate('Records',{});
    /*if(this.props.isStudent){
      this.props.properties.navigation.navigate('Records',{});
    }else{
      this.loadSearch();
    }*/
  }

  async openRegisterAttendance(){
    var expired = await AsyncStorage.getItem('expired');
    if(expired == "1"){
        this.setState({inAppDialogshowing:true});
        return;
    }
    this.props.properties.navigation.navigate('RegisterAttendance',{isStudent: this.props.isStudent, from:'bottom', title: this.props.isStudent ? hometexts.registerattendance : hometexts.takestudentattendance});
  }

  loadMyProfile(){
    this.setState({position:0});
    this.props.properties.navigation.navigate('Profile',{});
  }

  loadMyHome(){
    this.setState({position:0});
    this.props.properties.navigation.navigate('Home',{});
  }

 
  render() {
    return(
      <View style={{height:95, justifyContent:'flex-end', width:'100%', position:'absolute', bottom:0, left:0}}>
            <Image style={{height:25, width: 25 * 4.964, position:'absolute', top:1, left: (width - (25 * 4.964))/2 }} source={BOTTOMCURVE}/>
            <View style={{height:70,width:'100%', flexDirection:'row', alignItems:'flex-end', backgroundColor:Color.brownColor}}>
                <TouchableOpacity onPress={()=>this.loadMyHome()} style={{width:'18%', alignItems:'center', marginBottom:5}}>
                    <Icon size={27} name="home-outline" type={Font.TypeIonIcons} color="white"/>
                    <Text style={{marginTop:5,fontFamily:'IBMPlexSans-Medium', fontSize:12, color:Color.whiteColor}}>{footertexts.home}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>this.loadSearch()} style={{width:'18%', alignItems:'center', marginBottom:5}}>
                    <Icon size={27} name="search-outline" type={Font.TypeIonIcons} color="white"/>
                    <Text style={{marginTop:5,fontFamily:'IBMPlexSans-Medium', fontSize:12, color:Color.whiteColor}}>{footertexts.search}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>this.openRegisterAttendance()} style={{width:'28%', marginBottom:10, alignItems:'center'}}>
                    <Image style={{width:80, height:80}} source={CENTERMENU} />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>this.loadRecords()} style={{width:'18%', alignItems:'center', marginBottom:5}}>
                    <Icon size={27} name="clock-outline" type={Font.TypeMaterialCommunity} color="white"/>
                    <Text style={{marginTop:5,fontFamily:'IBMPlexSans-Medium', fontSize:12, color:Color.whiteColor}}>{footertexts.records}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>this.loadMyProfile()} style={{width:'18%', alignItems:'center', marginBottom:5}}>
                    <Icon size={27} name="person-outline" type={Font.TypeIonIcons} color="white"/>
                    <Text style={{marginTop:5,fontFamily:'IBMPlexSans-Medium', fontSize:12, color:Color.whiteColor}}>{footertexts.profile}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  }
}

