import { Color } from './config';
import { StyleSheet,Dimensions,Platform } from 'react-native';
const { width, height } = Dimensions.get('window');

export const CommonStyles = StyleSheet.create({
	bigTitleText:{
		color: '#FFFFFF',
		fontSize: 15,
		fontFamily: 'Lato-Regular',
	},
	titleText:{
		color: '#FFFFFF',
		fontSize: 14,
		fontFamily: 'Lato-Regular',
	},
	subTitleText:{
		color: '#FFFFFF',
		fontSize: 13,
		fontFamily: 'Lato-Regular',
	},
	parTitleText:{
		color: '#666666',
		fontSize: 13,
		fontFamily: 'Lato-Regular',
	},
	topTitleText:{
		color: '#FFFFFF',
		fontSize: 15,
		fontFamily: 'Lato-Regular',
		fontWeight:'bold'
	},

	blueContainer: {
		flex: 1,
		backgroundColor: Color.primaryColor,
		alignItems: 'center',
		justifyContent: 'center',
	},
	colorInternetTextStyle:{
		color:Color.colorInternetTextColor,
	},
	internetErrorView:{
		width:170,
		height:25,
		justifyContent:'center',
		alignItems:'center',
		flexDirection:'row',
		backgroundColor:Color.colorInternetError,
		position:'absolute',
		left:width/2-85,
		top:Platform.OS === 'ios'?23.5:7.5,
		zIndex:1,
	},
	whiteContainer: {
		flex: 1,
		backgroundColor: Color.white,
		// justifyContent: 'center',
	},
	layout: {
		padding: 20,
	},
	loaderBackground: {
		position: 'absolute',
		backgroundColor: Color.loaderBackground,
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	loginInnerContainer: {
		// backgroundColor: Color.backgroundLightGrey,
		width: '100%',
		paddingLeft: 24,
		paddingRight: 24,
		paddingTop: 25,
		paddingBottom: 60,
	},
	inputFieldContailer: {
		// height: 40,
		marginBottom: 24,
		padding: 5,
		// backgroundColor: Color.white,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	inputFieldContailerSignUp: {
		// height: 40,
		padding: 5,
		// backgroundColor: Color.white,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	inputFldTitle: {
		width: '100%',
		// alignItems:"flex-start",
		// flex:1,
		color: Color.loginFontColor,
	},
	inputFieldL: {
		height: 40,
		minHeight: 40,
		paddingLeft: 10,
		alignSelf:'center',
		backgroundColor:'white',
		fontFamily:'IBM Plex Sans',
		fontSize:18,
		color:Color.brownColor
	},
	inputField: {
		flex: 1,
		height: 40,
		minHeight: 40,
		// padding: 10,
		width: '100%',
		borderBottomWidth: 1,
		fontFamily:'IBM Plex Sans',
		borderColor: Color.loginFontColor,
		color: Color.loginFontColor,
		// marginTop: 5,
		// paddingLeft: 0,
		// marginLeft: 5,
	},
	checkbox: {
		backgroundColor: 'transparent',
		borderWidth: 0,
		marginLeft: 0,
	},
	plainButton: {
		textAlign: 'center',
		marginTop: 30,
		fontFamily:'Lato-Regular',
		fontSize:14,
		color:'#003366'
	},
	messageContainer: {
		borderWidth: 1,
		padding: 10,
		width:width-40,
		alignSelf:'center',
		marginBottom: 0,
	},
	errorMessageContainer: {
		borderColor: Color.errorRed,
		backgroundColor: Color.errorBackgroundRed,
	},
	successMessageContainer: {
		borderColor: Color.successGreen,
		backgroundColor: Color.successBackgroundGreen,
	},
	messageHeader: {
		fontSize: 14,
		fontWeight: 'bold',
		color: Color.successGreen,
	},
	errorMessageheader: {
		color: Color.errorRed,
	},
	messageContent: {
		fontWeight: 'normal',
	},
	logoContainer: {
		alignItems: 'center',
	},
	logo: {
		width: '80%',
		height: null,
		marginBottom:null,
	},
	sectionHeader: {
		fontSize: 16,
		// padding: 10,
		marginBottom: 10,
		// marginTop:50,
		// marginLeft: 10,
		fontWeight: 'bold',
	},
	headerIconStyle: {
		margin: 5,
		padding: 10,
	},
	titleHeader: {
		fontSize: 14,
		fontWeight: 'bold',
		color: Color.black,
		fontFamily: 'Lato-Regular',
		margin: 10,
	},
	InputFieldContainer: {
		marginBottom: 15,
	},
	inputFieldTitle: {
		marginBottom: 10,
		width: '100%',
		fontSize: 13,
		color:'#616262',
		fontFamily:'Lato-Regular'
	},
	inputFormField: {
		paddingLeft: 5,
		height:35,
		borderWidth: 1,
		borderColor:'#616262',
		fontFamily:'Lato-Regular',
		fontSize:13,
		color:'#393939',
		maxHeight: 160,
	},
	dropdownWrapper: {
		borderWidth: 1,
	},
	pickerStyle: {
		width: (width - 40) / 0.8,
		height: 35,
		justifyContent: 'center',
		alignItems: 'center',
		transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }, { translateX: -40 / 0.8 }],
	},
});
