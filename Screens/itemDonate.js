import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import {ListItem} from 'react-native-elements'
import firebase from 'firebase'
import db from '../config.js'
import MyHeader from '../Components/myHeader.js'

export default class ItemDonate extends React.Component{
constructor(){
	super()
	this.state={
		requestedItemList:[]
	}
	this.requestref=null
}

getItemList = () =>{
this.requestref=db.collection("requestedItems").onSnapshot(snapShot=>{
	var itemList = snapShot.docs.map(doc=>doc.data())
	this.setState({
		requestedItemList:itemList
	})
})
}

componentDidMount (){
	this.getItemList()
}

componentWillUnmount (){
	this.requestref()
}

keyExtractor = (item,index) =>{
 index.toString()
}
renderItem = ({item,i}) =>{
return(
	<ListItem key={i} title={item.itemName} subtitle={item.reason} titleStyle={{color:"blue",fontWeight:"bold"}}
	rightElement={
	<TouchableOpacity onPress = {()=>{this.props.navigation.navigate("Donate",{'details':item})}}>
	<Text>View</Text>
	</TouchableOpacity>}
	bottomDivider
	/>
)
}
render(){
	return(
		<View>
		<MyHeader title='Donate items' navigation={this.props.navigation}/>
		<View>
		{this.state.requestedItemList.length===0?
		(<Text>List of items</Text>)
		:(<FlatList keyExtractor={this.keyExtractor}data={this.state.requestedItemList} renderItem={this.renderItem}/>)}
		</View>
		</View>
	)
}
}