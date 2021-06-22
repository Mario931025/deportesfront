import React,{Component, Fragment} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet, TouchableOpacity, Text, View, StatusBar,Image,Dimensions,Linking, FlatList } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import { resetNavigation } from '../utils/Common'
import ViewPager from '@react-native-community/viewpager';
import { recordstexts, commontexts } from '../utils/apptexts'
import { Color, Font } from '../styles/config';
import { Icon } from 'react-native-elements';
import { getattendancerecords, getpromotionalrecords, url } from '../services';
const PERSON = require('../resources/icons/placeholder_icon.jpg');
import SafeArea, { type SafeAreaInsets } from 'react-native-safe-area';
import moment from "moment";
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Set","Oct","Nov","Dic"];
import Spinner from 'react-native-loading-spinner-overlay';
import BottomBar from './BottomBar'
import { ScrollView } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  
});

export default class RecordsScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
		      	selectTab:1,
            currentPage:0,
            pages:2,
            visible:true,
            topinsets:0,
            bottominsets:0,
            refreshingTab1:false,
            refreshingTab2:false,
            assistanceRecords:[],
            promoRecords:[],
            isStudent:false,
        }
        this.pager = React.createRef();

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

onPageSelected = (e: PageSelectedEvent) => {
    //this.setState({page: e.nativeEvent.position});
    var position = e.nativeEvent.position;
    this.setState({currentPage:position, selectTab:position+1});
    //this.selectTab(position+1);
};

    
/*async onPageSelected(params){
    this.setState({currentPage:params['position'], selectTab:params['position']+1});
    this.selectTab(params['position']+1);
}*/

async selectTab(index){
    this.setState({selectTab:index});
    const indicator = this.pager;
    if(indicator && indicator.current!=null){
        indicator.current.setPage(index - 1, true);
    }

    if(index == 2 && this.state.promoRecords.length == 0){
        this.setState({visible:true});
        let response = await getpromotionalrecords({}, this.props);
        this.setState({visible:false});
        let { data, next_page_url} = response;
        this.setState({promoRecords: data, nextPageURLTab2: next_page_url});
    }
}

retrieveMoreTab2 = async () => {
    var refreshingTab2 = this.state.refreshingTab2;

    var oldData = this.state.promoRecords;
    var nextPageURL = this.state.nextPageURLTab2;
    if(nextPageURL!=null){
      var n = nextPageURL.indexOf("page=");
      var page = nextPageURL.substring(n+5, nextPageURL.length);

      this.setState({ refreshingTab2: true });
      //console.log('load more');
      let response = await getpromotionalrecords({page}, this.props);
      let { data, next_page_url } = response;
      if(data && data.length>0){
        oldData = oldData.concat(data);
        this.setState({promoRecords:oldData, nextPageURLTab2: next_page_url});
      }
    }
    this.setState({ refreshingTab2: false });

  }

