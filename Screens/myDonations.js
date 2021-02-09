import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import {ListItem, Icon, Card} from 'react-native-elements'
import firebase from 'firebase'
import db from '../config.js'

export default class MyDonation extends React.Component{
    constructor(){
        super()

        this.state={
         donarId:firebase.auth().currentUser.email,
         donarName:"",
         allDonation:[]
        }
        this.requestRef=null
    }
    getDonarDetails = ()=>{
        db.collection('users').where('emailid','==',this.state.donarId).get()
        .then(snapShot=>{
            snapShot.forEach(doc=>{this.setState({
                donarName:doc.data().firstName+''+doc.data().lastName
            })})
        })
    }

    getDonation = ()=>{
        this.requestRef=db.collection('donations').where('donarId','==',this.state.donarId)
        .onSnapshot(snapshot=>{
            var allDonation=[]
            snapshot.docs.map(doc=>{
                var donation = doc.data()
                donation ["docId"]=doc.id
                allDonation.push(donation) 
            })
            this.setState({
                allDonation:allDonation
            })
        })
    }
    senditem = (itemDetails)=>{
     if(itemDetails.requestStatus==="item sent"){
         var requestStatus="Donar Interested"
         db.collection('donations').doc(itemDetails.docId).update({
             requestStatus:"Donar Interested"
         })
     }
     else{
        var requestStatus="Donar Sent"
        db.collection('donations').doc(itemDetails.docId).update({
            requestStatus:"Donar Sent"
        })
     }
    }

    sendNotification = (itemDetails,requestStatus)=>{
        var requestId=itemDetails.requestId
        var donarId=itemDetails.donarId 
        db.collection('allNotifications').where('requestId','==',requestId).where('donarId','==',donarId).get()
        .then(snapShot=>{
            snapshot.forEach(doc=>{
             var message=''
             if(requestStatus==="item sent"){
                 message=this.state.donarName+"sent you the item"
             }
             else{
                message=this.state.donarName+"is interested in sending you the item"
             }
             db.collection('allNotifications').doc(doc.id).update({
                 message:message,
                 notificationStatus:"unread",
                 date:firebase.firestore.FieldValue.serverTimestamp()
             })
            })
        })
    }

    keyExtractor = (item,index) =>{
        index.toString()
       }
       renderItem = ({item,i}) =>{
       return(
           <ListItem key={i} title={item.itemName} subtitle={item.requestedBy+item.requestStatus}
           leftElement={
               <Icon name='item' type="font-awesome" color="cyan"></Icon>
           }
           titleStyle={{color:"blue",fontWeight:"bold"}}
           rightElement={
           <TouchableOpacity onPress={()=>{this.senditem(item)}}>
           <Text>{item.requestStatus==="item sent"?"item sent":"send item"}</Text>
           </TouchableOpacity>}
           bottomDivider
           />
       )
       }
       componentDidMount(){
           this.getDonarDetails()
           this.getDonation()
       }
       componentWillUnmount(){
           this.requestRef()
       }
       render(){
           return(
               <View>{this.state.allDonation.length===0
               ?(<View><Text>List of all donations</Text></View>)
            :(<FlatList keyExtractor={this.keyExtractor} data={this.state.allDonation} renderItem={this.renderItem}></FlatList>)}</View>
           )
       }
}