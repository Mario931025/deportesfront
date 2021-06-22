import React,{Component, Fragment} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet, Text, View, TouchableOpacity, StatusBar,Image,Dimensions,Linking } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import { resetNavigation } from '../utils/Common'
import { Color, Font } from '../styles/config';
import { Icon } from 'react-native-elements';
import {filtertexts} from '../utils/apptexts'
import RadioGroup from '../utils/RadioGroup'

const styles = StyleSheet.create({
  
});

export default class FilterScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			radioData:[{label:filtertexts.aztext, value:1}, {label:filtertexts.zatext, value:2}, {label:filtertexts.date, value:3}],
		}
	}


	async componentDidMount() {
        
    }
    
    onRadioPress(data){
        this.setState({selectFilter:data.value});
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

		    <View style={{flex:1}}>
                <View style={{flexDirection:'row', width:'85%', alignSelf:'center', alignItems:'center', marginTop:30}}>
                    <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                        <Icon name="keyboard-backspace" size={35} type={Font.TypeMaterialIcons} color={Color.brownColor}/>
                    </TouchableOpacity>
                    <Text style={{fontFamily:'IBMPlexSans', fontSize:26, color:Color.brownColor, fontWeight:'bold', marginLeft:25}}>{filtertexts.filter}</Text>
                </View>

                <View style={{width:'70%', alignSelf:'center', marginTop:25, marginBottom:10}}>
                    <Text style={{fontFamily:'IBMPlexSans', fontSize:18, color:Color.brownColor, fontWeight:'bold'}}>{filtertexts.filterby}</Text>
                    <View style={{height: 15}} />
                    <View style={{width:'100%', marginLeft:0, alignItems:'flex-start'}}>
                        <RadioGroup style={{margin:0, padding: 0,}} radioButtons={this.state.radioData} onPress={(data) => this.onRadioPress(data)} />
                    </View>

                    <TouchableOpacity style={{borderRadius:5,backgroundColor:Color.brownColor,marginTop:40, width:'100%', alignSelf:'center', flexDirection:'row', height:45, justifyContent:'center', alignItems:'center'}}>
                        <Text style={{fontFamily:'IBMPlexSans', fontSize:16, color:Color.whiteColor, fontWeight:'bold'}}>{filtertexts.save}</Text>
                    </TouchableOpacity>
                </View>
                

            </View>
        </SafeAreaView>
	    );
	}
}
