import {describe,it,expect} from 'vitest';
import {normalizeConfig} from '../src/config';
const valid = {type:'custom:light-group-card', sections:[{name:'Kjøkken', lights:[{entity:'light.a',name:'My lamp'}]}]};
describe('config',()=>{
 it('defaults empty configuration and preserves custom names without mutating',()=>{
  expect(normalizeConfig({type:valid.type}).sections).toEqual([]);
  const result=normalizeConfig(valid); result.sections[0].lights[0].name='Changed';
  expect(valid.sections[0].lights[0].name).toBe('My lamp');
  expect(result.sections[0].name).toBe('Kjøkken');
 });
 it.each([null,[],{type:'other'}, {...valid,appearance:'other'},{...valid,color_scheme:'other'}, {...valid,sections:{}}, {...valid,sections:[{name:1,lights:[]}]}, {...valid,sections:[{name:'x',lights:[{entity:'switch.x'}]}]}, {...valid,title:1}])('rejects malformed configuration %j',(value)=>expect(()=>normalizeConfig(value)).toThrow());
 it('keeps HA layout metadata',()=>expect(normalizeConfig({...valid,grid_options:{columns:12}})).toHaveProperty('grid_options',{columns:12}));
});
