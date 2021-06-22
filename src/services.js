import { NavigationActions, StackActions } from 'react-navigation';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-community/async-storage';
import { resetNavigation, clearStorage } from './utils/Common'
import {FBLogin, FBLoginManager} from 'react-native-facebook-login';
import { GoogleSignin } from '@react-native-community/google-signin';
export const baseURL = 'http://ikmf.upload.com.py/api/';
export const url = 'http://ikmf.upload.com.py/';

export const STATUS_OK = "OK";
export const TIMEDOUT = "TIMEDOUT";

const errorResponse = {
	status: "TIMEDOUT",
	errors:[],
	message: 'respuesta no válida, intente nuevamente',
};

export async function requestHandler(path, params, props, method = 'GET', formData = false) {
	let options = { method, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },timeout:10000 };

	Object.keys(params).forEach(k => (params[k] === null) && delete params[k]);


	let url = baseURL + path;
	if(path.includes('ipstack.com')){
		url = path;
	}
	//console.log('path, params, method, formdata.', path, params, method, formData);
	if (params && method == 'POST' && !formData) {
		options['body'] = JSON.stringify(params);
	} else if (params && !formData) {
		url =
			url +
			'?' +
			Object.keys(params)
				.map(e => e + '=' + params[e])
				.join('&');
	} else if (formData) {
		delete options.headers['Content-Type']; // = 'multipart/form-data';
		options['body'] = new FormData();
		for (let key in params) {
			options.body.append(key, params[key]);
		}
	}

	if(props!=null){
		var token = await AsyncStorage.getItem('token');
		if (token && token!='') {
			options.headers['Authorization'] = 'Bearer '+token;
		}
	}


	var responseObject = '';
	try {
		//console.log('URL:', url, options);

		let response = await fetch(url, options);
		//console.log('url, options, params, response', url, options, params, response);
		responseObject = response;

		let responseJson = await response.json();
		let {message, errors} = responseJson;
		if(message && message === "Unauthenticated"){
			AsyncStorage.setItem('errorMsg',message);
			errorResponse['message'] = message;
			throwUserOut(props,true,resp_msg);
			return errorResponse;
		}
		if(errors){
			let errorText = await getErrorText(errors);
			console.log('errorText::'+errorText)
			responseJson['errorText'] = errorText;
		}
		console.log('url, params, responsee::',url, params,JSON.stringify(responseJson));
		responseJson['status'] = response.status;
		return responseJson;
	} catch (error) {
		console.log('error:', error);
		AsyncStorage.setItem('errorMsg','Error');
		//errorResponse['message'] = error;
		throwUserOut(props,false,'Error');
		return errorResponse;
	}
}

async function getErrorText(errors){
	if(Array.isArray(errors)){
		console.log('inside 1');
		return getErrorText(errors[0]);
	}else{
		return errors;
	}
}


async function throwUserOut(props,shouldThrow,errorMessage){
	if(shouldThrow){
		await logoutUser({},props);
	}
}


async function logoutUserFromSocial(loginType){
	
	await GoogleSignin.configure({ webClientId:"548763831575-3qrmfttjepbbs6r8acn322dqti39b81l.apps.googleusercontent.com", offlineAccess: true });
	

	if(loginType === "facebook"){
		FBLoginManager.logout(function(error, data){
			if (!error) {
				console.log("FB logout");

			} else {
				console.log(error, data);
			}
		});
	}
	else{
		try {
			await GoogleSignin.signOut();
			} catch (error) {
			console.error(error);
			}
		}
}

export async function logoutUser(params,props){
  	let response = await logout(params, props);
  	let loginType = await AsyncStorage.getItem('logintype');
  	if(loginType && loginType!=='normal'){
		await logoutUserFromSocial(loginType);
	}
	clearStorage();
	resetNavigation('Login',{},props);
}

export async function logout(params,props){
	let response = await requestHandler('logout', params,props,'POST');
	return response;
}

export async function getattendancerecords(params, props) {
	let response = await requestHandler('assistances/records', params, props, 'GET');
	return response;
}

export async function login(params, props) {
	let response = await requestHandler('login', params, null, 'POST');
	return response;
}

export async function getpromotionalrecords(params, props) {
	let response = await requestHandler('promotions/records', params, props, 'GET');
	return response;
}

export async function sociallogin(params, props) {
	let response = await requestHandler('login/social-network', params, props, 'POST');
	return response;
}

export async function getroles(params) {
	let response = await requestHandler('roles', params, null, 'GET');
	return response;
}

export async function getcities(params) {
	let response = await requestHandler('cities', params, null);
	return response;
}

export async function register(params) {
	let response = await requestHandler('register', params, null, 'POST');
	return response;
}

export async function forgotpassword(params) {
	let response = await requestHandler('password/forgot', params, null, 'POST');
	return response;
}

export async function getcountries(params) {
	let response = await requestHandler('countries', params, null);
	return response;
}

export async function getgrades(params) {
	let response = await requestHandler('grades', params, null);
	return response;
}

export async function getprofile(params, props) {
	let response = await requestHandler('profile', params, props);
	return response;
}

export async function getsubscription(params, props) {
	let response = await requestHandler('subscription', params, props);
	return response;
}

export async function getsubscriptiondata(params, props) {
	let response = await requestHandler('subscription-data', params, props);
	return response;
}

export async function postsubscription(params, props) {
	let response = await requestHandler('subscription', params, props,'POST');
	return response;
}

export async function starttrial(params, props) {
	let response = await requestHandler('subscription/starttrial', params, props);
	return response;
}

export async function cancelsubscription(params, props) {
	let response = await requestHandler('subscription/cancel', params, props,'POST');
	return response;
}


export async function updateprofile(params, props) {
	let response = await requestHandler('profile/information', params, props,'PUT');
	return response;
}



export async function updatephoto(params, props) {
	let response = await requestHandler('profile/photo', params, props,'POST', true);
	return response;
}

export async function getassistancecode(params, props) {
	let response = await requestHandler('assistances/code', params, props,'POST');
	return response;
}

export async function registerattendance(params, props) {
	let response = await requestHandler('assistances/register', params, props,'POST');
	return response;
}

export async function updatesocialprofileinfo(params, props) {
	let response = await requestHandler('profile/social-networks', params, props,'POST');
	return response;
}

export async function storetoken(params, props) {
	let response = await requestHandler('device-token', params, props, 'PUT');
	return response;
}

export async function getacamedies(params) {
	let response = await requestHandler('academies', params, null);
	return response;
}
