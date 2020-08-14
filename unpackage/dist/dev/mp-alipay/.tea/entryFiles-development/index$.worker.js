if(!self.__appxInited) {
self.__appxInited = 1;


require('./config$');


      if( navigator.userAgent && (navigator.userAgent.indexOf('LyraVM') > 0 || navigator.userAgent.indexOf('AlipayIDE') > 0) ) {
        var AFAppX = self.AFAppX.getAppContext ? self.AFAppX.getAppContext().AFAppX : self.AFAppX;
      } else {
        importScripts('https://appx/af-appx.worker.min.js');
        var AFAppX = self.AFAppX;
      }
      self.getCurrentPages = AFAppX.getCurrentPages;
      self.getApp = AFAppX.getApp;
      self.Page = AFAppX.Page;
      self.App = AFAppX.App;
      self.my = AFAppX.bridge || AFAppX.abridge;
      self.abridge = self.my;
      self.Component = AFAppX.WorkerComponent || function(){};
      self.$global = AFAppX.$global;
      self.requirePlugin = AFAppX.requirePlugin;
    

if(AFAppX.registerApp) {
  AFAppX.registerApp({
    appJSON: appXAppJson,
  });
}



function success() {
require('../../app');
require('../../components/base/auth-login?hash=ec7c5687c7f2ffa836caf3a93e877914426baff6');
require('../../components/base/no-data?hash=ec7c5687c7f2ffa836caf3a93e877914426baff6');
require('../../components/plate-number/plateNumber?hash=ec7c5687c7f2ffa836caf3a93e877914426baff6');
require('../../pages/index/index?hash=479fcf5744bcf1a04e3b8d54a10283692d6f19c5');
require('../../pages/scan/index?hash=479fcf5744bcf1a04e3b8d54a10283692d6f19c5');
require('../../pages/scan/select?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/vip/index?hash=479fcf5744bcf1a04e3b8d54a10283692d6f19c5');
require('../../pages/my/index?hash=479fcf5744bcf1a04e3b8d54a10283692d6f19c5');
require('../../pages/address/index?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/vip/wallet?hash=81f621570f1e87df47c1d8501ee9e30b3d9e9971');
require('../../pages/base/rich?hash=81f621570f1e87df47c1d8501ee9e30b3d9e9971');
require('../../pages/my/volume?hash=0d10c3abef8201d5aa35902874adabb8eece7bc4');
require('../../pages/my/order?hash=81f621570f1e87df47c1d8501ee9e30b3d9e9971');
require('../../pages/my/my-car?hash=81f621570f1e87df47c1d8501ee9e30b3d9e9971');
require('../../pages/my/exchange-volume?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/my/agreement?hash=81f621570f1e87df47c1d8501ee9e30b3d9e9971');
require('../../pages/my/help?hash=81f621570f1e87df47c1d8501ee9e30b3d9e9971');
require('../../pages/index/site?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/index/site-detail?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/base/add-car?hash=07b8e9d2234d19525d9627386d095fbe86bd6392');
require('../../pages/my/order-detail?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/scan/order-detail?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/my/card?hash=0d10c3abef8201d5aa35902874adabb8eece7bc4');
require('../../pages/my/card-detail?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/my/my-info?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/base/edit-my-info?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}