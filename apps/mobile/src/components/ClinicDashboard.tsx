import { View, Text, Linking, Pressable } from 'react-native';
export default function ClinicDashboard() {
 return <View style={{flex:1,padding:28,justifyContent:'center',gap:20,backgroundColor:'#f8fafc'}}><Text style={{fontSize:25,color:'#172e45'}}>Painel da clínica</Text><Text>O painel da equipe está disponível na versão web desta prévia.</Text><Pressable onPress={()=>Linking.openURL('http://localhost:8081/clinica')}><Text style={{color:'#0284c7'}}>Abrir no navegador deste computador</Text></Pressable></View>;
}
