(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/my/index"],{2607:function(t,n,o){"use strict";o.r(n);var e=o("4ad5"),i=o("d450");for(var u in i)"default"!==u&&function(t){o.d(n,t,(function(){return i[t]}))}(u);o("9035");var s,a=o("f0c5"),c=Object(a["a"])(i["default"],e["b"],e["c"],!1,null,"6a0c2360",null,!1,e["a"],s);n["default"]=c.exports},"4ad5":function(t,n,o){"use strict";o.d(n,"b",(function(){return i})),o.d(n,"c",(function(){return u})),o.d(n,"a",(function(){return e}));var e={uIcon:function(){return o.e("uview-ui/components/u-icon/u-icon").then(o.bind(null,"b80c"))}},i=function(){var t=this,n=t.$createElement,e=(t._self._c,o("3748")),i=t.isCouponCounts?t.__map(t.list,(function(n,o){var e=t.__get_orig(n),i=10!=n.coupon_type.value&&20==n.coupon_type.value?n.reduce_price.split("."):null;return{$orig:e,g0:i}})):null;t._isMounted||(t.e0=function(n){t.isCouponCounts=!1}),t.$mp.data=Object.assign({},{$root:{m0:e,l0:i}})},u=[]},9035:function(t,n,o){"use strict";var e=o("9605"),i=o.n(e);i.a},9605:function(t,n,o){},b374:function(t,n,o){"use strict";(function(t){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e=function(){o.e("components/base/auth-login").then(function(){return resolve(o("055c"))}.bind(null,o)).catch(o.oe)},i={components:{AuthLogin:e},data:function(){return{isLogin:!1,couponCounts:0,isShowAuthLogin:!1,isContact:!1,phone:0,userInfo:null,orderCount:null,list:null,isCouponCounts:!1,myList:[{img:"../../static/image/11.png",name:"我的车辆",path:"/pages/my/my-car"},{img:"../../static/image/my-yao.png",name:"邀请好友",info:"",isNoOpen:!1,path:"/pages/base/share"},{img:"../../static/image/my-juan.png",name:"优惠券兑换",isNoOpen:!0},{img:"../../static/image/08.png",name:"关于我们",path:"/pages/base/rich?fromPage=about"},{img:"../../static/image/09.png",name:"联系我们",prop:"contact"},{img:"../../static/image/10.png",name:"服务协议",path:"/pages/base/rich?fromPage=serviceAgreement"},{img:"../../static/image/help.png",name:"帮助中心",path:"/pages/my/help"}]}},onLoad:function(){this.init()},onShow:function(){var t=this.$tool.uniGetStorage("isEditUserInfo");t&&(this.$tool.uniRemoveStorage("isEditUserInfo"),this.init())},methods:{init:function(){var t=this;this.$tool.isGetLocation("scope.userInfo",(function(){t.getNewToken()}),(function(){t.isLogin=!1,t.isShowAuthLogin=!0}))},myInfoPage:function(){var t=this;this.userInfo?this.$tool.uniNavigateTo({url:"/pages/my/my-info"}):this.$tool.getTokenValue({success:function(){t.getNewToken()}})},getNewToken:function(){this.logged()},loginOk:function(){this.getNewToken()},getStyle:function(t){var n={};return n.backgroundColor=t.color.text,n},getCouponCounts:function(){var t=this;this.isCouponCounts=!1,this.$tool.uniRequest({url:"/api/user.coupon/lists&data_type=not_use",success:function(n){console.log("cou",n),t.isCouponCounts=!!(n&&n.list.length>0),t.couponCounts=n&&n.list.length>0?n.list.length:0,t.list=n&&n.list?n.list:[]}})},getPthone:function(){var t=this;this.$tool.uniRequest({url:"/api/Tel",success:function(n){t.phone=n.tel}})},logged:function(){var t=this;this.$tool.uniRequest({url:"/api/user.index/detail",params:{wxapp_id:"10001",token:this.$tool.uniGetStorage("token")},success:function(n){t.userInfo=n.userInfo,t.orderCount=n.orderCount,t.isLogin=!0,t.isShowAuthLogin=!1,t.getCouponCounts(),t.getPthone()}})},toPage:function(t){if("vip"!==t){var n={volume:"/pages/my/volume",vip:"/pages/vip/index",order:"/pages/my/order"},o=n[t]?n[t]:"/pages/index/index";this.$tool.uniNavigateTo({url:o})}else this.$tool.uniShowToast({title:"稍后开放！",icon:"none"})},toListPage:function(n){n.isNoOpen?this.$tool.uniShowToast({title:"稍后开放！",icon:"none"}):n.path?this.$tool.uniNavigateTo({url:n.path}):"invoice"===n.prop?t.showModal({title:"温馨提示",content:"请按照如下提示获取发票",success:function(t){t.confirm?console.log("用户点击确定"):t.cancel&&console.log("用户点击取消")}}):"contact"===n.prop&&(this.isContact=!0)},close:function(){this.isContact=!1},call:function(){t.makePhoneCall({phoneNumber:this.phone})}}};n.default=i}).call(this,o("543d")["default"])},bbc3:function(t,n,o){"use strict";(function(t){o("627e");e(o("66fd"));var n=e(o("2607"));function e(t){return t&&t.__esModule?t:{default:t}}t(n.default)}).call(this,o("543d")["createPage"])},d450:function(t,n,o){"use strict";o.r(n);var e=o("b374"),i=o.n(e);for(var u in e)"default"!==u&&function(t){o.d(n,t,(function(){return e[t]}))}(u);n["default"]=i.a}},[["bbc3","common/runtime","common/vendor"]]]);