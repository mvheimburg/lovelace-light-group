import {vi} from 'vitest';
import type {HomeAssistant,CardConfig,HassEntity} from '../src/types';
export const state=(id:string,value:string,attributes:Record<string,unknown>={}):HassEntity=>({entity_id:id,state:value,attributes});
export function fixture():HomeAssistant {
 return {language:'en',connection:{connected:true},states:{
 'light.a':state('light.a','on',{friendly_name:'Kitchen ceiling',brightness:128,supported_color_modes:['brightness']}),
 'light.b':state('light.b','off',{friendly_name:'Island',supported_color_modes:['onoff']}),
 'light.c':state('light.c','unavailable',{friendly_name:'Offline lamp'}),
 'light.other':state('light.other','on'),
 },callService:vi.fn(async()=>undefined)};
}
export const config=():CardConfig=>({type:'custom:light-group-card',title:'My home',sections:[{name:'Kjøkken',lights:[{entity:'light.a'},{entity:'light.a',name:'Duplicate'},{entity:'light.b'},{entity:'light.c'},{entity:'light.missing'}]}]});
