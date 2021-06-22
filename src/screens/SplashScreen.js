import React,{Component} from 'react';
import { SafeAreaView, ActivityIndicator,StyleSheet, Text, View, StatusBar,Image,Dimensions,Linking } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { width, height } = Dimensions.get('window');
import { resetNavigation } from '../utils/Common'
const LOGO = require('../resources/images/IKMF_logo.png');
const LOGOWIDTH = width*80/100;
const LOGOHEIGHT = 0.916 * LOGOWIDTH;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
  },
});

export default class SplashScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token:'',
			shouldShowSplash:true,
		}
	}


	async componentDidMount() {
        var token = await AsyncStorage.getItem('token');
        var type = await AsyncStorage.getItem('type');

        var ref = this;
        setTimeout(function(){
            if(token != null){
                resetNavigation('Home',{type}, ref.props);
            }else{
                resetNavigation('Login',{}, ref.props);
            }
        },4000)
	}

	// Render any loading content that you like here
	render() {
        StatusBar.setBarStyle('light-content', true);

		return (
            <View style={{
                flex: 1,
                backgroundColor:'white'
            }}
        >

		    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Image
                    style={{width:LOGOWIDTH, height:LOGOHEIGHT}}
                    source={LOGO}
                />
			</View>
        </View>
	    );
	}
}
