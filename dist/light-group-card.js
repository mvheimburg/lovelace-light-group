/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$3=globalThis,e$3=t$3.ShadowRoot&&(void 0===t$3.ShadyCSS||t$3.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$3=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$4=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$3)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$3.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$3,defineProperty:e$2,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$2,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$2=c$1?c$1.emptyScript:"",p$2=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$2:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$3(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$2(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$2(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$2?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,i$2=t=>t,s$1=t$2.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r$1=`<${n}>`,l$1=document,c=()=>l$1.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m$1=/>/g,p$1=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l$1.createTreeWalker(l$1,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$1?e$1.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m$1:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p$1):void 0!==u[3]&&(c=p$1):c===p$1?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p$1:'"'===u[3]?$:g):c===$||c===g?c=p$1:c===_||c===m$1?c=v:(c=p$1,n=void 0);const x=c===p$1&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$1:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l$1.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l$1).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l$1,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l$1.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$2(t).nextSibling;i$2(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$2.litHtmlPolyfillSupport;B?.(S,k),(t$2.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$1 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}};i$1._$litElement$=true,i$1["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$1});const o=s.litElementPolyfillSupport;o?.({LitElement:i$1});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1={ATTRIBUTE:1,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},e=t=>(...e)=>({_$litDirective$:t,values:e});class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const r=o=>void 0===o.strings,m={},p=(o,t=m)=>o._$AH=t;

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const l=e(class extends i{constructor(r$1){if(super(r$1),r$1.type!==t$1.PROPERTY&&r$1.type!==t$1.ATTRIBUTE&&r$1.type!==t$1.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!r(r$1))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(i,[t]){if(t===E||t===A)return t;const o=i.element,l=i.name;if(i.type===t$1.PROPERTY){if(t===o[l])return E}else if(i.type===t$1.BOOLEAN_ATTRIBUTE){if(!!t===o.hasAttribute(l))return E}else if(i.type===t$1.ATTRIBUTE&&o.getAttribute(l)===t+"")return E;return p(i),t}});

const colorSchemes = [
    "home-assistant",
    "bright",
    "warm",
    "mint",
    "sky",
    "lavender",
];

class ConfigValidationError extends Error {
    constructor(code) {
        super(code);
        this.code = code;
    }
}
const TYPE = "custom:light-group-card";
function object(input) {
    if (!input || typeof input !== "object" || Array.isArray(input))
        throw new ConfigValidationError("invalidConfig");
    return input;
}
function optional(input, key) {
    if (input[key] !== undefined && typeof input[key] !== "string")
        throw new ConfigValidationError("invalidText");
}
function normalizeConfig(input) {
    const c = object(input);
    if (c.type !== TYPE)
        throw new ConfigValidationError("invalidType");
    for (const key of ["title", "icon"])
        optional(c, key);
    if (c.appearance !== undefined &&
        !["default", "bubble"].includes(String(c.appearance)))
        throw new ConfigValidationError("invalidAppearance");
    if (c.color_scheme !== undefined &&
        !colorSchemes.includes(c.color_scheme))
        throw new ConfigValidationError("invalidScheme");
    if (c.confirm_all_off !== undefined && typeof c.confirm_all_off !== "boolean")
        throw new ConfigValidationError("invalidConfirmation");
    if (c.show_all_off !== undefined && typeof c.show_all_off !== "boolean")
        throw new ConfigValidationError("invalidAllOffVisibility");
    const sections = c.sections ?? [];
    if (!Array.isArray(sections))
        throw new ConfigValidationError("invalidSections");
    return {
        ...c,
        type: TYPE,
        sections: sections.map((value) => {
            const s = object(value);
            if (typeof s.name !== "string" || !Array.isArray(s.lights))
                throw new ConfigValidationError("invalidRoom");
            optional(s, "icon");
            return {
                ...s,
                name: s.name,
                lights: s.lights.map((value) => {
                    const l = object(value);
                    if (typeof l.entity !== "string" ||
                        !/^light\.[a-z0-9_]+$/.test(l.entity))
                        throw new ConfigValidationError("invalidLight");
                    optional(l, "name");
                    optional(l, "icon");
                    return { ...l, entity: l.entity };
                }),
            };
        }),
    };
}

const en = {
    invalidConfig: "Check the card configuration in the dashboard code editor.",
    invalidType: "Use type: custom:light-group-card.",
    invalidAppearance: "Choose Default or Bubble appearance.",
    invalidScheme: "Choose a listed color scheme.",
    invalidSections: "Rooms must be a list.",
    invalidRoom: "Each room needs a name and a list of lights.",
    invalidLight: "Choose a light entity (light.*).",
    invalidText: "Names, titles and icons must be text.",
    incomplete: "Select or remove each empty light row before saving. Until then, your latest editor changes are not passed to the dashboard.",
    title: "Lights",
    allOff: "All off",
    showAllOff: "Show All off button",
    invalidAllOffVisibility: "All off visibility must be true or false.",
    confirmAllOff: "Require confirmation for All off",
    allOffPrompt: "Turn off all lights in {title}?",
    cancel: "Cancel",
    invalidConfirmation: "All off confirmation must be true or false.",
    configure: "Configure",
    on: "On",
    off: "Off",
    unavailable: "Unavailable",
    turnOn: "Turn on",
    turnOff: "Turn off",
    pending: "Updating…",
    failed: "Could not update lights",
    timeout: "No confirmation from the light. Check its state and try again.",
    brightness: "Brightness",
    unknownBrightness: "Brightness not reported",
    more: "More controls",
    close: "Close",
    details: "Light controls",
    setup: "Choose lights and room sections in the visual card editor.",
    configureHelp: "To choose lights, room sections and appearance, edit this dashboard, select Edit on this card, and use the visual editor. Save the dashboard to keep your changes; Cancel leaves saved settings unchanged.",
    name: "Name",
    icon: "Icon",
    cardTitle: "Title",
    sectionName: "Room name",
    entity: "Light entity",
    appearance: "Appearance",
    default: "Default",
    bubble: "Bubble",
    addSection: "Add room",
    addLight: "Add light",
    remove: "Remove",
    moveUp: "Move up",
    moveDown: "Move down",
    invalidValue: "Choose a valid light entity and check the configuration fields.",
    newRoom: "Room",
    editorHelp: "Arrange your rooms and lights below. Changes are saved with the dashboard.",
    colorScheme: "Color scheme",
    "home-assistant": "Home Assistant",
    bright: "Bright",
    warm: "Warm",
    mint: "Mint",
    sky: "Sky",
    lavender: "Lavender",
};
const nb = {
    invalidConfig: "Kontroller kortoppsettet i dashbordets kodeeditor.",
    invalidType: "Bruk type: custom:light-group-card.",
    invalidAppearance: "Velg Standard eller Bubble som utseende.",
    invalidScheme: "Velg et fargevalg fra listen.",
    invalidSections: "Rom må være en liste.",
    invalidRoom: "Hvert rom trenger et navn og en liste med lys.",
    invalidLight: "Velg en lysenhet (light.*).",
    invalidText: "Navn, titler og ikoner må være tekst.",
    incomplete: "Velg eller fjern hver tom lysrad før du lagrer. Frem til da blir de siste endringene i editoren ikke sendt til dashbordet.",
    title: "Lys",
    allOff: "Alt av",
    showAllOff: "Vis Alt av-knapp",
    invalidAllOffVisibility: "Visning av Alt av må være true eller false.",
    confirmAllOff: "Krev bekreftelse for Alt av",
    allOffPrompt: "Slå av alt lys i {title}?",
    cancel: "Avbryt",
    invalidConfirmation: "Bekreftelse for Alt av må være true eller false.",
    configure: "Konfigurer",
    on: "På",
    off: "Av",
    unavailable: "Utilgjengelig",
    turnOn: "Slå på",
    turnOff: "Slå av",
    pending: "Oppdaterer …",
    failed: "Kunne ikke endre lysene",
    timeout: "Ingen bekreftelse fra lyset. Kontroller tilstanden og prøv igjen.",
    brightness: "Lysstyrke",
    unknownBrightness: "Lysstyrke er ikke oppgitt",
    more: "Flere kontroller",
    close: "Lukk",
    details: "Lyskontroller",
    setup: "Velg lys og rom i den visuelle korteditoren.",
    configureHelp: "For å velge lys, rom og utseende, rediger dashbordet, velg Rediger på dette kortet og bruk den visuelle editoren. Lagre dashbordet for å beholde endringene. Avbryt lar lagrede innstillinger være uendret.",
    name: "Navn",
    icon: "Ikon",
    cardTitle: "Tittel",
    sectionName: "Romnavn",
    entity: "Lysenhet",
    appearance: "Utseende",
    default: "Standard",
    bubble: "Bubble",
    addSection: "Legg til rom",
    addLight: "Legg til lys",
    remove: "Fjern",
    moveUp: "Flytt opp",
    moveDown: "Flytt ned",
    invalidValue: "Velg en gyldig lysenhet og kontroller feltene i oppsettet.",
    newRoom: "Rom",
    editorHelp: "Organiser rom og lys nedenfor. Endringer lagres med dashbordet.",
    colorScheme: "Fargevalg",
    "home-assistant": "Home Assistant",
    bright: "Lys",
    warm: "Varm",
    mint: "Mint",
    sky: "Himmelblå",
    lavender: "Lavendel",
};
function t(hass, key) {
    const lang = (hass?.language || hass?.locale?.language || "en")
        .toLowerCase()
        .replace(/_/g, "-")
        .split("-")[0];
    return (["nb", "no", "nn"].includes(lang) ? nb : en)[key];
}
function formatPercent(hass, value) {
    let locale = (hass?.locale?.language || hass?.language || "en")
        .replace(/_/g, "-")
        .replace(/^(no|nn)(?=-|$)/i, "nb");
    const preference = hass?.locale?.number_format;
    const formats = {
        comma_decimal: "en-US",
        decimal_comma: "de-DE",
        space_comma: "nb-NO",
        none: "en-US",
    };
    locale = formats[preference ?? ""] ?? locale;
    const options = {
        style: "percent",
        maximumFractionDigits: 1,
        useGrouping: preference !== "none",
    };
    try {
        return new Intl.NumberFormat(locale, options).format(value / 100);
    }
    catch {
        return new Intl.NumberFormat("en", options).format(value / 100);
    }
}

function available(hass, id) {
    return (hass.connection?.connected !== false &&
        ["on", "off"].includes(hass.states[id]?.state));
}
function supportsBrightness(entity) {
    const modes = entity?.attributes.supported_color_modes;
    return (Array.isArray(modes) &&
        modes.some((m) => [
            "brightness",
            "color_temp",
            "hs",
            "xy",
            "rgb",
            "rgbw",
            "rgbww",
            "white",
        ].includes(m)));
}
function brightnessPercent(entity) {
    const value = entity?.attributes.brightness;
    return typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 255
        ? Math.round((value / 255) * 100)
        : undefined;
}
function allOffTargets(config, hass) {
    return [
        ...new Set(config.sections.flatMap((s) => s.lights.map((l) => l.entity))),
    ].filter((id) => available(hass, id) && hass.states[id].state === "on");
}

/** Tracks acknowledgements only. HA owns device state; no state is synthesized here. */
class Requests {
    constructor(changed, timeoutMs = 10000) {
        this.changed = changed;
        this.timeoutMs = timeoutMs;
        this.active = new Set();
    }
    pending(id) {
        return [...this.active].some((r) => r.ids.includes(id));
    }
    start(ids, expected, send) {
        if (!ids.length || ids.some((id) => this.pending(id)))
            return false;
        this.error = undefined;
        this.errorDetail = undefined;
        const request = {
            ids: [...new Set(ids)],
            expected: { ...expected },
            sent: false,
            confirmed: false,
            timer: setTimeout(() => {
                if (!this.active.has(request))
                    return;
                this.error = "timeout";
                this.finish(request);
            }, this.timeoutMs),
        };
        this.active.add(request);
        this.changed();
        const failed = (error) => {
            if (!this.active.has(request))
                return;
            this.error = "failed";
            this.errorDetail =
                error instanceof Error
                    ? error.message
                    : typeof error === "object" && error !== null && "message" in error
                        ? String(error.message)
                        : typeof error === "string"
                            ? error
                            : undefined;
            this.finish(request);
        };
        try {
            Promise.resolve(send()).then(() => {
                if (!this.active.has(request))
                    return;
                request.sent = true;
                if (request.confirmed)
                    this.finish(request);
            }, failed);
        }
        catch (error) {
            failed(error);
        }
        return true;
    }
    reconcile(states) {
        for (const request of this.active) {
            request.confirmed = request.ids.every((id) => {
                const state = states[id];
                const expected = request.expected;
                if (state?.state !== expected.state)
                    return false;
                if (expected.brightnessPct === undefined || expected.state === "off")
                    return true;
                const actual = brightnessPercent(state);
                return (actual !== undefined && Math.abs(actual - expected.brightnessPct) <= 1);
            });
            if (request.sent && request.confirmed)
                this.finish(request);
        }
    }
    finish(request) {
        clearTimeout(request.timer);
        this.active.delete(request);
        this.changed();
    }
    reset() {
        for (const r of this.active)
            clearTimeout(r.timer);
        this.active.clear();
        this.error = undefined;
        this.errorDetail = undefined;
        this.changed();
    }
}

/** Local overrides only: removing the attribute restores the dashboard theme. */
const colorSchemeStyles = i$4 `
  :host([data-color-scheme]) {
    color-scheme: light;
    --primary-text-color: #202b36;
    --secondary-text-color: #52606d;
    --disabled-text-color: #626d78;
    --text-primary-color: #fff;
    --success-color: #28723c;
    --warning-color: #8c6100;
    --error-color: #bd2635;
    --orange-color: #ab4b13;
    --info-color: #146a91;
    --primary-color: var(--scheme-accent);
    --accent-color: var(--scheme-accent);
    --card-background-color: var(--scheme-surface);
    --ha-card-background: var(--scheme-surface);
    --primary-background-color: var(--scheme-surface);
    --secondary-background-color: var(--scheme-secondary);
    --divider-color: var(--scheme-border);
    --ha-card-border-color: var(--scheme-border);
    --bubble-main-background-color: var(--scheme-surface);
    --bubble-secondary-background-color: var(--scheme-secondary);
    --bubble-icon-background-color: var(--scheme-secondary);
    --bubble-sub-button-background-color: var(--scheme-secondary);
    --bubble-accent-color: var(--scheme-accent);
    --bubble-border: 1px solid var(--scheme-border);
    --ha-card-box-shadow: 0 2px 8px rgb(32 43 54 / 0.06);
    --bubble-box-shadow: var(--ha-card-box-shadow);
    --input-fill-color: var(--scheme-secondary);
    --input-ink-color: var(--primary-text-color);
    --input-label-ink-color: var(--secondary-text-color);
    --mdc-theme-primary: var(--scheme-accent);
    --mdc-theme-surface: var(--scheme-surface);
    --mdc-theme-on-surface: var(--primary-text-color);
    --mdc-text-field-fill-color: var(--scheme-secondary);
    --mdc-text-field-ink-color: var(--primary-text-color);
  }
  :host([data-color-scheme="bright"]) {
    --scheme-surface: #ffffff;
    --scheme-secondary: #edf3fa;
    --scheme-accent: #2365a5;
    --scheme-border: #ccd9e7;
  }
  :host([data-color-scheme="warm"]) {
    --scheme-surface: #fffaf1;
    --scheme-secondary: #f4ead9;
    --scheme-accent: #885321;
    --scheme-border: #ddd0ba;
  }
  :host([data-color-scheme="mint"]) {
    --scheme-surface: #f2fbf5;
    --scheme-secondary: #dfefe5;
    --scheme-accent: #286c50;
    --scheme-border: #c1d9ca;
  }
  :host([data-color-scheme="sky"]) {
    --scheme-surface: #f1f8ff;
    --scheme-secondary: #dfeefa;
    --scheme-accent: #22638e;
    --scheme-border: #c2d8e9;
  }
  :host([data-color-scheme="lavender"]) {
    --scheme-surface: #faf5ff;
    --scheme-secondary: #ede3f6;
    --scheme-accent: #725095;
    --scheme-border: #d7c8e5;
  }
`;

const styles = [
    colorSchemeStyles,
    i$4 `
    :host {
      display: block;
      color: var(--primary-text-color, #262d38);
      font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
      --lg-surface: var(
        --ha-card-background,
        var(--card-background-color, #fff)
      );
      --lg-pill: var(--secondary-background-color, #f1f3f6);
      --lg-accent: var(--bubble-accent-color, var(--primary-color, #507b9b));
      --lg-radius: var(--ha-card-border-radius, 16px);
      --lg-muted: var(--secondary-text-color, #626976);
    }
    :host([appearance="bubble"]) {
      --lg-surface: var(
        --bubble-main-background-color,
        var(--ha-card-background, var(--card-background-color, #fff))
      );
      --lg-pill: var(
        --bubble-secondary-background-color,
        var(--secondary-background-color, #f1f3f6)
      );
      --lg-radius: var(--bubble-border-radius, 28px);
    }
    * {
      box-sizing: border-box;
    }
    ha-card {
      display: block;
      padding: 16px;
      background: var(--lg-surface);
      border-radius: var(--lg-radius);
      border: 1px solid var(--ha-card-border-color, var(--divider-color, #ddd));
      box-shadow: var(--ha-card-box-shadow, none);
    }
    :host([appearance="bubble"]) ha-card {
      border: var(--bubble-border, none);
      box-shadow: var(--bubble-box-shadow, var(--ha-card-box-shadow, none));
    }
    button,
    input,
    select {
      font: inherit;
      color: inherit;
    }
    button {
      cursor: pointer;
      border: 0;
      background: none;
      min-height: 44px;
    }
    button:disabled {
      cursor: default;
      opacity: 0.55;
    }
    button:focus-visible,
    input:focus-visible,
    select:focus-visible {
      outline: 3px solid var(--primary-color, #507b9b);
      outline-offset: 3px;
    }
    button:hover:not(:disabled) {
      filter: brightness(0.96);
    }
    header {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    h2,
    h3,
    p {
      margin: 0;
    }
    h2 {
      font-size: 17px;
      font-weight: 650;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }
    .heading {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 90px;
    }
    .heading ha-icon {
      flex: none;
      color: var(--lg-muted);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }
    .round {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      background: var(--lg-pill);
    }
    .all-off {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      border-radius: 22px;
      padding: 0 12px;
      background: var(--lg-pill);
    }
    ha-icon {
      --mdc-icon-size: 21px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    section + section {
      margin-top: 22px;
    }
    .section-heading {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 4px 10px;
    }
    h3 {
      font-size: 14px;
      font-weight: 650;
      overflow-wrap: anywhere;
    }
    .section-heading ha-icon {
      color: var(--lg-muted);
    }
    .lights {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr));
      gap: 8px 12px;
    }
    .light {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 5px;
      border-radius: 30px;
      min-width: 0;
      background: var(--lg-pill);
    }
    .light[data-state="on"] {
      background: color-mix(in srgb, var(--lg-accent) 19%, var(--lg-pill));
    }
    .light[data-state="on"] .symbol {
      color: var(--lg-accent);
    }
    .symbol {
      background: color-mix(in srgb, var(--lg-surface) 85%, transparent);
      color: var(--lg-muted);
    }
    .light[data-state="unavailable"] {
      opacity: 0.65;
    }
    .light[data-state="unavailable"] .label {
      color: var(--lg-muted);
    }
    .light-content {
      flex: 1;
      min-width: 0;
    }
    .light-content .label {
      width: 100%;
    }
    .inline-brightness {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 8px;
    }
    .inline-brightness input {
      flex: 1;
      min-width: 0;
      width: 100%;
      min-height: 44px;
      margin: 0;
      accent-color: var(--lg-accent);
      cursor: pointer;
    }
    .inline-brightness input:disabled {
      cursor: default;
    }
    .inline-brightness output {
      font-size: 11px;
      color: var(--lg-muted);
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
      max-width: 45%;
    }
    .label {
      min-width: 0;
      flex: 1;
      text-align: left;
      padding: 3px 8px;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }
    .name {
      font-size: 13px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
    .status {
      font-size: 11px;
      color: var(--lg-muted);
    }
    .light[aria-busy="true"] {
      outline: 1px dashed var(--lg-accent);
    }
    .hint {
      font-size: 14px;
      line-height: 1.6;
      color: var(--lg-muted);
    }
    .error {
      padding: 10px 12px;
      margin: 12px 0;
      color: var(--error-color, #bd2635);
      background: color-mix(
        in srgb,
        var(--error-color, #bd2635) 8%,
        var(--lg-surface)
      );
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    dialog {
      color: inherit;
      background: var(--lg-surface);
      border: 1px solid var(--divider-color, #ddd);
      border-radius: var(--lg-radius);
      width: min(440px, calc(100vw - 32px));
      max-height: calc(100dvh - 32px);
      padding: 20px;
      box-shadow: 0 16px 60px #0005;
    }
    dialog::backdrop {
      background: rgb(0 0 0 / 0.4);
    }
    dialog header {
      margin-bottom: 18px;
    }
    dialog .heading {
      display: block;
    }
    dialog .status {
      font-size: 13px;
    }
    dialog p {
      line-height: 1.65;
    }
    dialog .controls {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
      margin-top: 20px;
    }
    .action {
      padding: 0 16px;
      border-radius: 22px;
      background: var(--lg-pill);
    }
    .primary {
      background: color-mix(in srgb, var(--lg-accent) 24%, var(--lg-surface));
      color: var(--primary-text-color, #262d38);
    }
    .brightness {
      display: grid;
      gap: 16px;
      margin-top: 24px;
    }
    .brightness-label {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .brightness input {
      width: 100%;
      min-height: 44px;
      accent-color: var(--lg-accent);
      margin: 0;
    }
    .brightness output {
      font-variant-numeric: tabular-nums;
    }
    @media (max-width: 400px) {
      ha-card {
        padding: 12px;
      }
      .header-actions {
        gap: 4px;
      }
      .all-off {
        padding: 0 10px;
      }
      .lights {
        gap: 8px;
      }
      .name {
        font-size: 12px;
      }
    }
  `,
];

class LightGroupCard extends i$1 {
    constructor() {
        super(...arguments);
        this.config = { type: TYPE, sections: [] };
        this.configuring = false;
        this.confirmingAllOff = false;
        this.inlineDrafts = new Map();
        this.inlinePending = new Set();
        this.requests = new Requests(() => {
            for (const id of this.inlineDrafts.keys()) {
                if (this.requests.pending(id))
                    this.inlinePending.add(id);
                else if (this.inlinePending.delete(id))
                    this.inlineDrafts.delete(id);
            }
            if (this.requests?.error ||
                !this.selected ||
                !this.requests.pending(this.selected.entity))
                this.draft = undefined;
            this.requestUpdate();
        });
    }
    setConfig(input) {
        this.close();
        this.configError = undefined;
        try {
            this.config = normalizeConfig(input);
        }
        catch (error) {
            if (!(error instanceof ConfigValidationError))
                throw error;
            this.config = { type: TYPE, sections: [] };
            this.configError = error.code;
        }
        this.inlineDrafts.clear();
        this.inlinePending.clear();
        this.requests.reset();
        this.requestUpdate();
    }
    static getStubConfig() {
        return { type: TYPE, sections: [] };
    }
    static async getConfigElement() {
        await Promise.resolve().then(function () { return editor; });
        return document.createElement("light-group-card-editor");
    }
    getCardSize() {
        return Math.max(2, 1 +
            this.config.sections.reduce((n, s) => n + 1 + Math.ceil(s.lights.length / 2), 0));
    }
    t(key) {
        return t(this.hass, key);
    }
    willUpdate(changed) {
        if (changed.has("hass")) {
            for (const id of this.inlineDrafts.keys()) {
                if (!this.hass || !available(this.hass, id)) {
                    this.inlineDrafts.delete(id);
                    this.inlinePending.delete(id);
                }
            }
            if (this.hass)
                this.requests.reconcile(this.hass.states);
        }
        this.setAttribute("appearance", this.config.appearance ?? "default");
        if (!this.config.color_scheme ||
            this.config.color_scheme === "home-assistant")
            this.removeAttribute("data-color-scheme");
        else
            this.setAttribute("data-color-scheme", this.config.color_scheme);
    }
    updated() {
        const dialog = this.renderRoot.querySelector("dialog");
        if ((this.selected || this.configuring || this.confirmingAllOff) && dialog && !dialog.open)
            dialog.showModal();
    }
    disconnectedCallback() {
        this.close();
        this.inlineDrafts.clear();
        this.inlinePending.clear();
        this.requests.reset();
        super.disconnectedCallback();
    }
    name(light) {
        const friendly = this.hass?.states[light.entity]?.attributes.friendly_name;
        return (light.name || (typeof friendly === "string" ? friendly : light.entity));
    }
    enabled(id) {
        return (!!this.hass && available(this.hass, id) && !this.requests.pending(id));
    }
    status(id) {
        if (!this.hass || !available(this.hass, id))
            return this.t("unavailable");
        if (this.requests.pending(id))
            return this.t("pending");
        return this.t(this.hass.states[id].state === "on" ? "on" : "off");
    }
    send(ids, expected, service, data) {
        const hass = this.hass;
        if (!hass || ids.some((id) => !this.enabled(id)))
            return;
        this.requests.start(ids, expected, () => hass.callService("light", service, data));
    }
    toggle(id) {
        const on = this.hass?.states[id]?.state === "on";
        this.send([id], { state: on ? "off" : "on" }, on ? "turn_off" : "turn_on", {
            entity_id: id,
        });
    }
    requestAllOff(event) {
        if (this.config.confirm_all_off) {
            this.trigger = event.currentTarget;
            this.confirmingAllOff = true;
            this.requestUpdate();
        }
        else
            this.allOff();
    }
    allOff() {
        if (!this.hass ||
            this.config.sections.some((s) => s.lights.some((l) => this.requests.pending(l.entity))))
            return;
        const ids = allOffTargets(this.config, this.hass);
        if (ids.length)
            this.send(ids, { state: "off" }, "turn_off", { entity_id: ids });
    }
    open(light, event) {
        this.trigger = event.currentTarget;
        this.selected = light;
        this.configuring = !light;
        this.draft = undefined;
        this.requestUpdate();
    }
    close() {
        this.renderRoot?.querySelector("dialog")?.close();
        this.selected = undefined;
        this.configuring = false;
        this.confirmingAllOff = false;
        this.draft = undefined;
        if (this.trigger?.isConnected)
            this.trigger.focus();
        this.trigger = undefined;
        this.requestUpdate();
    }
    more() {
        const id = this.selected?.entity;
        if (!id || !this.hass || !available(this.hass, id))
            return;
        this.close();
        this.dispatchEvent(new CustomEvent("hass-more-info", {
            detail: { entityId: id },
            bubbles: true,
            composed: true,
        }));
    }
    brightness(event, commit, inlineId) {
        const id = inlineId ?? this.selected?.entity;
        const value = Number(event.target.value);
        if (!id ||
            !this.enabled(id) ||
            !supportsBrightness(this.hass?.states[id]) ||
            !Number.isFinite(value) ||
            value < 0 ||
            value > 100)
            return;
        if (inlineId)
            this.inlineDrafts.set(inlineId, value);
        else
            this.draft = value;
        this.requestUpdate();
        if (commit)
            this.send([id], { state: value === 0 ? "off" : "on", brightnessPct: value }, "turn_on", { entity_id: id, brightness_pct: value });
    }
    error() {
        return this.requests.error
            ? b `<p class="error" role="alert">
          ${this.t(this.requests.error)}${this.requests.errorDetail ? b ` — ${this.requests.errorDetail}` : A}
        </p>`
            : A;
    }
    light(light) {
        const id = light.entity;
        const entity = this.hass?.states[id];
        const valid = !!this.hass && available(this.hass, id);
        const on = entity?.state === "on";
        const brightness = this.inlineDrafts.get(id) ?? (entity?.state === "off" ? 0 : brightnessPercent(entity));
        const icon = light.icon ||
            (typeof entity?.attributes.icon === "string"
                ? entity.attributes.icon
                : "mdi:lightbulb-outline");
        return b `<div
      class="light"
      data-entity=${id}
      data-state=${valid ? (on ? "on" : "off") : "unavailable"}
      aria-busy=${String(this.requests.pending(id))}
    >
      <button
        class="round symbol"
        data-action="toggle"
        ?disabled=${!this.enabled(id)}
        aria-label=${`${this.t(on ? "turnOff" : "turnOn")}: ${this.name(light)}`}
        aria-pressed=${String(on)}
        title=${this.t(on ? "turnOff" : "turnOn")}
        @click=${() => this.toggle(id)}
      >
        <ha-icon .icon=${icon}></ha-icon>
      </button>
      <div class="light-content">
      <button
        class="label"
        data-action="details"
        @click=${(e) => this.open(light, e)}
        aria-label=${`${this.t("details")}: ${this.name(light)}`}
        title=${this.name(light)}
      >
        <span class="name">${this.name(light)}</span
        ><span class="status">${this.status(id)}</span>
      </button>
      ${supportsBrightness(entity) ? b `
        <div class="inline-brightness">
          <input type="range" min="0" max="100" step="1"
            .value=${l(String(brightness ?? 0))}
            aria-label=${`${this.t("brightness")}: ${this.name(light)}`}
            aria-valuetext=${brightness === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, brightness)}
            ?disabled=${!this.enabled(id)}
            @input=${(e) => this.brightness(e, false, id)}
            @change=${(e) => this.brightness(e, true, id)}
          />
          <output>${brightness === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, brightness)}</output>
        </div>` : A}
      </div>
    </div>`;
    }
    dialog() {
        const light = this.selected;
        const entity = light ? this.hass?.states[light.entity] : undefined;
        const actual = entity?.state === "off" ? 0 : brightnessPercent(entity);
        const value = this.draft ?? actual;
        return b `<dialog
      aria-labelledby="dialog-title"
      @cancel=${(e) => {
            e.preventDefault();
            this.close();
        }}
    >
      <header>
        <div class="heading">
          <h2 id="dialog-title">
            ${light ? this.name(light) : this.t(this.confirmingAllOff ? "allOff" : "configure")}
          </h2>
          ${light ? b `<span class="status" aria-live="polite">${this.status(light.entity)}</span>` : A}
        </div>
        <button
          class="round"
          data-action="close"
          aria-label=${this.t("close")}
          title=${this.t("close")}
          @click=${() => this.close()}
        >
          <ha-icon .icon=${"mdi:close"}></ha-icon>
        </button>
      </header>
      ${this.confirmingAllOff
            ? b `<p>${this.t("allOffPrompt").replace("{title}", this.config.title || this.t("title"))}</p>
              <div class="controls">
                <button class="action" data-action="cancel-all-off" autofocus
                  @click=${() => this.close()}>${this.t("cancel")}</button>
                <button class="action primary" data-action="confirm-all-off"
                  ?disabled=${!this.hass || !allOffTargets(this.config, this.hass).length || this.config.sections.some((s) => s.lights.some((l) => this.requests.pending(l.entity)))}
                  @click=${() => { this.close(); this.allOff(); }}>${this.t("allOff")}</button>
              </div>`
            : light
                ? b `
              ${supportsBrightness(entity)
                    ? b `<label class="brightness"
                      ><span class="brightness-label"
                        ><span>${this.t("brightness")}</span
                        ><output
                          >${value === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, value)}</output
                        ></span
                      >
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        .value=${l(String(value ?? 0))}
                        aria-label=${this.t("brightness")}
                        aria-valuetext=${value === undefined ? this.t("unknownBrightness") : formatPercent(this.hass, value)}
                        ?disabled=${!this.enabled(light.entity)}
                        @input=${(e) => this.brightness(e, false)}
                        @change=${(e) => this.brightness(e, true)}
                    /></label>`
                    : A}
              ${this.error()}
              <div class="controls">
                <button
                  class="action"
                  data-action="more"
                  ?disabled=${!this.hass || !available(this.hass, light.entity)}
                  @click=${() => this.more()}
                >
                  ${this.t("more")}</button
                ><button
                  class="action primary"
                  data-action="dialog-toggle"
                  ?disabled=${!this.enabled(light.entity)}
                  @click=${() => this.toggle(light.entity)}
                >
                  ${this.t(entity?.state === "on" ? "turnOff" : "turnOn")}
                </button>
              </div>
            `
                : b `<p class="hint">${this.t("configureHelp")}</p>`}
    </dialog>`;
    }
    render() {
        const ids = this.hass ? allOffTargets(this.config, this.hass) : [];
        const pending = this.config.sections.some((s) => s.lights.some((l) => this.requests.pending(l.entity)));
        return b `<ha-card>
      <header>
        <div class="heading">
          <ha-icon
            .icon=${this.config.icon || "mdi:lightbulb-group-outline"}
          ></ha-icon>
          <h2>${this.config.title || this.t("title")}</h2>
        </div>
        <div class="header-actions">
          ${this.config.show_all_off !== false ? b `<button
            class="all-off"
            data-action="all-off"
            ?disabled=${!ids.length || pending}
            @click=${(event) => this.requestAllOff(event)}
          >
            <ha-icon .icon=${"mdi:lightbulb-group-off-outline"}></ha-icon
            >${this.t("allOff")}
          </button>` : A}
          <button
            class="round"
            data-action="configure"
            aria-label=${this.t("configure")}
            title=${this.t("configure")}
            @click=${(e) => this.open(undefined, e)}
          >
            <ha-icon .icon=${"mdi:cog-outline"}></ha-icon>
          </button>
        </div>
      </header>
      ${this.configError ? b `<p class="error" role="alert">${this.t(this.configError)}</p>` : this.error()}
      ${!this.config.sections.length
            ? b `<p class="hint">${this.t("setup")}</p>`
            : this.config.sections.map((s) => b `<section>
                  <div class="section-heading">
                    ${s.icon ? b `<ha-icon .icon=${s.icon}></ha-icon>` : A}
                    <h3>${s.name}</h3>
                  </div>
                  <div class="lights">
                    ${s.lights.map((l) => this.light(l))}
                  </div>
                </section>`)}
      ${this.dialog()}
    </ha-card>`;
    }
}
LightGroupCard.styles = styles;
LightGroupCard.properties = { hass: { attribute: false } };
if (!customElements.get("light-group-card"))
    customElements.define("light-group-card", LightGroupCard);
const registry = window;
registry.customCards ?? (registry.customCards = []);
if (!registry.customCards.some((c) => c.type === "light-group-card"))
    registry.customCards.push({
        type: "light-group-card",
        name: "Light Group Card",
        description: "Room sections, light controls and all off for a floor or zone.",
        preview: true,
    });

/** Edits only Lovelace configuration. HA's dashboard owns Save and Cancel. */
class LightGroupEditor extends i$1 {
    constructor() {
        super(...arguments);
        this.config = { type: TYPE, sections: [] };
        this.invalid = false;
    }
    setConfig(config) {
        this.configError = undefined;
        try {
            this.config = normalizeConfig(config);
        }
        catch (error) {
            if (!(error instanceof ConfigValidationError))
                throw error;
            this.configError = error.code;
        }
        this.invalid = false;
        this.requestUpdate();
    }
    t(key) {
        return t(this.hass, key);
    }
    change(update) {
        const next = structuredClone(this.config);
        update(next);
        this.config = next;
        this.invalid = false;
        try {
            const valid = normalizeConfig(next);
            this.dispatchEvent(new CustomEvent("config-changed", {
                detail: { config: valid },
                bubbles: true,
                composed: true,
            }));
        }
        catch {
            // A new selector remains a local draft until the user selects a light.
            this.invalid = next.sections.some((s) => s.lights.some((l) => l.entity !== "" && !/^light\.[a-z0-9_]+$/.test(l.entity)));
        }
        this.requestUpdate();
    }
    text(name, label, value, change) {
        return b `<label
      >${this.t(label)}<input
        name=${name}
        .value=${l(value ?? "")}
        @change=${(e) => change(e.target.value)}
    /></label>`;
    }
    move(list, index, offset) {
        const to = index + offset;
        if (to < 0 || to >= list.length)
            return;
        [list[index], list[to]] = [list[to], list[index]];
    }
    tool(action, label, icon, disabled, run, context) {
        return b `<button
      class="icon-button"
      data-action=${action}
      ?disabled=${disabled}
      title=${this.t(label)}
      aria-label=${`${this.t(label)}: ${context}`}
      @click=${run}
    >
      <ha-icon .icon=${icon}></ha-icon>
    </button>`;
    }
    light(light, s, l) {
        const count = this.config.sections[s].lights.length;
        const name = light.name || light.entity || this.t("entity");
        return b `<div class="light-row" data-light=${l}>
      <ha-selector
        .hass=${this.hass}
        .selector=${{ entity: { domain: "light" } }}
        .value=${light.entity || undefined}
        .label=${this.t("entity")}
        @value-changed=${(e) => {
            e.stopPropagation();
            this.change((c) => {
                c.sections[s].lights[l].entity = e.detail.value ?? "";
            });
        }}
      ></ha-selector>
      <div class="fields">
        ${this.text(`light-name-${s}-${l}`, "name", light.name, (value) => this.change((c) => {
            c.sections[s].lights[l].name = value;
        }))}${this.text(`light-icon-${s}-${l}`, "icon", light.icon, (value) => this.change((c) => {
            c.sections[s].lights[l].icon = value;
        }))}
      </div>
      <div class="tools">
        ${this.tool("light-up", "moveUp", "mdi:arrow-up", l === 0, () => this.change((c) => this.move(c.sections[s].lights, l, -1)), name)}
        ${this.tool("light-down", "moveDown", "mdi:arrow-down", l === count - 1, () => this.change((c) => this.move(c.sections[s].lights, l, 1)), name)}
        ${this.tool("remove-light", "remove", "mdi:delete-outline", false, () => this.change((c) => {
            c.sections[s].lights.splice(l, 1);
        }), name)}
      </div>
    </div>`;
    }
    section(section, index) {
        return b `<fieldset data-section=${index}>
      <legend>${section.name || this.t("newRoom")}</legend>
      <div class="fields">
        ${this.text(`section-name-${index}`, "sectionName", section.name, (value) => this.change((c) => {
            c.sections[index].name = value;
        }))}${this.text(`section-icon-${index}`, "icon", section.icon, (value) => this.change((c) => {
            c.sections[index].icon = value;
        }))}
      </div>
      <div class="tools">
        ${this.tool("section-up", "moveUp", "mdi:arrow-up", index === 0, () => this.change((c) => this.move(c.sections, index, -1)), section.name)}
        ${this.tool("section-down", "moveDown", "mdi:arrow-down", index === this.config.sections.length - 1, () => this.change((c) => this.move(c.sections, index, 1)), section.name)}
        ${this.tool("remove-section", "remove", "mdi:delete-outline", false, () => this.change((c) => {
            c.sections.splice(index, 1);
        }), section.name)}
      </div>
      ${section.lights.map((light, l) => this.light(light, index, l))}
      <button
        class="add"
        data-action="add-light"
        @click=${() => this.change((c) => {
            c.sections[index].lights.push({ entity: "" });
        })}
      >
        ${this.t("addLight")}
      </button>
    </fieldset>`;
    }
    render() {
        if (this.configError)
            return b `<p class="error" role="alert">
        ${this.t(this.configError)} ${this.t("invalidConfig")}
      </p>`;
        const incomplete = this.config.sections.some((s) => s.lights.some((l) => !l.entity));
        return b `
      <p>${this.t("editorHelp")}</p>
      <label>
        ${this.t("showAllOff")}
        <input type="checkbox" name="show_all_off"
          .checked=${l(this.config.show_all_off ?? true)}
          @change=${(e) => this.change((c) => {
            c.show_all_off = e.target.checked;
        })}
        />
      </label>
      <label>
        ${this.t("confirmAllOff")}
        <input type="checkbox" name="confirm_all_off"
          .checked=${l(this.config.confirm_all_off ?? false)}
          @change=${(e) => this.change((c) => {
            c.confirm_all_off = e.target.checked;
        })}
        />
      </label>
      <div class="fields">
        ${this.text("title", "cardTitle", this.config.title, (value) => this.change((c) => {
            c.title = value;
        }))}${this.text("icon", "icon", this.config.icon, (value) => this.change((c) => {
            c.icon = value;
        }))}
        <label
          >${this.t("appearance")}<select
            name="appearance"
            .value=${l(this.config.appearance ?? "default")}
            @change=${(e) => this.change((c) => {
            c.appearance = e.target
                .value;
        })}
          >
            ${["default", "bubble"].map((v) => b `<option value=${v} ?selected=${v === (this.config.appearance ?? "default")}>${this.t(v)}</option>`)}
          </select></label
        >
        <label
          >${this.t("colorScheme")}<select
            name="color_scheme"
            .value=${l(this.config.color_scheme ?? "home-assistant")}
            @change=${(e) => this.change((c) => {
            c.color_scheme = e.target
                .value;
        })}
          >
            ${colorSchemes.map((v) => b `<option value=${v} ?selected=${v === (this.config.color_scheme ?? "home-assistant")}>${this.t(v)}</option>`)}
          </select></label
        >
      </div>
      ${this.invalid ? b `<p class="error" role="alert">${this.t("invalidValue")}</p>` : incomplete ? b `<p class="error" role="alert">${this.t("incomplete")}</p>` : ""}
      ${this.config.sections.map((s, i) => this.section(s, i))}
      <button
        class="add"
        data-action="add-section"
        @click=${() => this.change((c) => {
            c.sections.push({ name: this.t("newRoom"), lights: [] });
        })}
      >
        ${this.t("addSection")}
      </button>
    `;
    }
}
LightGroupEditor.properties = { hass: { attribute: false } };
LightGroupEditor.styles = i$4 `
    :host {
      display: block;
      color: var(--primary-text-color, #202b36);
      font: inherit;
    }
    * {
      box-sizing: border-box;
    }
    p {
      line-height: 1.5;
      color: var(--secondary-text-color, #626976);
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 14px;
    }
    input,
    select,
    button {
      font: inherit;
      color: inherit;
      min-height: 44px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      padding: 8px 10px;
    }
    button {
      cursor: pointer;
      background: var(--secondary-background-color, #f1f3f6);
    }
    button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    input:focus-visible,
    select:focus-visible,
    button:focus-visible {
      outline: 3px solid var(--primary-color, #507b9b);
      outline-offset: 2px;
    }
    .fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
      gap: 12px;
      margin: 12px 0;
    }
    fieldset {
      min-width: 0;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 14px;
      padding: 12px;
      margin: 16px 0;
    }
    legend {
      padding: 0 6px;
      font-weight: 600;
    }
    .tools {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin: 10px 0;
    }
    .light-row {
      border-top: 1px solid var(--divider-color, #ccc);
      padding: 12px 0;
    }
    .error {
      color: var(--error-color, #bd2635);
    }
    ha-selector {
      display: block;
      width: 100%;
      margin: 8px 0;
    }
    .icon-button {
      min-width: 44px;
    }
    ha-icon {
      --mdc-icon-size: 20px;
    }
    .add {
      width: 100%;
      margin-top: 8px;
    }
  `;
if (!customElements.get("light-group-card-editor"))
    customElements.define("light-group-card-editor", LightGroupEditor);

var editor = /*#__PURE__*/Object.freeze({
    __proto__: null,
    LightGroupEditor: LightGroupEditor
});

export { LightGroupCard };
//# sourceMappingURL=light-group-card.js.map
