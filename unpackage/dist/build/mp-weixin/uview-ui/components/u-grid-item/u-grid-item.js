(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["uview-ui/components/u-grid-item/u-grid-item"],{5750:function(t,n,e){},7993:function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var i={name:"u-grid-item",props:{bgColor:{type:String,default:"#ffffff"},index:{type:[Number,String],default:""}},inject:["uGrid"],data:function(){return{hoverClass:""}},created:function(){this.hoverClass=this.uGrid.hoverClass},computed:{colNum:function(){return this.col<2?2:this.col>12?12:this.col},width:function(){return 100/Number(this.uGrid.col)+"%"},showBorder:function(){return this.uGrid.border}},methods:{click:function(){this.$emit("click",this.index),this.uGrid.click(this.index)}}};n.default=i},"9ab4":function(t,n,e){"use strict";e.r(n);var i=e("7993"),r=e.n(i);for(var u in i)"default"!==u&&function(t){e.d(n,t,(function(){return i[t]}))}(u);n["default"]=r.a},"9b37":function(t,n,e){"use strict";var i;e.d(n,"b",(function(){return r})),e.d(n,"c",(function(){return u})),e.d(n,"a",(function(){return i}));var r=function(){var t=this,n=t.$createElement;t._self._c},u=[]},"9e19":function(t,n,e){"use strict";var i=e("5750"),r=e.n(i);r.a},aa84:function(t,n,e){"use strict";e.r(n);var i=e("9b37"),r=e("9ab4");for(var u in r)"default"!==u&&function(t){e.d(n,t,(function(){return r[t]}))}(u);e("9e19");var c,o=e("f0c5"),a=Object(o["a"])(r["default"],i["b"],i["c"],!1,null,"83347bea",null,!1,i["a"],c);n["default"]=a.exports}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'uview-ui/components/u-grid-item/u-grid-item-create-component',
    {
        'uview-ui/components/u-grid-item/u-grid-item-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("aa84"))
        })
    },
    [['uview-ui/components/u-grid-item/u-grid-item-create-component']]
]);
