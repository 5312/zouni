(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/my/index"],{2607:function(n,t,o){"use strict";o.r(t);var e=o("c70d"),i=o("d450");for(var u in i)"default"!==u&&function(n){o.d(t,n,(function(){return i[n]}))}(u);o("d31c");var s,a=o("f0c5"),c=Object(a["a"])(i["default"],e["b"],e["c"],!1,null,"7953e75c",null,!1,e["a"],s);t["default"]=c.exports},"26d5":function(n,t,o){},b374:function(n,t,o){"use strict";(function(n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var e=function(){o.e("components/base/auth-login").then(function(){return resolve(o("055c"))}.bind(null,o)).catch(o.oe)},i={components:{AuthLogin:e},data:function(){return{isLogin:!1,couponCounts:0,isShowAuthLogin:!1,isContact:!1,phone:0,userInfo:null,orderCount:null,list:null,isCouponCounts:!1,myList:[{img:"../../static/image/11.png",name:"我的车辆",path:"/pages/my/my-car"},{img:"../../static/image/my-yao.png",name:"邀请好友",info:"",isNoOpen:!1,path:"/pages/base/share"},{img:"../../static/image/my-juan.png",name:"优惠券兑换",isNoOpen:!0},{img:"../../static/image/08.png",name:"关于我们",path:"/pages/base/rich?fromPage=about"},{img:"../../static/image/09.png",name:"联系我们",prop:"contact"},{img:"../../static/image/10.png",name:"服务协议",path:"/pages/base/rich?fromPage=serviceAgreement"},{img:"../../static/image/help.png",name:"帮助中心",path:"/pages/my/help"}]}},onLoad:function(){this.init()},onShow:function(){var n=this.$cache.get("_isEditUserInfo");n&&(this.$cache.delete("_isEditUserInfo"),this.init())},methods:{init:function(){var n=this;this.$tool.isGetLocation("scope.userInfo",(function(){n.getNewToken()}),(function(){n.isLogin=!1,n.isShowAuthLogin=!0}))},myInfoPage:function(){var n=this;this.userInfo?this.$tool.uniNavigateTo({url:"/pages/my/my-info"}):this.$tool.getTokenValue({success:function(){n.getNewToken()}})},getNewToken:function(){this.logged()},loginOk:function(){this.getNewToken()},getStyle:function(n){var t={};return t.backgroundColor=n.color.text,t},getCouponCounts:function(){var n=this;this.isCouponCounts=!1,this.$tool.uniRequest({url:"/api/user.coupon/lists&data_type=not_use",success:function(t){console.log("cou",t),n.isCouponCounts=!!(t&&t.list.length>0),n.couponCounts=t&&t.list.length>0?t.list.length:0,n.list=t&&t.list?t.list:[]}})},getPthone:function(){var n=this;this.$tool.uniRequest({url:"/api/Tel",success:function(t){n.phone=t.tel}})},logged:function(){var n=this;this.$tool.uniRequest({url:"/api/user.index/detail",params:{wxapp_id:"10001",token:this.$cache.get("_token")},success:function(t){n.userInfo=t.userInfo,n.orderCount=t.orderCount,n.isLogin=!0,n.isShowAuthLogin=!1,n.getCouponCounts(),n.getPthone()}})},toPage:function(n){if("vip"!==n){var t={volume:"/pages/my/volume",vip:"/pages/vip/index",order:"/pages/my/order"},o=t[n]?t[n]:"/pages/index/index";this.$tool.uniNavigateTo({url:o})}else this.$tool.uniShowToast({title:"稍后开放！",icon:"none"})},toListPage:function(t){t.isNoOpen?this.$tool.uniShowToast({title:"稍后开放！",icon:"none"}):t.path?this.$tool.uniNavigateTo({url:t.path}):"invoice"===t.prop?n.showModal({title:"温馨提示",content:"请按照如下提示获取发票",success:function(n){n.confirm?console.log("用户点击确定"):n.cancel&&console.log("用户点击取消")}}):"contact"===t.prop&&(this.isContact=!0)},close:function(){this.isContact=!1},call:function(){n.makePhoneCall({phoneNumber:this.phone})}}};t.default=i}).call(this,o("543d")["default"])},bbc3:function(n,t,o){"use strict";(function(n){o("627e");e(o("66fd"));var t=e(o("2607"));function e(n){return n&&n.__esModule?n:{default:n}}n(t.default)}).call(this,o("543d")["createPage"])},c70d:function(n,t,o){"use strict";o.d(t,"b",(function(){return i})),o.d(t,"c",(function(){return u})),o.d(t,"a",(function(){return e}));var e={uIcon:function(){return o.e("uview-ui/components/u-icon/u-icon").then(o.bind(null,"b80c"))}},i=function(){var n=this,t=n.$createElement,e=(n._self._c,o("3748")),i=n.isCouponCounts?n.__map(n.list,(function(t,o){var e=n.__get_orig(t),i=10!=t.coupon_type.value&&20==t.coupon_type.value?t.reduce_price.split("."):null;return{$orig:e,g0:i}})):null;n._isMounted||(n.e0=function(t){n.isCouponCounts=!1}),n.$mp.data=Object.assign({},{$root:{m0:e,l0:i}})},u=[]},d31c:function(n,t,o){"use strict";var e=o("26d5"),i=o.n(e);i.a},d450:function(n,t,o){"use strict";o.r(t);var e=o("b374"),i=o.n(e);for(var u in e)"default"!==u&&function(n){o.d(t,n,(function(){return e[n]}))}(u);t["default"]=i.a}},[["bbc3","common/runtime","common/vendor"]]]);