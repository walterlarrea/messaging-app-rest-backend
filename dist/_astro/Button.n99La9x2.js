import{r as c}from"./index.LFf77hJu.js";import"./messages.3502c30d.z5n3LM_9.js";function m(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var f={exports:{}},p={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var y=c,d=Symbol.for("react.element"),x=Symbol.for("react.fragment"),g=Object.prototype.hasOwnProperty,_=y.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,b={key:!0,ref:!0,__self:!0,__source:!0};function l(e,n,o){var s,i={},t=null,r=null;o!==void 0&&(t=""+o),n.key!==void 0&&(t=""+n.key),n.ref!==void 0&&(r=n.ref);for(s in n)g.call(n,s)&&!b.hasOwnProperty(s)&&(i[s]=n[s]);if(e&&e.defaultProps)for(s in n=e.defaultProps,n)i[s]===void 0&&(i[s]=n[s]);return{$$typeof:d,type:e,key:t,ref:r,props:i,_owner:_.current}}p.Fragment=x;p.jsx=l;p.jsxs=l;f.exports=p;var h=f.exports,u={exports:{}};/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/(function(e){(function(){var n={}.hasOwnProperty;function o(){for(var t="",r=0;r<arguments.length;r++){var a=arguments[r];a&&(t=i(t,s(a)))}return t}function s(t){if(typeof t=="string"||typeof t=="number")return t;if(typeof t!="object")return"";if(Array.isArray(t))return o.apply(null,t);if(t.toString!==Object.prototype.toString&&!t.toString.toString().includes("[native code]"))return t.toString();var r="";for(var a in t)n.call(t,a)&&t[a]&&(r=i(r,a));return r}function i(t,r){return r?t?t+" "+r:t+r:t}e.exports?(o.default=o,e.exports=o):window.classNames=o})()})(u);var v=u.exports;const O=m(v),w=({type:e="button",size:n="md",variant:o="primary",classes:s,children:i,...t})=>{const r=O(s,j[o]);return h.jsx("button",{className:r,type:e,"data-size":n,...t,children:i})},j={primary:"text-[--light] bg-[--primary]",secondary:"text-[--light] bg-[--primary]",success:"text-[--light] bg-[--success]",danger:"text-[--light] bg-[--danger]",warning:"text-[--light] bg-[--warning]",info:"text-[--light] bg-[--info]",light:"text-[--dark] bg-[--light]",dark:"text-[--light] bg-[--dark]"};export{w as B,h as j};
