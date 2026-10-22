import test from 'node:test';
import assert from 'node:assert/strict';
import { BIRTH_WEIGHT_GIRLS } from '../src/data/intergrowth-birth-girls.ts';
import { birthWeightComparison, changeSinceBirth, optionalGestation } from '../src/birth-weight.ts';
import { growthPoints, intervalChange } from '../src/growth.ts';
import type { Feeding } from '../src/domain.ts';

test('Geburtsreferenz reproduziert sämtliche taggenauen Originalstützpunkte und begrenzt Extreme', () => {
 assert.equal(BIRTH_WEIGHT_GIRLS.length,70);
 const centiles=[3,5,10,50,90,95,97];
 for(const [age,...weights] of BIRTH_WEIGHT_GIRLS){
   weights.forEach((weight,i)=>assert.equal(birthWeightComparison(weight,age).percentile,`ca. P${centiles[i]},0 (geschätzt)`));
   assert.equal(birthWeightComparison(weights[0]-1,age).percentile,'unter P3');
   assert.equal(birthWeightComparison(weights[6]+1,age).percentile,'über P97');
 }
 assert.deepEqual(BIRTH_WEIGHT_GIRLS[0],[231,1200,1290,1410,1860,2350,2510,2610]);
 assert.equal(birthWeightComparison(1635,231).percentile,'ca. P30,0 (geschätzt)');
 for(const age of [null,undefined,230,301,NaN,275.5]) assert.ok('reason' in birthWeightComparison(2800,age));
 for(const weight of [null,undefined,0,NaN,299,10001,2800.5]) assert.ok('reason' in birthWeightComparison(weight,275));
});
test('Schwangerschaftsalter ist optional, vollständig und auf ganze Wochen/Tage begrenzt',()=>{
 assert.equal(optionalGestation('',''),null);assert.equal(optionalGestation('39','2'),275);
 for(const [weeks,days] of [['','0'],['39',''],['39','7'],['39','-1'],['39.5','0'],['21','6'],['45','0']]) assert.throws(()=>optionalGestation(weeks,days));
 assert.equal(optionalGestation('22','0'),154);assert.equal(optionalGestation('44','6'),314);
});
test('Anfangsphase zeigt tatsächliche Geburtsgewichtsänderung; WHO-z-Differenz erst ab Tag 14',()=>{
 assert.deepEqual(changeSinceBirth(2700,3000),{grams:-300,percent:-10});
 assert.deepEqual(changeSinceBirth(3300,3000),{grams:300,percent:10});assert.equal(changeSinceBirth(2800,null),null);
 const rows=[0,13,14,28].map(day=>({id:String(day),kind:'weight',weight_g:3000+day*25,occurred_at:new Date(Date.UTC(2025,0,day+1,12)).toISOString()} as Feeding));
 const points=growthPoints(rows,'2025-01-01','who');
 const early=intervalChange(points[0],points[3]);assert.ok(!('reason' in early));assert.equal(early.zChange,null);assert.equal(early.grams,700);assert.equal(early.perDay,25);
 const later=intervalChange(points[2],points[3]);assert.ok(!('reason' in later));assert.equal(later.zChange,points[3].z-points[2].z);
});
