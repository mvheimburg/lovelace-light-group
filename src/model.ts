import type {CardConfig,HassEntity,HomeAssistant} from './types';
export function available(hass:HomeAssistant,id:string):boolean {
 return hass.connection?.connected!==false&&['on','off'].includes(hass.states[id]?.state);
}
export function supportsBrightness(entity?:HassEntity):boolean {
 const modes=entity?.attributes.supported_color_modes;
 return Array.isArray(modes)&&modes.some(m=>['brightness','color_temp','hs','xy','rgb','rgbw','rgbww','white'].includes(m));
}
export function brightnessPercent(entity?:HassEntity):number|undefined {
 const value=entity?.attributes.brightness;
 return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=255?Math.round(value/255*100):undefined;
}
export function allOffTargets(config:CardConfig,hass:HomeAssistant):string[] {
 return [...new Set(config.sections.flatMap(s=>s.lights.map(l=>l.entity)))].filter(id=>available(hass,id)&&hass.states[id].state==='on');
}
