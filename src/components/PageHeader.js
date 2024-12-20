import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Feather} from '@expo/vector-icons';
import {styles as baseStyles} from '../utils/styles';

export const PageHeader = ({title}) => {
    const navigation = useNavigation();

    return (<View style={{backgroundColor: "#fff"}}>
            <View style={[baseStyles.row, {marginTop: 20}]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather
                        name="arrow-left"
                        size={28}
                        color="gray"
                        style={{fontWeight: "bold", paddingHorizontal: 15}}
                    />
                </TouchableOpacity>
                <Text style={[baseStyles.subtitle, {fontWeight: "bold", color: "gray", fontSize: 20}]}>
                    {title}
                </Text>
            </View>
            <View style={baseStyles.textContainer}/>
        </View>
    );
};