(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/my/help"],{"0b73":function(t,n,e){"use strict";(function(t){e("627e");a(e("66fd"));var n=a(e("cea6"));function a(t){return t&&t.__esModule?t:{default:t}}t(n.default)}).call(this,e("543d")["createPage"])},"39e9":function(t,n,e){"use strict";var a;e.d(n,"b",(function(){return c})),e.d(n,"c",(function(){return i})),e.d(n,"a",(function(){return a}));var c=function(){var t=this,n=t.$createElement,a=(t._self._c,e("3748"));t.$mp.data=Object.assign({},{$root:{m0:a}})},i=[]},"556c":function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var a=function(){e.e("components/base/no-data").then(function(){return resolve(e("ca77"))}.bind(null,e)).catch(e.oe)},c={components:{NoDate:a},data:function(){return{isNoDate:!1,list:[]}},created:function(){this.init()},methods:{init:function(){this.getHelpList()},getHelpList:function(){var t=this;this.$tool.uniRequest({url:"/api/wxapp/help",success:function(n){t.list=n.list}})},toRichPage:function(t){this.$tool.uniNavigateTo({url:"/pages/base/rich?fromPage=help&id=".concat(t.help_id)})}}};n.default=c},"9c02":function(t,n,e){},cea6:function(t,n,e){"use strict";e.r(n);var a=e("39e9"),c=e("d946");for(var i in c)"default"!==i&&function(t){e.d(n,t,(function(){return c[t]}))}(i);e("d65a");var u,o=e("f0c5"),r=Object(o["a"])(c["default"],a["b"],a["c"],!1,null,"98a7ef78",null,!1,a["a"],u);n["default"]=r.exports},d65a:function(t,n,e){"use strict";var a=e("9c02"),c=e.n(a);c.a},d946:function(t,n,e){"use strict";e.r(n);var a=e("556c"),c=e.n(a);for(var i in a)"default"!==i&&function(t){e.d(n,t,(function(){return a[t]}))}(i);n["default"]=c.a}},[["0b73","common/runtime","common/vendor"]]]);