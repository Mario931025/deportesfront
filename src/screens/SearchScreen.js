import React,{Component, Fragment} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet, Text, View, StatusBar,Image,Dimensions,Linking, TouchableOpacity, TextInput, FlatList } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import { resetNavigation } from '../utils/Common'
import { Color, Font } from '../styles/config';
import { Icon, CheckBox } from 'react-native-elements';
import {searchtexts, commontexts} from '../utils/apptexts'
import { CommonStyles } from '../styles/commonStyles';
import SafeArea, { type SafeAreaInsets } from 'react-native-safe-area';
import { getattendancerecords } from '../services';
const PERSON = require('../resources/icons/placeholder_icon.jpg');
import moment from "moment";
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Set","Oct","Nov","Dic"];
import Spinner from 'react-native-loading-spinner-overlay';
import BottomBar from './BottomBar'

const styles = StyleSheet.create({
    checkbox: {
        marginRight: 0,
        backgroundColor: 'transparent',
		borderWidth: 0,
		marginLeft: 0,
    },
});

export default class SearchScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
            isexam:false,
            topinsets:0,
            bottominsets:0,
            assistanceRecords:[],
            allData:[],
            refreshingTab1:false,
            visible:true,
            searchtext:'',
            isStudent:false
		}
    }
    
    getTime(item){
        const momentEndDate = moment(item.created_at, 'YYYY-MM-DD HH:mm:ss')
        var hour = momentEndDate.hours();
        var minute = momentEndDate.minutes();
    
        if(hour<=9){
            hour = "0"+hour;
        }
    
        if(minute<=9){
            minute = "0"+minute;
        }
    
        return hour+":"+minute+" hrs";
    
    }
    
    getDate(item){
        const momentEndDate = moment(item.created_at, 'YYYY-MM-DD HH:mm:ss')
        var year = momentEndDate.year();
        var date = momentEndDate.date();
        var month = MONTHS[momentEndDate.month()];
    
        if(date<=9){
          date = "0"+date;
        }
    
        return month+"/"+date+"/"+year;
    }

    onExamPress(value){
        var isExam = !this.state.isexam;
        this.setState({isexam:isExam});

        this.loadFilteredData(isExam);
    }

    loadFilteredData(isExam){
        var examValue = isExam ? 1 : 0;
        
        var filteredData = this.state.allData;
        if(examValue == 1){
            filteredData = filteredData.filter(function(el) {
                return el.is_exam == examValue;
            });
        }
        
        this.setState({assistanceRecords: filteredData});
    }

    retrieveMoreTab1 = async () => {
        var refreshingTab1 = this.state.refreshingTab1;
    
        var oldData = this.state.allData;
        var nextPageURL = this.state.nextPageURLTab1;
        if(nextPageURL!=null){
          var n = nextPageURL.indexOf("page=");
          var page = nextPageURL.substring(n+5, nextPageURL.length);
    
          this.setState({ refreshingTab1: true });
          //console.log('load more');
          let response = await getattendancerecords({page, search:this.state.searchtext}, this.props);
          let { data, next_page_url } = response;
          if(data && data.length>0){
            oldData = oldData.concat(data);
            this.setState({allData:oldData, nextPageURLTab1: next_page_url});

            if(this.state.isexam){
                var isExam = this.state.isexam;
                this.loadFilteredData(isExam);
            }else{
                this.setState({assistanceRecords: oldData});
            }
          }
        }
        this.setState({ refreshingTab1: false });
    
    }

	async componentDidMount() {
        var ref = this;
        SafeArea.getSafeAreaInsetsForRootView()
          .then((result) => {
            var topinsets = result.safeAreaInsets.top;
            var bottominsets = result.safeAreaInsets.bottom;
            ref.setState({topinsets:topinsets,bottominsets:bottominsets});
        })
        this.setState({allData:[], assistanceRecords:[]});
        let response = await getattendancerecords({search:this.state.searchtext},this.props);
        this.setState({visible:false});
        let { data, next_page_url} = response;
        this.setState({assistanceRecords: data, nextPageURLTab1: next_page_url, allData: data});

        let value = await AsyncStorage.getItem('isStudent');
        if(value == "1"){
            this.setState({isStudent: true});
        }
      
    }
    
    renderTab1Footer = () => {
        try {
          // Check If Loading
          if (this.state.refreshingTab1) {
          // if (this.state.loading) {
            return (
              <View style={{marginTop:10}}>
                <ActivityIndicator />
              </View>
            )
          }
          else {
            return (
            <View style={{height:15}}>
            </View>
            )
          }
        }
        catch (error) {
          //console.log(error);
        }
      };

	// Render any loading content that you like here
	render() {
        StatusBar.setBarStyle('light-content', true);

		return (
            <Fragment>
                <SafeAreaView style={{ flex:0, backgroundColor: Color.brownColor}} />
                <SafeAreaView style={{
                    flex: 1,
                    backgroundColor:Color.brownColor
                }}>
                <Spinner visible={this.state.visible} />
                <View style={{flex:1, backgroundColor:Color.white}}>
                    <View style={{width:'100%', backgroundColor:Color.brownColor, height:90}}>
                        <View style={{flexDirection:'row', width:'90%', alignSelf:'center', alignItems:'center', marginTop:15}}>
                            <TouchableOpacity style={{}} onPress={()=>this.props.navigation.goBack()}>
                                <Icon name="keyboard-backspace" size={30} type={Font.TypeMaterialIcons} color={Color.whiteColor}/>
                            </TouchableOpacity>
                            <Text style={{fontFamily:'IBMPlexSans', fontSize:20, color:Color.whiteColor, fontWeight:'bold', marginLeft:10}}>{searchtexts.search}</Text>
                        </View>
                    </View>

                    <View style={{backgroundColor:'white',marginTop:-25,flexDirection:'row', width:'90%', alignSelf:'center', justifyContent: 'center', alignItems:'center', height:50, borderColor:Color.brownColor, borderWidth:1, borderRadius:10}}>
                        <View style={{flexDirection:'row', width:'90%', alignSelf:'center', alignItems:'center'}}>
                            <Icon name="md-search-outline" size={30} type={Font.TypeIonIcons} color={Color.brownColor}/>
                            <TextInput
                            underlineColorAndroid="transparent"
                            placeholder={searchtexts.attendancsearch}
                            placeholderTextColor={'#828282'}
                            style={[CommonStyles.inputFieldL,{flex:1, paddingLeft:5, fontSize:15}]}
                            keyboardType={'default'}
                            ref={(c) => this.searchInput = c}
                            onChangeText={searchtext => this.setState({ searchtext })}
                            value={this.state.searchtext}
                            returnKeyType={'done'}
                            blurOnSubmit={true}
                            onSubmitEditing={() => {
                                this.componentDidMount();
                            }}
                            />
                        </View>
                    </View>
                    
                    <View style={{marginTop:20, width:'90%', alignSelf:'center'}}>
                        <CheckBox
                        containerStyle={[styles.checkbox,{margin:0, padding:0}]}
                        title={searchtexts.showexams}
                        iconLeft
                        textStyle={[{fontFamily:'IBMPlexSans', fontSize:15, color:Color.brownColor, fontWeight:'normal' , margin:0, padding:0, paddingBottom:3}]}
                        onPress={() => this.onExamPress()}
                        checked={this.state.isexam}
                        uncheckedIcon="square-o"
                        checkedColor={Color.brownColor}
                        uncheckedColor={Color.brownColor}
                        checkedIcon="check-square"
                        size={30}
                        />
                    </View>

                    {this.state.assistanceRecords.length > 0 ?
                    <View style={{ marginTop:10, width:'85%', alignSelf:'center',height:height-(this.state.topinsets+this.state.bottominsets+270)}}>
                        <FlatList
                        onEndReached={this.retrieveMoreTab1}
                        onEndReachedThreshold={height/1.2}
                        refreshing={this.state.refreshingTab1}
                        data={this.state.assistanceRecords}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={this.renderTab1Footer}
                        keyExtractor={(item, index) => String(index)}
                        renderItem={({item,index}) =>
                        <View style={{flexDirection:'row', width:'100%', alignSelf:'center', height:90, borderBottomWidth:1, borderColor:'#BDBDBD', alignItems:'center'}}>
                                {(item.student_user.profile_photo && item.student_user.profile_photo!=null) ?
                                    <Image style={{width:60, height:60, borderRadius:5, marginLeft:10}} source={{uri: item.student_user.profile_photo}}/>
                                    :
                                    <Image style={{width:60, height:60, borderRadius:5, marginLeft:10}} source={PERSON}/>
                                }                            
                                <View style={{height:60, flex:1}}>
                                <View style={{flexDirection:'row', flex:1, alignItems:'center'}}>
                                    <View style={{width:15}} />
                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialIcons} size={20} color={Color.brownColor} name={"calendar-today"}  />
                                    <Text style={{fontFamily:'IBMPlexSans', fontSize:15, color: Color.brownColor, paddingLeft:10}}>{this.getDate(item)}</Text>
                                    <View style={{width:20}} />
                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialCommunity} size={20} color={Color.brownColor} name={"clock"}  />
                                    <Text style={{fontFamily:'IBMPlexSans', fontSize:15, color: Color.brownColor, paddingLeft:10}}>{this.getTime(item)}</Text>
                                </View>
                                <View style={{flexDirection:'row', flex:1, alignItems:'center'}}>
                                    <View style={{width:15}} />
                                    <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialIcons} size={20} color={Color.brownColor} name={"person"}  />
                                    <Text style={{fontFamily:'IBMPlexSans', fontSize:15, color: '#828282', paddingLeft:10}}>{'Instructor: '+item.instructor_user.name+' '+item.instructor_user.last_name}</Text>
                                </View>
                            </View>
                        </View>
                        }/>
                    </View>
                    :
                    <View style={{flex:1, marginTop:10, width:'85%', alignSelf:'center', justifyContent: 'center',}}>
                        {!this.state.visible &&
                        <View style={{}}>
                            <Icon style={{backgroundColor:'transparent'}} type={Font.TypeIonIcons} size={80} color={'#BDBDBD'} name={"search"}  />
                            <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color: Color.brownColor, textAlign:'center', marginTop:10}}>{searchtexts.noresults}</Text>
                        </View>
                        }
                    </View>
                    }
                    <BottomBar properties={this.props} isStudent={this.state.isStudent} />
                </View>
                </SafeAreaView>
            </Fragment>
	    );
	}
}
