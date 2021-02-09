import React from 'react'
import {createStackNavigator} from 'react-navigation-stack' 
import ItemDonate from '../Screens/itemDonate.js'
import ItemReciver from '../Screens/itemReciver.js'

export const AppStackNavigator=createStackNavigator({
    Donate:{screen:ItemDonate},
    Reciver:{screen:ItemReciver}
},{
    intialRouteName:'Donate'
})