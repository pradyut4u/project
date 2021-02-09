import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import {ListItem, Card} from 'react-native-elements'
import firebase from 'firebase'
import db from '../config.js'

export default class ItemReciver extends React.Component{
	constructor(props){
		super(props)
		this.state={
		userId:firebase.auth().currentUser.email,
		receiverId:this.props.navigation.getParam("details")["userId"],
        requestId:this.props.navigation.getParam("details")["requestId"],
		itemName:this.props.navigation.getParam("details")["itemName"],
		reason:this.props.navigation.getParam("details")["reason"],
		receiverName:'',
		receiverContact:'',
		receiverAddress:'',
		requestDocId:''
		}
	}

	getReceiverDetails = ()=>{
		db.collection('users').where('emailid','==',this.state.receiverId).get()
		.then(snapShot=>{snapShot.forEach(doc=>{
		this.setState({
		receiverName:doc.data().firstName,
		receiverContact:doc.data().mobileNo,
		receiverAddress:doc.data().address
		})})})
		db.collection('requestedItems').where('requestId','==',this.state.requestId).get()
		.then(snapShot=>{snapShot.forEach(doc=>{
		this.setState({
		requestDocId:doc.id
		})})})
	}

	updateItemStatus = ()=>{
		db.collection('donations').add({
			itemName:this.state.itemName,
			requestId:this.state.requestId,
			requestedBy:this.state.receiverName,
			donarId:this.state.userId,
			requestStatus:"Donar Interested"
		})
		alert('Item status updated')
	}

	addNotification = () =>{
		var message = this.state.userId+"has shown in donation"
		db.collection("allNotifications").add({
			targetUserId:this.state.receiverId,
			donarId:this.state.userId,
			requestId:this.state.requestId,
			itemName:this.state.itemName,
			date:firebase.firestore.FieldValue.serverTimestamp(),
			notificationStatus:"unread",
			message:message
		})
		alert('Notification updated')
	}
	componentDidMount(){
		this.getReceiverDetails
	}
	render(){
		return(
			<View style={{flex:1}}>
				<View style={{flex:0.3}}>
					<Card tittle={"Item Informaton"} tittleStyle={{fontSize:20}}>
						<Card>
							<Text>Name:{this.state.itemName}</Text>
						</Card>
						<Card>
							<Text>Reason:{this.state.reason}</Text>
						</Card>
					</Card>
					<Card tittle={"Reciver Details"} tittleStyle={{fontSize:20}}>
						<Card>
							<Text>Name:{this.state.receiverName}</Text>
						</Card>
						<Card>
							<Text>Contact:{this.state.receiverContact}</Text>
							</Card>
							<Card>
								<Text>Address:{this.state.receiverAddress}</Text>
							</Card>
					</Card>
					{this.state.receiverId!==this.state.userId
					?(
					<TouchableOpacity onPress ={()=>{
						this.updateItemStatus()
						this.addNotification()
						this.props.navigation.navigate("MyDonation")
					}}>
						<Text>Agree</Text>
					</TouchableOpacity>):null
	}
			</View>
			</View>
		)
	}
}