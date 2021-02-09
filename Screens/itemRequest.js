import React from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import firebase from 'firebase'
import db from '../config.js'
import MyHeader from '../Components/myHeader';
import {BookSearch} from 'react-native-google-books';
import { FlatList } from 'react-native-gesture-handler';

export default class ItemRequest extends React.Component{
	constructor(){
		super()
		this.state={
			userId:firebase.auth().currentUser.email,
			itemName: '',
			reason: '',
			requestId:'',
			docId:'',
			itemStatus:'',
			itemrequestactive:'',
			userDoc:'',
			dataSource:'',
			showFlatList:false,
			requestedItemName:''
		}
	}
	uniqueId(){
		return Math.random().toString(36).substring(7)
	}

	addRequest = async (itemName,reason) =>{
		var userId=this.state.userId
		var requestId=this.uniqueId()
		db.collection('requestedItems').add({
		userId:userId,itemName:itemName,reason:reason,requestId:requestId,itemStatus:"requested"})
		this.setState({
			itemName:'',
			reason:''
		})
		this.getItemRequest()
		db.collection("users").where("emailid","==",this.state.userId).get()
		.then(snapShot=>{
			snapShot.forEach(doc=>{
				db.collection("users").doc(doc.id).update({
					itemrequestactive:true
				})
			})
		})
		return(
			alert("Item requested Succesfully")
		)
	}

    getItemRequest = ()=>{
		db.collection('requestedItems').where("userId","==",this.state.userId).get()
		.then(snapShot=>{
			snapShot.forEach(doc=>{
				if(doc.data().itemStatus!=="recived"){
					this.setState({
						requestId:doc.data().requestId,
						itemStatus:doc.data().itemstatus,
						requesteditemName:doc.data().itemName,
						docId:doc.id
					})
				}

			})
		})
	}

	itemrequestactive = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				this.setState({
					itemrequestactive:doc.data().itemrequestactive,
					userDoc:doc.id
				})
			})
		})
	}

	updateItemRequestStaus = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				db.collection("users").doc(doc.id).update({
					itemrequestactive:false
				})
			})
		})
		db.collection("requestedItems").doc(this.state.docId).update({
			itemStatus:"recived"
		})
	}

	sendNotification = ()=>{
		db.collection("users").where("emailid","==",this.state.userId).onSnapshot(snapShot=>{
			snapShot.forEach(doc=>{
				var name = doc.data().firstName+doc.data().lastName
				db.collection("allNotifications").where("reqestId","==",this.state.requestId).onSnapshot(snapShot=>{
					snapShot.forEach(doc=>{
						var donarId = doc.data().donarId
						var itemName = doc.data().itemName
						db.collection("allNotifications").add({
							targetUserId:donarId,itemName:itemName,notificationStatus:"unread",message:name+"recived"+itemName
						})
					})
				})
			})
		})
	}

	async getItemApi(itemName){
		this.setState({
			itemName:itemName
		})
		if(itemName){
		if(itemName.length > 2){
            var items = await BookSearch.searchbook(itemName,"AIzaSyDs5qH61LrIlsfhtdq7aTLfcegv2FZ2h3Y")
            this.setState({
				dataSource:items.data,
				showFlatList:true
			})
		}
		}
		else{
			console.log("no item name")
		}
	}

	renderItem = ({item,i})=>{
			let obj = {
				title:item.volumeInfo.title,selfLink:item.selfLink,buyLink:item.saleInfo.buyLink,imageLink:item.volumeInfo.imageLinks
			}
			return(
				<TouchableHighlight style={{backgroundColor:"red", padding:10, width:"80%"}}
				activeOpacity={0.5} underlayColor="orange" 
				onPress={()=>{
					this.setState({
						showFlatList:false,
						itemName:item.volumeInfo.title
					})
				}} 
				bottomDivider>
					<Text>{item.volumeInfo.title}</Text>
				</TouchableHighlight>
			)
		}

	componentDidMount(){
		this.itemrequestactive()
		this.getItemRequest()
	}

	render(){
		if(this.state.itemrequestactive === true){
			return(
				<View style={{flex:1, justifyContent:'center'}}>
					<View style={{borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10}}>
						<Text>Item Name</Text>
						<Text>{this.state.requestedItemName}</Text>
					</View>
					<View style={{borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10}}>
						<Text>Item Status</Text>
						<Text>{this.state.itemStatus}</Text>
					</View>
					<TouchableOpacity style={{
						borderColor:'cyan', borderWidth:10, justifyContent:'center', alignItems:'center', margin:10, padding:10
						}}
						onPress={()=>{
							this.updateItemRequestStaus();
							this.sendNotification()
						}}>
						<Text>I recived the item</Text>
					</TouchableOpacity>
				</View>
			)
		}
		else{
		return(
			<View>
				<MyHeader title={"Request"} navigation={this.props.navigation}/>
			<KeyboardAvoidingView>
			<TextInput style={{marginTop:50}} placeholder="Item name" onChangeText={text=>this.getItemApi(text)} onClear={text=>this.getItemApi("")} value={this.state.itemName}/>
			{this.state.showFlatList?(
			<FlatList data={this.state.dataSource} 
				renderItem={this.renderItem} 
				style={{marginTop:20}} 
				keyExtractor={(item,index)=>index.toString()
				}></FlatList>):(
				
					<View>
			         <TextInput 
			           placeholder="Reason" 
			multiline numberOfLines={5}
			onChangeText={text=>{this.setState({reason:text})}} 
			value={this.state.reason}/>
			<TouchableOpacity onPress={()=>{this.addRequest(this.state.itemName,this.state.reason)}}>
			<Text>Request</Text>
			</TouchableOpacity>
			</View>)}
			</KeyboardAvoidingView>
			</View>
		)
		}
	}
}