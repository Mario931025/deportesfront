import React,{Component, Fragment} from 'react';
import {Image, Button, View, Share, StyleSheet,ActivityIndicator, TouchableOpacity, Text, ScrollView, Dimensions, SafeAreaView} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { Icon } from 'react-native-elements';
import { Color, Font } from '../styles/config';

import { WebView } from 'react-native-webview';



export default class InAppPage extends React.Component {
	static navigationOptions = { header: null };

	constructor(props) {
		super(props);
		this.state = {
			
		};

	}

	async componentDidMount() {
		
		
	}


  _navigatetoBack = () => {
		this.props.navigation.goBack();
	};


	render() {

		return (
			<Fragment>
			<SafeAreaView style={{ flex:0, backgroundColor: 'white'}} />
			<SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
				<View style={styles.headerContainer}>
					<TouchableOpacity onPress={()=>this._navigatetoBack()}>
                         <Icon name="keyboard-backspace" size={30} type={Font.TypeMaterialIcons} color={Color.brownColor}/>
					</TouchableOpacity>
				</View>
				
                <WebView
                source={{uri: this.props.navigation.state.params.url}}
                style={{marginTop: 0}}
                />
			</SafeAreaView>
		 </Fragment>
		);
	}
}


const styles = StyleSheet.create({

	headerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
		paddingLeft: 20,
		height: 50,
		paddingTop: 10,
		paddingBottom: 10,
		backgroundColor: 'white',
	},
	headerTitle: {
		fontSize: 14,
		padding: 20,
		paddingTop: 30,
	},
});
