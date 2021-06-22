import { createSwitchNavigator,createAppContainer } from 'react-navigation';
import { createStackNavigator} from 'react-navigation-stack';
import { fromLeft,fadeIn,fadeOut } from 'react-navigation-transitions';

import React from 'react';
import { View, ActivityIndicator, Dimensions,Easing,
  Animated, Text, TextInput} from 'react-native';
const _WIDTH = Dimensions.get('window').width;
const _HEIGHT = Dimensions.get('window').height;
import {
	SplashScreen,
	HomeScreen,
	LoginScreen,
	ForgotPasswordScreen,
	RegisterScreen,
	ProfileScreen,
	RegisterAttendanceScreen,
	RecordsScreen,
	SearchScreen,
	FilterScreen,
	InAppScreen
} from '@screens';



//Main Application stack
export const AppStack = createStackNavigator(
	{
		Splash: SplashScreen,
		Home:HomeScreen,
		Login:LoginScreen,
		ForgotPassword:ForgotPasswordScreen,
		Register:RegisterScreen,
		Profile:ProfileScreen,
		Filter:FilterScreen,
		RegisterAttendance:RegisterAttendanceScreen,
		Records:RecordsScreen,
		Search:SearchScreen,
		InAppPage:InAppScreen
	},
	{
		headerMode: 'none',
		initialRouteName: 'Splash',
		defaultNavigationOptions: {
      gesturesEnabled: false
    },
		transitionConfig: () => fadeOut(),


	}
);

const transitionConfig = () => {
  return {
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: sceneProps => {
      const { layout, position, scene } = sceneProps

      const thisSceneIndex = scene.index
      const width = layout.initWidth

			const opacity = position.interpolate({
				inputRange: [0, 0.5, 1],
				outputRange: [0, 10, 100]
      })

			return { opacity }
    },
  }
}

export const MainStack = createAppContainer(AppStack);


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fontLoaded: true,
		};
		Text.defaultProps = Text.defaultProps || {};
		Text.defaultProps.allowFontScaling = false;

		TextInput.defaultProps = TextInput.defaultProps || {};
		TextInput.defaultProps.allowFontScaling = false;
	}

	async componentDidMount() {


	}
	render() {
		if (this.state.fontLoaded == true) {
			return <MainStack />;
		} else {
			return (
				<View>
					<ActivityIndicator size="large" color="#fff" />
				</View>
			);
		}
	}
}

App.defaultProps = {
	allowFontScaling: false,
};
export default App;