retrieveMoreTab1 = async () => {
    var refreshingTab1 = this.state.refreshingTab1;

    var oldData = this.state.attendancerecords;
    var nextPageURL = this.state.nextPageURLTab1;
    if(nextPageURL!=null){
      var n = nextPageURL.indexOf("page=");
      var page = nextPageURL.substring(n+5, nextPageURL.length);

      this.setState({ refreshingTab1: true });
      //console.log('load more');
      let response = await getattendancerecords({page}, this.props);
      let { data, next_page_url } = response;
      if(data && data.length>0){
        oldData = oldData.concat(data);
        this.setState({attendancerecords:oldData, nextPageURLTab1: next_page_url});
      }
    }
    this.setState({ refreshingTab1: false });

  }

  renderTab2Footer = () => {
    try {
      // Check If Loading
      if (this.state.refreshingTab2) {
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


	async componentDidMount() {
      var ref = this;
		  SafeArea.getSafeAreaInsetsForRootView()
			.then((result) => {
			////console.log(result);
        var topinsets = result.safeAreaInsets.top;
        var bottominsets = result.safeAreaInsets.bottom;

        ref.setState({topinsets:topinsets,bottominsets:bottominsets});
      })
        
      let response = await getattendancerecords({},this.props);
      this.setState({visible:false});
      let { data, next_page_url} = response;
      var item = { student_user: {}, instructor_user:{ name:'Hardik', last_name:'Mashru'}, created_at: "2021-04-06T14:10:08.000000Z"};
      this.setState({assistanceRecords: data, nextPageURLTab1: next_page_url});
      let value = await AsyncStorage.getItem('isStudent');
      if(value == "1"){
          this.setState({isStudent: true});
      }
	}

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
                  <View style={{flex:1, backgroundColor:Color.white}}>
                      <Spinner visible={this.state.visible}/>
                      <View style={{width:'100%', backgroundColor:Color.brownColor, height:120}}>
                          <View style={{flexDirection:'row', width:'90%', alignSelf:'center', alignItems:'center'}}>
                              <TouchableOpacity style={{}} onPress={()=>this.props.navigation.goBack()}>
                                  <Icon name="keyboard-backspace" size={30} type={Font.TypeMaterialIcons} color={Color.whiteColor}/>
                              </TouchableOpacity>
                              <Text style={{fontFamily:'IBMPlexSans', fontSize:20, color:Color.whiteColor, fontWeight:'bold', marginLeft:10}}>{recordstexts.records}</Text>
                          </View>

                          <View style={{flexDirection:'row', width:'100%', alignSelf:'center', alignItems:'center', marginTop:14}}>
                              <View style={{width:'50%', height:80}}>
                                  <TouchableOpacity onPress={()=>this.selectTab(1)} style={{width:'100%', alignItems:'center', height:80}}>
                                      <Text style={{padding:10,textAlign:'center',fontFamily:'IBMPlexSans', fontSize:18, color:this.state.selectTab == 1 ?Color.whiteColor:'#FFFFFF', fontWeight: this.state.selectTab == 1 ? 'bold':'normal'}}>{recordstexts.attendancerecords}</Text>
                                      <View style={{width:'100%', height:this.state.selectTab == 1 ?2:0, backgroundColor:'white', position:'absolute', left:0, bottom:5}} />
                                  </TouchableOpacity>
                              </View>
                              <View style={{width:'50%', height:80}}>
                                  <TouchableOpacity onPress={()=>this.selectTab(2)} style={{width:'100%', alignItems:'center', flex:1}}>
                                      <Text style={{padding:10,textAlign:'center',fontFamily:'IBMPlexSans', fontSize:18, color:this.state.selectTab == 2 ?Color.whiteColor:'#FFFFFF', fontWeight: this.state.selectTab == 2 ? 'bold':'normal'}}>{recordstexts.promotionalrecords}</Text>
                                      <View style={{width:'100%', height:this.state.selectTab == 2 ?2:0, backgroundColor:'white', position:'absolute', left:0, bottom:5}} />
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </View>
                      
                      <View style={{height:height-(this.state.topinsets+this.state.bottominsets+210), width:'100%'}}>
                          {this.state.selectTab == 1 ?
                                <FlatList
                                    onEndReached={this.retrieveMoreTab1}
                                    onEndReachedThreshold={height/1.2}
                                    refreshing={this.state.refreshingTab1}
                                    data={this.state.assistanceRecords}
                                    showsVerticalScrollIndicator={false}
                                    scrollEnabled={true}
                                    ListFooterComponent={this.renderTab1Footer}
                                    keyExtractor={(item, index) => String(index)}
                                    renderItem={({item,index}) =>
                                    <View style={{flexDirection:'row', width:'90%', alignSelf:'center', height:100, borderBottomWidth:1, borderColor:'#BDBDBD', alignItems:'center'}}>
                                        {(item.student_user.profile_photo && item.student_user.profile_photo!=null) ?
                                          <Image style={{width:70, height:70, borderRadius:5, marginLeft:10}} source={{uri: item.student_user.profile_photo}}/>
                                        :
                                          <Image style={{width:70, height:70, borderRadius:5, marginLeft:10}} source={PERSON}/>
                                        }
                                        <View style={{height:70, flex:1}}>
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
                                            <View style={{flexDirection:'row', flex:1, alignItems:'center'}}>
                                                <View style={{width:15}} />
                                                <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialIcons} size={20} color={Color.brownColor} name={"person"}  />
                                                <View style={{flex:1, flexDirection:'row'}}>
                                                  <Text numberOfLines={1} style={{fontFamily:'IBMPlexSans', fontSize:15, color: '#828282', paddingLeft:10}}>{commontexts.student +': '+item.student_user.name+' '+item.student_user.last_name}</Text>
                                                </View>
                                            </View>

                                        </View>
                                    </View>
                                  }/>
                            :
                                <FlatList
                                    onEndReached={this.retrieveMoreTab2}
                                    onEndReachedThreshold={height/1.2}
                                    refreshing={this.state.refreshingTab2}
                                    data={this.state.promoRecords}
                                    scrollEnabled={true}
                                    ListFooterComponent={this.renderTab2Footer}
                                    keyExtractor={(item, index) => String(index)}
                                    renderItem={({item,index}) =>
                                    <View style={{flexDirection:'row', width:'90%', alignSelf:'center', height:50, borderBottomWidth:1, borderColor:'#BDBDBD', alignItems:'center'}}>
                                        <View style={{width:15}} />
                                        <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialIcons} size={20} color={Color.brownColor} name={"calendar-today"}  />
                                        <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color: Color.brownColor, paddingLeft:10}}>{this.getDate(item)}</Text>
                                        <View style={{width:40}} />
                                        <Icon style={{backgroundColor:'transparent'}} type={Font.TypeMaterialIcons} size={20} color={Color.brownColor} name={"arrow-upward"}  />
                                        <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color: Color.brownColor, paddingLeft:10}}>{item.grade.name}</Text>
                                    </View>
                                }/>
                              
                            }
                      </View>
                    <BottomBar properties={this.props} isStudent={this.state.isStudent} />
                  </View>
                </SafeAreaView>
            </Fragment>
	    );
	}
}
