(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/index/index"],{1365:function(e,t,n){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var a=o(n("a34a")),i=n("2f62");function o(e){return e&&e.__esModule?e:{default:e}}function r(e,t,n,a,i,o,r){try{var s=e[o](r),c=s.value}catch(u){return void n(u)}s.done?t(c):Promise.resolve(c).then(a,i)}function s(e){return function(){var t=this,n=arguments;return new Promise((function(a,i){var o=e.apply(t,n);function s(e){r(o,a,i,s,c,"next",e)}function c(e){r(o,a,i,s,c,"throw",e)}s(void 0)}))}}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){d(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var l=function(){n.e("components/base/auth-login").then(function(){return resolve(n("055c"))}.bind(null,n)).catch(n.oe)},f=function(){n.e("components/queue/queue").then(function(){return resolve(n("674d"))}.bind(null,n)).catch(n.oe)},h={components:{AuthLogin:l,Queue:f},data:function(){return{list:!0,bottom:!1,queue:!1,adImg:"",mapScale:16,isAuthAddress:!1,isShowAuthLogin:!1,phone:0,isContact:!1,weatherInfo:null,latitude:null,longitude:null,covers:[],mapCtx:null,addressInfo:null,fromPage:null,markDetail:null,distance:0}},onShareAppMessage:function(e){e.from;var t=this.$cache.get("_userId");return{title:"快来参加吧！",path:"/pages/index/index?referrerId=".concat(t)}},onLoad:function(e){this.fromPage=e&&e.fromPage?e.fromPage:null,this.fromPage&&"address"===this.fromPage&&(this.addressInfo=JSON.parse(e.addressInfo),this.latitude=this.addressInfo.lat,this.longitude=this.addressInfo.lng,this.$cache.set("_addressInfo",this.addressInfo)),e.referrerId&&this.$cache.set("_referrerId",e.referrerId)},onReady:function(){this.init(),this.findsiteUpdata()},methods:u(u({},(0,i.mapActions)(["setSite"])),{},{queueFunc:function(){this.queue=!0,this.list=!1,this.bottom=!1},closeQueue:function(){this.queue=!1,this.list=!0,this.bottom=!0},tap:function(e){},init:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.$tool.isGetLocation("scope.userLocation",(function(){e.isAuthAddress=!0,e.isShowAuthLogin=!1,e.fromPage&&"address"===e.fromPage&&!t?(e.mapScale=11,e.getWeather(),e.getPthone(),e.getListInfo()):(e.mapScale=16,e.getLocationInfo()),e.getAdInfo()}),(function(){e.isAuthAddress=!1,e.isShowAuthLogin=!0}))},loginOk:function(){this.init()},addressHandle:function(){this.init(!0),this.$cache.delete("site")},getPthone:function(){var e=this;return s(a.default.mark((function t(){var n;return a.default.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,e.$api.index_Tel();case 2:n=t.sent,e.phone=n.data.tel;case 4:case"end":return t.stop()}}),t)})))()},getPhoneNumber:function(e){},markertap:function(e){var t=this,n=e.detail.markerId,a=null;this.covers.forEach((function(e,i){e.iconPath="../../static/image/maplocation.png",e.id==n&&(a=e,t.markColor(e,i))}));try{if(a.goods_id==this.markDetail.goods_id)return;a&&this.getInfo(a.goods_id)}catch(e){a&&this.getInfo(a.goods_id)}},markColor:function(e,t){e.iconPath="../../static/image/maplocation-on.png"},getInfo:function(e){var t=this;return s(a.default.mark((function n(){var i,o,r;return a.default.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return i=t.$cache.get("_addressInfo"),n.next=3,t.$api.index_goodsDetail({goods_id:e,lat:i.lat,lng:i.lng});case 3:o=n.sent,"Undefined index: result"==o.msg?(t.markDetail=null,setTimeout((function(){t.$tool.uniShowToast({title:"即将开业！",icon:"none"})}),400)):(t.markDetail=o.data.detail,t.bottom=!0,r=o.data.detail.goods_distance,t.distance=r?t.$tool.distanceHanlde(r):0);case 5:case"end":return n.stop()}}),n)})))()},regionchange:function(e){},open:function(){e.openLocation({latitude:parseFloat(this.markDetail.goods_lat),longitude:parseFloat(this.markDetail.goods_lng),name:this.markDetail.goods_name,address:this.markDetail.goods_df,success:function(){console.log("success")}})},getSiteDetail:function(){var e=this.markDetail;this.$tool.uniNavigateTo({url:"/pages/index/site-detail?id=".concat(e.goods_id)})},toAdPage:function(){this.$tool.uniNavigateTo({url:"/pages/my/card"})},findsiteUpdata:function(){var e=this;return s(a.default.mark((function t(){var n,i,o;return a.default.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,e.$api.index_getConts({wxapp_id:"10001"});case 2:if(n=t.sent,!n){t.next=9;break}if(i=e.$cache.get("_covers"),i){t.next=7;break}return t.abrupt("return");case 7:o=i.length,n.data.cont!=o&&(e.$cache.delete("_covers"),e.getListInfo());case 9:case"end":return t.stop()}}),t)})))()},getLocationInfo:function(){var t=this;this.mapCtx=e.createMapContext("myMap"),e.getLocation({type:"wgs84",geocode:!0,success:function(e){t.latitude=e.latitude,t.longitude=e.longitude,t.$tool.uniRequest({url:"/api/Geocoder",params:{lat:t.latitude,lng:t.longitude},success:function(e){console.log("城市",e);var n=e.geocoder.city;"市"===n.charAt(n.length-1)&&(n=n.substr(0,n.length-1)),t.addressInfo={name:n,lat:t.latitude,lng:t.longitude,category_id:""},t.mapCtx.moveToLocation(),t.$cache.set("_addressInfo",t.addressInfo),t.getWeather(),t.getListInfo(),t.getPthone(),t.setSite({latitude:t.latitude,longitude:t.longitude})}})}})},getStorageListSite:function(e){var t=this;return s(a.default.mark((function n(){var i,o;return a.default.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return n.prev=0,t.$cache.delete("site"),n.next=4,t.$api.index_GetNearbyGasStation({lat:String(e.latitude),lng:String(e.longitude)});case 4:i=n.sent,o=i.data,t.$cache.set("site",o),getApp().globalData._site=o.posiList[0],n.next=13;break;case 10:n.prev=10,n.t0=n["catch"](0),console.log(n.t0);case 13:case"end":return n.stop()}}),n,null,[[0,10]])})))()},getAdInfo:function(){var e=this;return s(a.default.mark((function t(){var n;return a.default.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,e.$api.index_ad();case 2:n=t.sent,e.adImg=n.data.indexAd;case 4:case"end":return t.stop()}}),t)})))()},getWeather:function(){var e=this;return s(a.default.mark((function t(){var n;return a.default.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,e.$api.index_weather({lat:e.addressInfo.lat,lng:e.addressInfo.lng,city:e.addressInfo.name});case 2:n=t.sent,e.weatherInfo=n;case 4:case"end":return t.stop()}}),t)})))()},getListInfo:function(){var e=this;return s(a.default.mark((function t(){var n,i,o,r,s,c;return a.default.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(n=e.$cache.get("_covers"),!n){t.next=4;break}return e.covers=n,t.abrupt("return");case 4:return t.next=6,e.$api.index_mapCover();case 6:for(s in i=t.sent,o=i.data,r=o&&o.posiList&&o.posiList.data?o.posiList.data:[],e.covers=[],r)c={id:s+1,width:"50rpx",height:"63rpx",goods_id:r[s].goods_id,latitude:r[s].goods_lat,longitude:r[s].goods_lng,iconPath:"../../static/image/maplocation.png"},e.covers.push(c);e.$cache.set("_covers",e.covers);case 12:case"end":return t.stop()}}),t)})))()},scanCode:function(){var t=this,n=new Promise((function(t,n){e.scanCode({success:t})}));n.then((function(e){var n=e.result,a=t.$tool.getUrlParams(n),i=a.siteId?"site":"userSharing",o={site:"/pages/scan/index?siteId=".concat(a.siteId,"&fromPage=home"),userSharing:"/pages/my/card-detail?uid=".concat(a.uid,"&id=").concat(a.tid)};t.$tool.uniRedirectTo({url:o[i]})}))},online:function(){this.$tool.uniShowToast({title:"稍后开放！",icon:"none"})},toPage:function(e){var t={my:"/pages/my/index",vip:"/pages/my/volume",address:"/pages/address/index?addressName=".concat(this.addressInfo.name),site:"/pages/index/site"},n=t[e]||"/pages/index/index";this.$tool.uniNavigateTo({url:n})},call:function(){e.makePhoneCall({phoneNumber:this.phone})},close:function(){this.isContact=!1}})};t.default=h}).call(this,n("543d")["default"])},4970:function(e,t,n){"use strict";n.r(t);var a=n("1365"),i=n.n(a);for(var o in a)"default"!==o&&function(e){n.d(t,e,(function(){return a[e]}))}(o);t["default"]=i.a},ac3b:function(e,t,n){"use strict";var a;n.d(t,"b",(function(){return i})),n.d(t,"c",(function(){return o})),n.d(t,"a",(function(){return a}));var i=function(){var e=this,t=e.$createElement;e._self._c;e._isMounted||(e.e0=function(t){e.isContact=!0})},o=[]},dcec:function(e,t,n){},ed78:function(e,t,n){"use strict";var a=n("dcec"),i=n.n(a);i.a},ef7b:function(e,t,n){"use strict";n.r(t);var a=n("ac3b"),i=n("4970");for(var o in i)"default"!==o&&function(e){n.d(t,e,(function(){return i[e]}))}(o);n("ed78");var r,s=n("f0c5"),c=Object(s["a"])(i["default"],a["b"],a["c"],!1,null,"c1351c78",null,!1,a["a"],r);t["default"]=c.exports},fb41:function(e,t,n){"use strict";(function(e){n("627e");a(n("66fd"));var t=a(n("ef7b"));function a(e){return e&&e.__esModule?e:{default:e}}e(t.default)}).call(this,n("543d")["createPage"])}},[["fb41","common/runtime","common/vendor"]]]);