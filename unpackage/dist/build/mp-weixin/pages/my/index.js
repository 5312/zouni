(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/my/index"],{"0850":function(t,n,o){"use strict";(function(t){o("29e1");e(o("66fd"));var n=e(o("83e2"));function e(t){return t&&t.__esModule?t:{default:t}}t(n.default)}).call(this,o("543d")["createPage"])},"1f95":function(t,n,o){"use strict";o.r(n);var e=o("3b96"),i=o.n(e);for(var s in e)"default"!==s&&function(t){o.d(n,t,(function(){return e[t]}))}(s);n["default"]=i.a},"3b96":function(t,n,o){"use strict";(function(t){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e=function(){o.e("components/base/auth-login").then(function(){return resolve(o("ea72"))}.bind(null,o)).catch(o.oe)},i={components:{AuthLogin:e},data:function(){return{isLogin:!1,couponCounts:0,isShowAuthLogin:!1,isContact:!1,phone:0,userInfo:null,orderCount:null,isCouponCounts:!1,myList:[{img:"../../static/image/11.png",name:"我的车辆",path:"/pages/my/my-car"},{img:"../../static/image/my-yao.png",name:"邀请好友",info:"邀请好友免费洗车劵",isNoOpen:!0},{img:"../../static/image/my-juan.png",name:"优惠券兑换",isNoOpen:!0},{img:"../../static/image/08.png",name:"关于我们",path:"/pages/base/rich?fromPage=about"},{img:"../../static/image/09.png",name:"联系我们",prop:"contact"},{img:"../../static/image/10.png",name:"服务协议",path:"/pages/base/rich?fromPage=serviceAgreement"},{img:"../../static/image/help.png",name:"帮助中心",path:"/pages/my/help"}]}},onLoad:function(){this.getPthone(),this.init()},onShow:function(){var t=this.$tool.uniGetStorage("isEditUserInfo");console.log("isShow"),t&&(this.$tool.uniRemoveStorage("isEditUserInfo"),this.init())},methods:{init:function(){var t=this;this.$tool.isGetLocation("scope.userInfo",(function(){t.getNewToken()}),(function(){t.isLogin=!1,t.isShowAuthLogin=!0}))},myInfoPage:function(){var t=this;this.userInfo?this.$tool.uniNavigateTo({url:"/pages/my/my-info"}):this.$tool.getTokenValue({success:function(){t.getNewToken()}})},lookCoupon:function(){this.isCouponCounts=!1,this.toPage("volume")},getNewToken:function(){this.logged()},loginOk:function(){this.getNewToken()},getCouponCounts:function(){var t=this;this.isCouponCounts=!1,this.$tool.uniRequest({url:"/api/user.coupon/getcounts",success:function(n){t.isCouponCounts=!!(n&&n.count>0),t.couponCounts=n&&n.count>0?n.count:0}})},getPthone:function(){var t=this;this.$tool.uniRequest({url:"/api/Tel",success:function(n){t.phone=n.tel}})},logged:function(){var t=this;this.$tool.uniRequest({url:"/api/user.index/detail",params:{wxapp_id:"10001",token:this.$tool.uniGetStorage("token")},success:function(n){t.userInfo=n.userInfo,t.orderCount=n.orderCount,t.isLogin=!0,t.isShowAuthLogin=!1,t.getCouponCounts()}})},toPage:function(t){if("vip"!==t){var n="";switch(t){case"volume":n="/pages/my/volume";break;case"vip":n="/pages/vip/index";break;case"order":n="/pages/my/order";break;default:n="/pages/index/index"}this.$tool.uniNavigateTo({url:n})}else this.$tool.uniShowToast({title:"稍后开放！",icon:"none"})},toListPage:function(n){n.isNoOpen?this.$tool.uniShowToast({title:"稍后开放！",icon:"none"}):n.path?this.$tool.uniNavigateTo({url:n.path}):"invoice"===n.prop?t.showModal({title:"温馨提示",content:"请按照如下提示获取发票",success:function(t){t.confirm?console.log("用户点击确定"):t.cancel&&console.log("用户点击取消")}}):"contact"===n.prop&&(this.isContact=!0)},close:function(){this.isContact=!1},call:function(){t.makePhoneCall({phoneNumber:this.phone})}}};n.default=i}).call(this,o("543d")["default"])},5760:function(t,n,o){},"83e2":function(t,n,o){"use strict";o.r(n);var e=o("b70e"),i=o("1f95");for(var s in i)"default"!==s&&function(t){o.d(n,t,(function(){return i[t]}))}(s);o("da39");var u,a=o("f0c5"),c=Object(a["a"])(i["default"],e["b"],e["c"],!1,null,"44379fd8",null,!1,e["a"],u);n["default"]=c.exports},b70e:function(t,n,o){"use strict";var e,i=function(){var t=this,n=t.$createElement,e=(t._self._c,o("2e66"));t._isMounted||(t.e0=function(n){t.isCouponCounts=!1}),t.$mp.data=Object.assign({},{$root:{m0:e}})},s=[];o.d(n,"b",(function(){return i})),o.d(n,"c",(function(){return s})),o.d(n,"a",(function(){return e}))},da39:function(t,n,o){"use strict";var e=o("5760"),i=o.n(e);i.a}},[["0850","common/runtime","common/vendor"]]]);