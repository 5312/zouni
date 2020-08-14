var ResponseEvent;
(function (ResponseEvent) {
    ResponseEvent["ById"] = "Tyro.byId";
    ResponseEvent["Sticky"] = "Tyro.sticky";
    ResponseEvent["StickyNotSendPaused"] = "Tyro.stickyNotSendPaused";
    ResponseEvent["StickyAsync"] = "Tyro.stickyAsync";
    ResponseEvent["ScriptSource"] = "Tyro.scriptSource";
    ResponseEvent["Resumed"] = "Debugger.resumed";
    ResponseEvent["ConsoleAPICalled"] = "Runtime.consoleAPICalled";
})(ResponseEvent || (ResponseEvent = {}));
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["DiscardConsoleEntries"] = "Tyro.discardConsoleEntries";
    RequestMethod["Evaluate"] = "Tyro.evaluate";
    RequestMethod["EvaluateOnCallFrame"] = "Tyro.evaluateOnCallFrame";
    RequestMethod["CallFunctionOn"] = "Tyro.callFunctionOn";
    RequestMethod["CompileScript"] = "Tyro.compileScript";
    RequestMethod["SetBreakpointsActive"] = "Tyro.setBreakpointsActive";
    RequestMethod["SetSkipAllPauses"] = "Tyro.setSkipAllPauses";
    RequestMethod["Resume"] = "Tyro.resume";
    RequestMethod["StepInto"] = "Tyro.stepInto";
    RequestMethod["StepOver"] = "Tyro.stepOver";
    RequestMethod["StepOut"] = "Tyro.stepOut";
    RequestMethod["Pause"] = "Tyro.pause";
    RequestMethod["GetPossibleBreakpoints"] = "Tyro.getPossibleBreakpoints";
    RequestMethod["SetBreakpointByUrl"] = "Tyro.setBreakpointByUrl";
    RequestMethod["SetBreakpoint"] = "Tyro.setBreakpoint";
    RequestMethod["RemoveBreakpoint"] = "Tyro.removeBreakpoint";
    RequestMethod["REPL"] = "Tyro.repl";
    RequestMethod["GetVariableValue"] = "Tyro.getVariableValue";
    RequestMethod["SetPauseOnExceptions"] = "Tyro.setPauseOnExceptions";
    RequestMethod["SetAsyncCallStackDepth"] = "Tyro.setAsyncCallStackDepth";
    RequestMethod["GetProperties"] = "Tyro.getProperties";
})(RequestMethod || (RequestMethod = {}));
var BreakStepType;
(function (BreakStepType) {
    BreakStepType[BreakStepType["Non"] = 0] = "Non";
    BreakStepType[BreakStepType["NextSticky"] = 1] = "NextSticky";
    BreakStepType[BreakStepType["StepOver"] = 2] = "StepOver";
    BreakStepType[BreakStepType["StepOut"] = 3] = "StepOut";
})(BreakStepType || (BreakStepType = {}));
var FingerType;
(function (FingerType) {
    FingerType[FingerType["Entry"] = 0] = "Entry";
    FingerType[FingerType["Exit"] = 1] = "Exit";
})(FingerType || (FingerType = {}));
class TyroUtil {
    static throwsMessage(err) {
        return '[Throws: ' + (err ? err.message : '?') + ']';
    }
    static safeGetValueFromPropertyOnObject(obj, property) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
            try {
                return obj[property];
            }
            catch (err) {
                return TyroUtil.throwsMessage(err);
            }
        }
        return obj[property];
    }
    static ensureProperties(obj) {
        const seen = [];
        function visit(obj) {
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }
            if (seen.indexOf(obj) !== -1) {
                return '[Circular]';
            }
            seen.push(obj);
            if (typeof obj.toJSON === 'function') {
                try {
                    var fResult = visit(obj.toJSON());
                    seen.pop();
                    return fResult;
                }
                catch (err) {
                    return TyroUtil.throwsMessage(err);
                }
            }
            if (Array.isArray(obj)) {
                var aResult = obj.map(visit);
                seen.pop();
                return aResult;
            }
            let result = Object.keys(obj).reduce(function (result, prop) {
                result[prop] = visit(TyroUtil.safeGetValueFromPropertyOnObject(obj, prop));
                return result;
            }, {});
            seen.pop();
            return result;
        }
        ;
        return visit(obj);
    }
    static safeJSONStringify(data, replacer, space) {
        return JSON.stringify(TyroUtil.ensureProperties(data), replacer, space);
    }
    static isWebIDE() {
        if (typeof navigator !== 'undefined' && navigator) {
            const ua = navigator.swuserAgent || navigator.userAgent || '';
            return ua.indexOf('AlipayIDE') > -1;
        }
        return false;
    }
    constructor() { }
}
class StickyFinger {
    constructor(globalExecutionContext, host, instrumentId, rawContextJSON) {
        this.isWebIDE = false;
        this.asyncRequestMethod = 'tyroRequest';
        this.host = host;
        this.contextMap = {};
        this.contextUrlMap = {};
        this.breakpointMap = {};
        this.breakpointIdMap = {};
        this.debuggerMap = {};
        this.objectMap = {};
        this.originConsoleAPI = {};
        this.requestTaskId = 0;
        this.stickyMsgQueue = [];
        this.wsMsgQueue = [];
        this.wsIsOpen = false;
        this.instrumentId = instrumentId;
        this.stickyFlag = rawContextJSON.stickyFlag;
        this.fingerFlag = rawContextJSON.fingerFlag;
        this.hookConsole();
        if (this.stickyFlag) {
            setTimeout(() => {
                this.socketTask = my.connectSocket({
                    url: `wss://hpmweb.alipay.com/tyro/agent/${this.instrumentId}`,
                    multiple: true,
                });
                this.socketTask.onOpen((res) => {
                    this.originConsoleAPI.log(`[tyro-agent] WebSocket 连接成功`);
                    this.wsIsOpen = true;
                    this.socketTaskId = res.data.socketTaskId;
                    for (const msg of this.wsMsgQueue) {
                        this.socketTask.send({
                            data: msg,
                        });
                    }
                });
                this.socketTask.onClose(() => {
                    this.originConsoleAPI.log(`[tyro-agent] WebSocket 连接已关闭`);
                });
                this.socketTask.onMessage((res) => {
                    this.handleStickyAsync(JSON.parse(res.data.data));
                });
            }, 1200);
            this.breakpointsActive = true;
            this.skipAllPauses = false;
            this.breakStepType = BreakStepType.Non;
            this.stackDepth = 0;
            this.pauseOnExceptions = 'none';
            this.asyncCallStackDepth = 0;
            this.lastStickyAsyncError = 0;
            this.generateObjectId = 0;
            this.globalExecutionContext = globalExecutionContext;
            this.evaluateOnCallFrameExpression = '';
            this.stickyNotSendPaused = false;
            this.sendStickyParams = false;
        }
        if (this.fingerFlag) {
            this.fingerId = 0;
            this.fingerCache = [];
            this.fingerSendInterval = 1000;
            this.jsapiCallId = 0;
            setInterval(() => {
                if (this.fingerCache.length === 0) {
                    return;
                }
                this.sendPerf('Perf.trace', this.fingerCache);
                this.fingerCache = [];
            }, this.fingerSendInterval);
            this.wrapJSAPI();
        }
        this.isWebIDE = TyroUtil.isWebIDE();
        if (this.isWebIDE) {
            this.asyncRequestMethod = 'tyroRequestAsync';
        }
    }
    static rewritePath(rawPath) {
        let path = rawPath;
        if (path[0] === '.') {
            path = path.replace('.', '');
        }
        path = path.replace('tmp/data/build/', '');
        path = 'app://' + path;
        return path;
    }
    static processRawContext(rawContextJSON) {
        const context = {
            path: this.rewritePath(rawContextJSON.path),
            contextId: String(rawContextJSON.contextId),
            scope: {
                "0": [],
            },
            function: {},
            debuggerLine: rawContextJSON.debuggerLine,
            stickyLine: rawContextJSON.stickyLine,
        };
        if (rawContextJSON.scope) {
            Object.keys(rawContextJSON.scope).map(uid => {
                const bindings = rawContextJSON.scope[uid];
                const parentUid = bindings.shift();
                const parentBindings = context.scope[parentUid];
                if (parentBindings) {
                    context.scope[uid] = parentBindings.concat(bindings.filter(variable => {
                        return parentBindings.indexOf(variable) < 0;
                    }));
                }
                else {
                    context.scope[uid] = bindings;
                }
            });
        }
        if (rawContextJSON.function) {
            Object.keys(rawContextJSON.function).map(uid => {
                const items = rawContextJSON.function[uid];
                context.function[uid] = {
                    name: items[0],
                    line: items[1],
                };
            });
        }
        return context;
    }
    register(rawContextJSON, sourceCode) {
        const contextId = String(rawContextJSON.contextId);
        const path = StickyFinger.rewritePath(rawContextJSON.path);
        this.originConsoleAPI.log(`[tyro-agent] register contextId ${contextId} path ${path}`);
        if (this.contextMap[contextId] || this.breakpointMap[contextId]) {
            this.originConsoleAPI.warn(`[tyro-agent] duplicate context register ${contextId} ${path}`);
            return;
        }
        this.contextMap[contextId] = StickyFinger.processRawContext(rawContextJSON);
        this.contextUrlMap[path] = contextId;
        this.breakpointMap[contextId] = {};
        this.debuggerMap[contextId] = this.contextMap[contextId].debuggerLine.reduce((ob, line) => (ob[line - 1] = true, ob), {});
        if (this.stickyFlag) {
            this.xhrSend(ResponseEvent.ScriptSource, {
                scriptSource: sourceCode,
                scriptId: String(contextId),
                executionContextId: 0,
                url: path,
            });
        }
    }
    sticky(contextId, line, scopeUid) {
        if (this.skipAllPauses) {
            return;
        }
        if (!this.breakpointsActive) {
            return;
        }
        if (this.debuggerMap[contextId][line]
            || this.breakpointMap[contextId][line]
            || this.breakStepType === BreakStepType.NextSticky
            || (this.breakStepType === BreakStepType.StepOver && new Error().stack.split('\n').length <= this.stackDepth)
            || (this.breakStepType === BreakStepType.StepOut && new Error().stack.split('\n').length < this.stackDepth)
            || (this.sendStickyParams === true)) {
            this.originConsoleAPI.log(`[tyro-agent] sticky ${contextId} ${line}`);
            this.breakStepType = BreakStepType.Non;
            let params = {};
            if (this.stickyNotSendPaused) {
                this.originConsoleAPI.log(`[tyro-agent] stickyNotSendPaused`);
            }
            else if (!this.sendStickyParams) {
                this.originConsoleAPI.log(`[tyro-agent] sticky sendStickyParams step 1`);
                params = {
                    callFrames: null,
                    reason: 'other',
                    hitBreakpoints: [],
                };
                const breakpointId = this.breakpointMap[contextId][line];
                if (breakpointId) {
                    params.hitBreakpoints.push(breakpointId);
                }
                const stacktrace = new Error().stack;
                const splits = stacktrace.split('\n');
                this.stackDepth = splits.length;
                if (Agent.isPhone) {
                    params.callFrames = this.processCallFramesPhone(String(contextId), line, scopeUid, splits);
                }
                else {
                    params.callFrames = this.processCallFrames(String(contextId), line, scopeUid, splits);
                }
                this.stickyParams = params;
                this.sendStickyParams = true;
                return `(() => {
          const localObject = {};
          for (const key of Agent.getScopeVariables()) {
            localObject[key] = (() => {try{return eval(key)}catch(e){return undefined}})();
          }
          Agent.inflateStickyParamsObject(localObject);
          return true;
        })()`;
            }
            else {
                this.originConsoleAPI.log(`[tyro-agent] sticky sendStickyParams step 2`);
                params = this.stickyParams;
                this.sendStickyParams = false;
            }
            this.originConsoleAPI.log(`[tyro-agent] sticky params ${TyroUtil.safeJSONStringify(params)}`);
            const stickyResponse = JSON.parse(this.xhrSend(ResponseEvent.Sticky, params));
            return this.handleSticky(stickyResponse);
        }
    }
    fingerEntry(contextId, scopeUid) {
        const path = this.contextMap[contextId].path;
        const functionDetail = this.contextMap[contextId].function[scopeUid];
        const fingerId = this.generateFingerId();
        const trace = {
            time: Date.now(),
            file: path,
            line: functionDetail.line,
            name: functionDetail.name,
            id: fingerId,
            type: FingerType.Entry,
        };
        this.fingerCache.push(trace);
        return fingerId;
    }
    fingerExit(contextId, scopeUid, fingerId) {
        const path = this.contextMap[contextId].path;
        const functionDetail = this.contextMap[contextId].function[scopeUid];
        const trace = {
            time: Date.now(),
            file: path,
            line: functionDetail.line,
            name: functionDetail.name,
            id: fingerId,
            type: FingerType.Exit,
        };
        this.fingerCache.push(trace);
    }
    sendPerf(method, params) {
        if (self.bugmeAPI) {
            self.bugmeAPI.send({
                method,
                params,
            });
        }
        else {
            if (self.document) {
                self.document.addEventListener('bugmeInjected', () => {
                    self.bugmeAPI.send({
                        method,
                        params,
                    });
                });
            }
            else if (self.addEventListener) {
                self.addEventListener('bugmeInjected', () => {
                    self.bugmeAPI.send({
                        method,
                        params,
                    });
                });
            }
        }
    }
    wrapJSAPI() {
        const startTime = Date.now();
        const keys = Object.keys(my);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = my[key];
            if (typeof value !== 'function' || key.indexOf('Socket') !== -1) {
                continue;
            }
            try {
                my[key] = (...args) => {
                    if (key.indexOf('Sync') === -1 && args.length > 0 && typeof args[0] === 'object') {
                        this.jsapiCallId += 1;
                        const saveCallId = this.jsapiCallId;
                        this.sendPerf('Perf.jsapi', {
                            name: key,
                            reqId: saveCallId,
                            time: Date.now(),
                            type: 0,
                        });
                        if (typeof args[0].success === 'function') {
                            const originSuccess = args[0].success;
                            args[0].success = (res) => {
                                this.sendPerf('Perf.jsapi', {
                                    name: key,
                                    reqId: saveCallId,
                                    time: Date.now(),
                                    type: 1,
                                });
                                originSuccess(res);
                            };
                        }
                        else {
                            args[0].success = () => {
                                this.sendPerf('Perf.jsapi', {
                                    name: key,
                                    reqId: saveCallId,
                                    time: Date.now(),
                                    type: 1,
                                });
                            };
                        }
                        if (typeof args[0].fail === 'function') {
                            const originFail = args[0].fail;
                            args[0].fail = (res) => {
                                this.sendPerf('Perf.jsapi', {
                                    name: key,
                                    reqId: saveCallId,
                                    time: Date.now(),
                                    type: 1,
                                });
                                originFail(res);
                            };
                        }
                        else {
                            args[0].fail = () => {
                                this.sendPerf('Perf.jsapi', {
                                    name: key,
                                    reqId: saveCallId,
                                    time: Date.now(),
                                    type: 1,
                                });
                            };
                        }
                    }
                    else if (key.indexOf('Sync') !== -1) {
                        this.jsapiCallId += 1;
                        const saveCallId = this.jsapiCallId;
                        this.sendPerf('Perf.jsapi', {
                            name: key,
                            reqId: saveCallId,
                            time: Date.now(),
                            type: 0,
                        });
                        let ret;
                        if (args.length === 0) {
                            ret = value();
                        }
                        else if (args.length === 1) {
                            ret = value(args[0]);
                        }
                        else if (args.length === 2) {
                            ret = value(args[0], args[1]);
                        }
                        else if (args.length === 3) {
                            ret = value(args[0], args[1], args[2]);
                        }
                        else if (args.length === 4) {
                            ret = value(args[0], args[1], args[2], args[3]);
                        }
                        this.sendPerf('Perf.jsapi', {
                            name: key,
                            reqId: saveCallId,
                            time: Date.now(),
                            type: 1,
                        });
                        return ret;
                    }
                    if (args.length === 0) {
                        return value();
                    }
                    else if (args.length === 1) {
                        return value(args[0]);
                    }
                    else if (args.length === 2) {
                        return value(args[0], args[1]);
                    }
                    else if (args.length === 3) {
                        return value(args[0], args[1], args[2]);
                    }
                    else if (args.length === 4) {
                        return value(args[0], args[1], args[2], args[3]);
                    }
                };
            }
            catch (e) {
                this.originConsoleAPI.log(`[tyro-agent] wrapJSAPI fail ${key}, ${e}`);
            }
        }
        const endTime = Date.now();
        this.originConsoleAPI.log(`[tyro-agent] wrapJSAPI cost ${endTime - startTime}`);
    }
    hookJSAPIcall() {
        let originOnApiCall = null;
        let originOnApiSyncCall = null;
        let originOnApiCallback = null;
        let originOnApiSyncCallback = null;
        if (self.__APPX_DEVTOOLS_GLOBAL_HOOK__) {
            originOnApiCall = typeof self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiCall === 'function' ? self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiCall : null;
            originOnApiSyncCall = typeof self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiSyncCall === 'function' ? self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiSyncCall : null;
            originOnApiCallback = typeof self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiCallback === 'function' ? self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiCallback : null;
            originOnApiSyncCallback = typeof self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiSyncCallback === 'function' ? self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiSyncCallback : null;
        }
        else {
            self.__APPX_DEVTOOLS_GLOBAL_HOOK__ = {};
        }
        self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiCall = (info) => {
            if (originOnApiCall !== null) {
                originOnApiCall(info);
            }
            this.sendPerf('Perf.jsapi', {
                name: info.name,
                reqId: info.reqId,
                time: Date.now(),
                type: 0,
            });
        };
        self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiSyncCall = (info) => {
            if (originOnApiSyncCall !== null) {
                originOnApiSyncCall(info);
            }
            this.sendPerf('Perf.jsapi', {
                name: info.name,
                reqId: info.reqId,
                time: Date.now(),
                type: 0,
            });
        };
        self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiCallback = (info) => {
            if (originOnApiCallback !== null) {
                originOnApiCallback(info);
            }
            this.sendPerf('Perf.jsapi', {
                name: info.name,
                reqId: info.reqId,
                time: Date.now(),
                type: 1,
            });
        };
        self.__APPX_DEVTOOLS_GLOBAL_HOOK__.onApiSyncCallback = (info) => {
            if (originOnApiSyncCallback !== null) {
                originOnApiSyncCallback(info);
            }
            this.sendPerf('Perf.jsapi', {
                name: info.name,
                reqId: info.reqId,
                time: Date.now(),
                type: 1,
            });
        };
    }
    hookConsole() {
        this.originConsoleAPI.log = console.log.bind(console);
        this.originConsoleAPI.debug = console.debug.bind(console);
        this.originConsoleAPI.info = console.info.bind(console);
        this.originConsoleAPI.error = console.error.bind(console);
        this.originConsoleAPI.warn = console.warn.bind(console);
        console.log = (...args) => {
            this.originConsoleAPI.log(...args);
            if (args.length > 0 && typeof args[0] === 'string'
                && (args[0].indexOf('[framework]') >= 0
                    || args[0].indexOf('dispatchEvent') >= 0
                    || args[0].indexOf('onMessage push') >= 0)) {
                return;
            }
            const params = {
                type: 'log',
                args: args.map(v => this.objectToRemoteObject(v, null, typeof v === 'object')),
                executionContextId: 0,
                timestamp: new Date().getTime(),
            };
            this.xhrSend(ResponseEvent.ConsoleAPICalled, params, null, false);
        };
        console.debug = (...args) => {
            this.originConsoleAPI.debug(...args);
            if (args.length > 0 && typeof args[0] === 'string'
                && (args[0].indexOf('[framework]') >= 0
                    || args[0].indexOf('dispatchEvent') >= 0
                    || args[0].indexOf('onMessage push') >= 0)) {
                return;
            }
            const params = {
                type: 'debug',
                args: args.map(v => this.objectToRemoteObject(v, null, typeof v === 'object')),
                executionContextId: 0,
                timestamp: new Date().getTime(),
            };
            this.xhrSend(ResponseEvent.ConsoleAPICalled, params, null, false);
        };
        console.info = (...args) => {
            this.originConsoleAPI.info(...args);
            if (args.length > 0 && typeof args[0] === 'string'
                && (args[0].indexOf('[framework]') >= 0
                    || args[0].indexOf('dispatchEvent') >= 0
                    || args[0].indexOf('onMessage push') >= 0)) {
                return;
            }
            const params = {
                type: 'info',
                args: args.map(v => this.objectToRemoteObject(v, null, typeof v === 'object')),
                executionContextId: 0,
                timestamp: new Date().getTime(),
            };
            this.xhrSend(ResponseEvent.ConsoleAPICalled, params, null, false);
        };
        console.error = (...args) => {
            this.originConsoleAPI.error(...args);
            if (args.length > 0 && typeof args[0] === 'string'
                && (args[0].indexOf('[framework]') >= 0
                    || args[0].indexOf('dispatchEvent') >= 0
                    || args[0].indexOf('onMessage push') >= 0)) {
                return;
            }
            const params = {
                type: 'error',
                args: args.map(v => this.objectToRemoteObject(v, null, typeof v === 'object')),
                executionContextId: 0,
                timestamp: new Date().getTime(),
            };
            this.xhrSend(ResponseEvent.ConsoleAPICalled, params, null, false);
        };
        console.warn = (...args) => {
            this.originConsoleAPI.warn(...args);
            if (args.length > 0 && typeof args[0] === 'string'
                && (args[0].indexOf('[framework]') >= 0
                    || args[0].indexOf('dispatchEvent') >= 0
                    || args[0].indexOf('onMessage push') >= 0)) {
                return;
            }
            const params = {
                type: 'warning',
                args: args.map(v => this.objectToRemoteObject(v, null, typeof v === 'object')),
                executionContextId: 0,
                timestamp: new Date().getTime(),
            };
            this.xhrSend(ResponseEvent.ConsoleAPICalled, params, null, false);
        };
    }
    inflateStickyParamsObject(inflateObject) {
        if (this.stickyParams.callFrames.length === 0) {
            return;
        }
        this.generateObjectId += 1;
        const objectId = String(this.generateObjectId);
        this.objectMap[objectId] = inflateObject;
        this.stickyParams.callFrames[0].scopeChain.push({
            type: 'local',
            name: this.stickyParams.callFrames[0].functionName,
            object: {
                className: "Object",
                description: "Object",
                objectId,
                type: "object",
            }
        });
    }
    processCallFrames(contextId, line, scopeUid, stacktrace) {
        const callFrames = [];
        const realStacktrace = stacktrace.slice(3, stacktrace.length).map(v => {
            return v.substr(0, v.lastIndexOf(':')).replace('    at ', '').replace(' (', ':');
        });
        let idCount = 0;
        let scopeVariablesOnlyLocal = true;
        realStacktrace.map(stacktrace => {
            const latestFrameSplits = stacktrace.split(':');
            const functionName = latestFrameSplits[0];
            const url = this.contextMap[contextId].path;
            const lineNumber = Number(latestFrameSplits[latestFrameSplits.length - 1]);
            const scriptId = this.contextUrlMap[url] || 'none';
            const callFrameId = `${idCount}:${lineNumber}:${url}`;
            const scopeChain = [];
            if (scopeVariablesOnlyLocal) {
                this.scopeVariables = (this.contextMap[contextId] !== undefined ? this.contextMap[contextId].scope[scopeUid] : []);
                scopeVariablesOnlyLocal = false;
            }
            const callFrame = {
                callFrameId,
                functionName,
                location: {
                    scriptId,
                    lineNumber,
                    columnNumber: 0,
                },
                url,
                scopeChain,
                this: {}
            };
            callFrames.push(callFrame);
            idCount += 1;
        });
        return callFrames;
    }
    processCallFramesPhone(contextId, line, scopeUid, stacktrace) {
        const callFrames = [];
        const realStacktrace = stacktrace.slice(2, stacktrace.length).map(v => {
            return v.substr(0, v.lastIndexOf(':')).replace('    at ', '').replace(' (', ':').replace('@', ':');
        });
        let idCount = 0;
        let scopeVariablesOnlyLocal = true;
        realStacktrace.map(stacktrace => {
            const latestFrameSplits = stacktrace.split(':');
            const functionName = latestFrameSplits[0];
            const url = this.contextMap[contextId].path;
            const lineNumber = Number(latestFrameSplits[latestFrameSplits.length - 1]);
            const scriptId = this.contextUrlMap[url] || 'none';
            const callFrameId = `${idCount}:${lineNumber}:${url}`;
            const scopeChain = [];
            if (scopeVariablesOnlyLocal) {
                this.scopeVariables = (this.contextMap[contextId] !== undefined ? this.contextMap[contextId].scope[scopeUid] : []);
                this.originConsoleAPI.log(`scopeVariables ${TyroUtil.safeJSONStringify(this.scopeVariables)}`);
                this.originConsoleAPI.log(`scopeVariables ${TyroUtil.safeJSONStringify(this.contextMap[contextId])} ${this.contextMap[contextId].scope} ${scopeUid}`);
                scopeVariablesOnlyLocal = false;
            }
            const callFrame = {
                callFrameId,
                functionName,
                location: {
                    scriptId,
                    lineNumber: line,
                    columnNumber: 0,
                },
                url,
                scopeChain,
                this: {}
            };
            callFrames.push(callFrame);
            idCount += 1;
        });
        return callFrames;
    }
    stickyAsyncLoop() {
        this.xhrSend(ResponseEvent.StickyAsync, {});
    }
    xhrSendJSAPI(event, params, id, stickyQueue) {
        if (event === ResponseEvent.Sticky) {
            let msg;
            if (this.stickyMsgQueue.length > 0) {
                this.stickyMsgQueue.push({
                    method: this.stickyNotSendPaused ? ResponseEvent.StickyNotSendPaused : ResponseEvent.Sticky,
                    params: params
                });
                msg = TyroUtil.safeJSONStringify(this.stickyMsgQueue);
                this.stickyMsgQueue = [];
            }
            else {
                msg = TyroUtil.safeJSONStringify({
                    method: this.stickyNotSendPaused ? ResponseEvent.StickyNotSendPaused : ResponseEvent.Sticky,
                    params: params
                });
            }
            my.call('showRemoteDebugMask', {
                text: ' ',
                buttonTitle: '断点命中',
                hide: false,
            });
            this.stickyNotSendPaused = false;
            const startTyroRequestTime = Date.now();
            const result = my.callSync('tyroRequest', {
                url: this.host + '/tyro/agent',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'instrument-id': this.instrumentId,
                },
                data: msg,
                timeout: 600000,
                blockTimeout: 600000,
                dataType: 'json',
                requestTaskId: this.requestTaskId++,
            });
            my.call('showRemoteDebugMask', {
                hide: true,
            });
            if (result.error || result === null) {
                if (result === null) {
                    this.originConsoleAPI.error(`[tyro-agent] xhrSend error result is ${result}`);
                }
                else {
                    this.originConsoleAPI.error(`[tyro-agent] xhrSend error ${result.error} ${result.errorMessage}`);
                }
                if (Date.now() - startTyroRequestTime >= 5000) {
                    return this.xhrSendJSAPI(event, params, id, stickyQueue);
                }
                else {
                    return TyroUtil.safeJSONStringify({
                        method: 'default',
                    });
                }
            }
            else if (result.status !== 200) {
                this.originConsoleAPI.error(`[tyro-agent] xhrSend status fail ${event} ${result.status}`);
                return TyroUtil.safeJSONStringify({
                    method: 'default',
                });
            }
            else {
                return result.data;
            }
        }
        if (event === ResponseEvent.StickyAsync) {
            const msg = TyroUtil.safeJSONStringify({
                method: ResponseEvent.StickyAsync,
                params: params
            });
            this.originConsoleAPI.info(`[tyro-agent] xhrSend async send ${msg}`);
            my.call(this.asyncRequestMethod, {
                url: this.host + '/tyro/agent',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'instrument-id': this.instrumentId,
                },
                data: msg,
                timeout: 600000,
                dataType: 'json',
                requestTaskId: this.requestTaskId++,
                success: (res) => {
                    this.lastStickyAsyncError = 0;
                    this.stickyAsyncLoop();
                    if (res.status === 200) {
                        this.originConsoleAPI.info(`[tyro-agent] xhrSend async success ${res.status} ${res.data}`);
                        this.handleStickyAsync(JSON.parse(res.data));
                    }
                    else {
                        this.originConsoleAPI.error(`[tyro-agent] xhrSend async fail ${res.status} ${res.data}`);
                    }
                },
                fail: (err) => {
                    if (this.lastStickyAsyncError >= 3) {
                        setTimeout(() => {
                            this.stickyAsyncLoop();
                        }, 3000);
                    }
                    else {
                        this.lastStickyAsyncError += 1;
                        this.stickyAsyncLoop();
                    }
                    this.originConsoleAPI.error(`[tyro-agent] xhrSend async error ${TyroUtil.safeJSONStringify(err)}`);
                },
            });
        }
        let msg;
        switch (event) {
            case ResponseEvent.ById: {
                msg = {
                    id,
                    result: params,
                };
                break;
            }
            case ResponseEvent.ScriptSource: {
                msg = {
                    method: ResponseEvent.ScriptSource,
                    params: params,
                };
                break;
            }
            case ResponseEvent.Resumed: {
                msg = {
                    method: ResponseEvent.Resumed,
                    params: params,
                };
                break;
            }
            case ResponseEvent.ConsoleAPICalled: {
                msg = {
                    method: ResponseEvent.ConsoleAPICalled,
                    params: params,
                };
                break;
            }
            default: return;
        }
        if (stickyQueue) {
            this.stickyMsgQueue.push(msg);
            return;
        }
        if (this.wsIsOpen) {
            this.socketTask.send({
                data: TyroUtil.safeJSONStringify(msg),
            });
        }
        else {
            this.wsMsgQueue.push(TyroUtil.safeJSONStringify(msg));
        }
    }
    xhrSend(event, params, id, stickyQueue) {
        if (Agent.isPhone) {
            return this.xhrSendJSAPI(event, params, id, stickyQueue);
        }
        const xhr = new XMLHttpRequest();
        if (event === ResponseEvent.Sticky) {
            xhr.open('POST', this.host + '/tyro/agent', false);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.setRequestHeader('instrument-id', this.instrumentId);
            let msg;
            if (this.stickyMsgQueue.length > 0) {
                this.stickyMsgQueue.push({
                    method: this.stickyNotSendPaused ? ResponseEvent.StickyNotSendPaused : ResponseEvent.Sticky,
                    params: params
                });
                try {
                    msg = TyroUtil.safeJSONStringify(this.stickyMsgQueue);
                }
                catch (e) {
                    this.originConsoleAPI.error(e);
                    msg = TyroUtil.safeJSONStringify({
                        method: this.stickyNotSendPaused ? ResponseEvent.StickyNotSendPaused : ResponseEvent.Sticky,
                        params: params
                    });
                }
                finally {
                    this.stickyMsgQueue = [];
                }
            }
            else {
                msg = TyroUtil.safeJSONStringify({
                    method: this.stickyNotSendPaused ? ResponseEvent.StickyNotSendPaused : ResponseEvent.Sticky,
                    params: params
                });
            }
            this.stickyNotSendPaused = false;
            xhr.send(msg);
            if (xhr.status === 200) {
                return xhr.responseText;
            }
            else {
                throw new Error(`[sticky-finger] xhrSend error ${event} ${xhr.status}`);
            }
        }
        if (event === ResponseEvent.StickyAsync) {
            xhr.open('POST', this.host + '/tyro/agent', true);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.setRequestHeader('instrument-id', this.instrumentId);
            xhr.onload = () => {
                this.lastStickyAsyncError = 0;
                this.stickyAsyncLoop();
                if (xhr.readyState === 4 && xhr.status === 200) {
                    this.handleStickyAsync(JSON.parse(xhr.responseText));
                }
                else {
                    throw new Error(`[tyro-agent] xhrSend async fail ${event} ${xhr.readyState} ${xhr.status}`);
                }
            };
            xhr.onerror = () => {
                if (this.lastStickyAsyncError >= 3) {
                    setTimeout(() => {
                        this.stickyAsyncLoop();
                    }, 3000);
                }
                else {
                    this.lastStickyAsyncError += 1;
                    this.stickyAsyncLoop();
                }
                throw new Error(`[tyro-agent] xhrSend async error ${event} ${xhr.readyState} ${xhr.status}`);
            };
            xhr.send(TyroUtil.safeJSONStringify({
                method: ResponseEvent.StickyAsync,
                params: params
            }));
            return;
        }
        xhr.open('POST', this.host + '/tyro/agent', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.setRequestHeader('instrument-id', this.instrumentId);
        xhr.onload = () => {
            if (xhr.readyState !== 4 || xhr.status !== 200) {
                throw new Error(`[tyro-agent] xhrSend async fail ${event} ${xhr.readyState} ${xhr.status}`);
            }
        };
        xhr.onerror = () => {
            throw new Error(`[tyro-agent] xhrSend async error ${event} ${xhr.readyState} ${xhr.status}`);
        };
        let msg;
        switch (event) {
            case ResponseEvent.ById: {
                msg = {
                    id,
                    result: params,
                };
                break;
            }
            case ResponseEvent.ScriptSource: {
                msg = {
                    method: ResponseEvent.ScriptSource,
                    params: params,
                };
                break;
            }
            case ResponseEvent.Resumed: {
                msg = {
                    method: ResponseEvent.Resumed,
                    params: params,
                };
                break;
            }
            case ResponseEvent.ConsoleAPICalled: {
                msg = {
                    method: ResponseEvent.ConsoleAPICalled,
                    params: params,
                };
                break;
            }
            default: return;
        }
        if (stickyQueue) {
            this.stickyMsgQueue.push(msg);
        }
        else {
            xhr.send(TyroUtil.safeJSONStringify(msg));
        }
    }
    handleSticky(stickyResponse) {
        const id = stickyResponse.id;
        const method = stickyResponse.method;
        const params = stickyResponse.params;
        switch (method) {
            case RequestMethod.DiscardConsoleEntries: {
                this.stickyNotSendPaused = true;
                this.originConsoleAPI.log(`[tyro-agent] DiscardConsoleEntries success`);
                return '(()=>{return true})()';
            }
            case RequestMethod.CallFunctionOn: {
                this.stickyNotSendPaused = true;
                this.originConsoleAPI.log(`[tyro-agent] CallFunctionOn TODO sticky`);
                return '(()=>{return true})()';
            }
            case RequestMethod.CompileScript: {
                this.stickyNotSendPaused = true;
                this.originConsoleAPI.log(`[tyro-agent] CompileScript success, ${TyroUtil.safeJSONStringify(params)}`);
                return '(()=>{return true})()';
            }
            case RequestMethod.SetBreakpointsActive: {
                this.stickyNotSendPaused = true;
                this.breakpointsActive = params.active;
                this.originConsoleAPI.log(`[tyro-agent] SetBreakpointsActive success, breakpointsActive ${this.breakpointsActive}`);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            case RequestMethod.SetSkipAllPauses: {
                this.stickyNotSendPaused = true;
                this.skipAllPauses = params.skip;
                this.originConsoleAPI.log(`[tyro-agent] SetSkipAllPauses success, skipAllPauses ${this.skipAllPauses}`);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            case RequestMethod.Resume: {
                this.xhrSend(ResponseEvent.Resumed, {});
                this.originConsoleAPI.log(`[tyro-agent] Resume success`);
                return '(()=>{return false})()';
            }
            case RequestMethod.StepInto: {
                this.xhrSend(ResponseEvent.Resumed, {});
                this.breakStepType = BreakStepType.NextSticky;
                this.originConsoleAPI.log(`[tyro-agent] StepInto success`);
                return '(()=>{return false})()';
            }
            case RequestMethod.StepOver: {
                this.xhrSend(ResponseEvent.Resumed, {});
                this.breakStepType = BreakStepType.StepOver;
                this.originConsoleAPI.log(`[tyro-agent] StepOver success`);
                return '(()=>{return false})()';
            }
            case RequestMethod.StepOut: {
                this.xhrSend(ResponseEvent.Resumed, {});
                this.breakStepType = BreakStepType.StepOut;
                this.originConsoleAPI.log(`[tyro-agent] StepOut success`);
                return '(()=>{return false})()';
            }
            case RequestMethod.GetPossibleBreakpoints: {
                this.stickyNotSendPaused = true;
                this.getPossibleBreakpoints(id, params, true);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            case RequestMethod.SetBreakpointByUrl: {
                this.stickyNotSendPaused = true;
                this.setBreakpointByUrl(id, params, true);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            case RequestMethod.SetBreakpoint: {
                this.stickyNotSendPaused = true;
                this.setBreakpoint(id, params, true);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            case RequestMethod.RemoveBreakpoint: {
                this.stickyNotSendPaused = true;
                this.removeBreakpoint(id, params);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            case RequestMethod.REPL: {
                this.stickyNotSendPaused = true;
                this.breakStepType = BreakStepType.NextSticky;
                return `(()=>{(()=>{${params.statement}})();return true})()`;
            }
            case RequestMethod.GetVariableValue: {
                this.stickyNotSendPaused = true;
                const params = stickyResponse.params;
                this.breakStepType = BreakStepType.NextSticky;
                const variableValueBody = params.map(v => {
                    return `${v}: (() => {try{return ${v}}catch(e){return undefined}})()`;
                }).join(',');
                return `(()=>{(()=>{
          Agent.variableValue({${variableValueBody}})
        })();return true})()`;
            }
            case RequestMethod.SetPauseOnExceptions: {
                this.stickyNotSendPaused = true;
                this.setPauseOnExceptions(id, params);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            case RequestMethod.SetAsyncCallStackDepth: {
                this.stickyNotSendPaused = true;
                this.setAsyncCallStackDepth(id, params);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            case RequestMethod.EvaluateOnCallFrame: {
                this.stickyNotSendPaused = true;
                this.evaluateOnCallFrameExpression = params.expression;
                this.breakStepType = BreakStepType.NextSticky;
                return `(()=>{
          let tyroRet,tyroErr;
          try{tyroRet=eval(Agent.getEvaluateOnCallFrameExpression())}
          catch(e){tyroErr=e}
          Agent.evaluateOnCallFrame(${id},tyroRet,tyroErr,${params.generatePreview});
          return true;
        })()`;
            }
            case RequestMethod.GetProperties: {
                this.stickyNotSendPaused = true;
                this.getProperties(id, params, true);
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
            default: {
                this.breakStepType = BreakStepType.NextSticky;
                return '(()=>{return true})()';
            }
        }
    }
    handleStickyAsync(stickyResponse) {
        const id = stickyResponse.id;
        const method = stickyResponse.method;
        const params = stickyResponse.params;
        this.originConsoleAPI.log(`[tyro-agent] handleStickyAsync ${id}, ${method}, ${params}`);
        switch (method) {
            case RequestMethod.DiscardConsoleEntries: {
                this.originConsoleAPI.log(`[tyro-agent] DiscardConsoleEntries success`);
                break;
            }
            case RequestMethod.Evaluate: {
                this.originConsoleAPI.log(`[tyro-agent] Evaluate start, expression ${params.expression}`);
                const result = this.evaluate(this.globalExecutionContext, id, params);
                this.originConsoleAPI.log(`[tyro-agent] Evaluate success, expression ${params.expression}, result ${TyroUtil.safeJSONStringify(result)}`);
                break;
            }
            case RequestMethod.CallFunctionOn: {
                this.originConsoleAPI.log(`[tyro-agent] CallFunctionOn TODO stickyAsync`);
                break;
            }
            case RequestMethod.CompileScript: {
                this.originConsoleAPI.log(`[tyro-agent] CompileScript success, params ${TyroUtil.safeJSONStringify(params)}`);
                break;
            }
            case RequestMethod.SetBreakpointsActive: {
                this.breakpointsActive = params.active;
                this.originConsoleAPI.log(`[tyro-agent] SetBreakpointsActive success, breakpointsActive ${this.breakpointsActive}`);
                break;
            }
            case RequestMethod.SetSkipAllPauses: {
                this.skipAllPauses = params.skip;
                this.originConsoleAPI.log(`[tyro-agent] SetSkipAllPauses success, skipAllPauses ${this.skipAllPauses}`);
                break;
            }
            case RequestMethod.Pause: {
                this.breakStepType = BreakStepType.NextSticky;
                this.originConsoleAPI.log(`[tyro-agent] Pause success`);
                break;
            }
            case RequestMethod.GetPossibleBreakpoints: {
                this.getPossibleBreakpoints(id, params);
                break;
            }
            case RequestMethod.SetBreakpointByUrl: {
                this.setBreakpointByUrl(id, params);
                break;
            }
            case RequestMethod.SetBreakpoint: {
                this.setBreakpoint(id, params);
                break;
            }
            case RequestMethod.RemoveBreakpoint: {
                this.removeBreakpoint(id, params);
                break;
            }
            case RequestMethod.SetPauseOnExceptions: {
                this.setPauseOnExceptions(id, params);
                break;
            }
            case RequestMethod.SetAsyncCallStackDepth: {
                this.setAsyncCallStackDepth(id, params);
                break;
            }
            case RequestMethod.GetProperties: {
                this.getProperties(id, params);
                break;
            }
        }
    }
    objectToRemoteObject(object, error, generatePreview) {
        const result = {};
        if (object instanceof Error) {
            error = object;
        }
        if (error) {
            result.type = 'object';
            result.subtype = 'error';
            result.className = error.name;
            result.description = error.toString();
        }
        else {
            result.type = typeof object;
            switch (result.type) {
                case 'undefined': break;
                case 'object': {
                    if (object === null) {
                        result.subtype = 'null';
                        result.value = null;
                        break;
                    }
                    if (object.constructor !== undefined) {
                        result.className = object.constructor.name;
                    }
                    if (object.toString !== undefined) {
                        try {
                            result.description = object.toString();
                        }
                        catch (e) {
                            result.description = '[object Object]';
                        }
                    }
                    else {
                        result.description = '[object Object]';
                    }
                    this.generateObjectId += 1;
                    result.objectId = String(this.generateObjectId);
                    this.objectMap[String(this.generateObjectId)] = object;
                    if (generatePreview) {
                        result.preview = {
                            type: 'object',
                            description: 'Object',
                            overflow: false,
                            properties: [],
                        };
                        for (const key in object) {
                            result.preview.properties.push({
                                name: key,
                                type: typeof object[key],
                                value: typeof object[key] === 'object' ? 'Object' : object[key],
                            });
                        }
                    }
                    break;
                }
                default: {
                    result.value = object;
                    result.description = object.toString();
                }
            }
        }
        return result;
    }
    evaluateOnCallFrame(id, returnValue, error, generatePreview) {
        const result = this.objectToRemoteObject(returnValue, error, generatePreview);
        this.xhrSend(ResponseEvent.ById, { result }, id, true);
        return result;
    }
    evaluate(executionContext, id, params) {
        let returnValue, error;
        try {
            returnValue = function (expression) {
                if (typeof eval === 'function') {
                    return eval(expression);
                }
                return Agent.evalReference(expression);
            }.call(executionContext, params.expression);
        }
        catch (e) {
            error = e;
        }
        const result = this.objectToRemoteObject(returnValue, error, params.generatePreview);
        this.xhrSend(ResponseEvent.ById, { result }, id);
        return result;
    }
    getPossibleBreakpoints(id, params, stickyQueue) {
        const scriptId = params.scriptId;
        const startLine = params.startLine;
        const endLine = params.endLine === params.startLine ? params.endLine + 1 : params.endLine;
        const result = {
            locations: []
        };
        if (this.contextMap[scriptId]) {
            const stickyLine = this.contextMap[scriptId].stickyLine;
            for (let i = startLine; i < endLine; i++) {
                if (stickyLine.includes(i)) {
                    result.locations.push({
                        scriptId,
                        lineNumber: i,
                        columnNumber: 0,
                    });
                }
            }
        }
        else {
            this.originConsoleAPI.warn(`[tyro-agent] getPossibleBreakpoints no scriptId ${scriptId} in contextMap`);
        }
        this.originConsoleAPI.log(`[tyro-agent] getPossibleBreakpoints success, result: ${TyroUtil.safeJSONStringify(result)}`);
        this.xhrSend(ResponseEvent.ById, result, id, stickyQueue);
    }
    setBreakpointByUrl(id, params, stickyQueue) {
        const scriptId = params.scriptId;
        const url = params.url;
        const lineNumber = params.lineNumber;
        if (!this.contextMap[scriptId]) {
            this.originConsoleAPI.warn(`[tyro-agent] setBreakpointByUrl no contextMap, scriptId: ${scriptId}`);
            return;
        }
        const stickyLine = this.contextMap[scriptId].stickyLine;
        if (!stickyLine.includes(lineNumber)) {
            this.originConsoleAPI.warn(`[tyro-agent] setBreakpointByUrl not sticky line, scriptId: ${scriptId}, url: ${url}, lineNumber: ${lineNumber}`);
            return;
        }
        const breakpointId = `${scriptId}:${lineNumber}:0:${url}`;
        const result = {
            breakpointId,
            locations: [{
                    scriptId,
                    lineNumber,
                    columnNumber: 0
                }],
        };
        this.breakpointMap[scriptId][lineNumber] = breakpointId;
        this.breakpointIdMap[breakpointId] = {
            contextId: scriptId,
            line: lineNumber,
        };
        this.originConsoleAPI.log(`[tyro-agent] setBreakpointByUrl success, scriptId: ${scriptId}, url: ${url}, lineNumber: ${lineNumber}`);
        this.xhrSend(ResponseEvent.ById, result, id, stickyQueue);
    }
    setBreakpoint(id, params, stickyQueue) {
        const scriptId = params.scriptId;
        const lineNumber = params.lineNumber;
        if (!this.contextMap[scriptId]) {
            this.originConsoleAPI.warn(`[tyro-agent] setBreakpoint no contextMap, scriptId: ${scriptId}`);
            return;
        }
        const stickyLine = this.contextMap[scriptId].stickyLine;
        if (!stickyLine.includes(lineNumber)) {
            this.originConsoleAPI.warn(`[tyro-agent] setBreakpoint not sticky line, scriptId: ${scriptId}, lineNumber: ${lineNumber}`);
            return;
        }
        const breakpointId = `${scriptId}:${lineNumber}:0`;
        const result = {
            breakpointId,
            actualLocation: {
                scriptId,
                lineNumber,
                columnNumber: 0,
            },
        };
        this.breakpointMap[scriptId][lineNumber] = breakpointId;
        this.breakpointIdMap[breakpointId] = {
            contextId: scriptId,
            line: lineNumber,
        };
        this.originConsoleAPI.log(`[tyro-agent] setBreakpoint success, scriptId: ${scriptId}, lineNumber: ${lineNumber}`);
        this.xhrSend(ResponseEvent.ById, result, id, stickyQueue);
    }
    removeBreakpoint(id, params) {
        const breakpointId = params.breakpointId;
        const breakpointDetail = this.breakpointIdMap[breakpointId];
        if (!breakpointDetail) {
            this.originConsoleAPI.warn(`[tyro-agent] removeBreakpoint no breakpointId ${breakpointId}`);
        }
        const scriptId = breakpointDetail.contextId;
        const line = breakpointDetail.line;
        delete this.breakpointMap[scriptId][line];
        this.originConsoleAPI.log(`[tyro-agent] removeBreakpoint success, breakpointId: ${breakpointId}, scriptId: ${scriptId}, line: ${line}`);
    }
    setPauseOnExceptions(id, params) {
        if (!params || !['none', 'uncaught', 'all'].includes(params.state)) {
            this.originConsoleAPI.warn(`[tyro-agent] setPauseOnExceptions state invalid: ${TyroUtil.safeJSONStringify(params)}`);
            return;
        }
        this.pauseOnExceptions = params.state;
        this.originConsoleAPI.log(`[tyro-agent] setPauseOnExceptions success, pauseOnExceptions state ${this.pauseOnExceptions}`);
    }
    setAsyncCallStackDepth(id, params) {
        if (!params || typeof params.maxDepth !== 'number' || params.maxDepth < 0) {
            this.originConsoleAPI.warn(`[tyro-agent] setAsyncCallStackDepth maxDepth invalid: ${TyroUtil.safeJSONStringify(params)}`);
            return;
        }
        this.asyncCallStackDepth = params.maxDepth;
        this.originConsoleAPI.log(`[tyro-agent] setAsyncCallStackDepth success, maxDepth ${this.asyncCallStackDepth}`);
    }
    getProperties(id, params, stickyQueue) {
        const objectId = params.objectId;
        const object = this.objectMap[objectId];
        const result = [];
        for (const key in object) {
            result.push({
                name: key,
                value: this.objectToRemoteObject(object[key]),
            });
        }
        this.xhrSend(ResponseEvent.ById, { result }, id, stickyQueue);
    }
    generateFingerId() {
        this.fingerId += 1;
        return this.fingerId;
    }
}
let Agent = (() => {
    class Agent {
        constructor(instrumentId, rawContextJSON) {
            if (Agent.singleton) {
                return Agent.singleton;
            }
            this.host = 'https://hpmweb.alipay.com';
            this.stickyFinger = new StickyFinger(typeof window !== 'undefined' ? window : self, this.host, instrumentId, rawContextJSON);
        }
        static getShadowMethod() {
            this.globalReference = self;
            if (typeof eval === 'function') {
                this.evalReference = eval;
            }
            else if (typeof __eval === 'function') {
                this.evalReference = __eval;
            }
        }
        static setShadowMethod() {
            this.globalReference.eval = this.evalReference;
        }
        static setInstrumentId(instrumentId) {
            this.instrumentId = instrumentId;
        }
        static register(rawContextJSON, sourceCode) {
            if (!Agent.singleton) {
                if (!this.instrumentId && typeof my !== 'undefined') {
                    this.instrumentId = (my.callSync('getStartupParams') || {}).tyroId;
                }
                Agent.instance(this.instrumentId, rawContextJSON);
            }
            Agent.singleton.stickyFinger.register(rawContextJSON, sourceCode);
        }
        static sticky(contextId, line, scopeUid) {
            return Agent.singleton.stickyFinger.sticky(contextId, line, scopeUid);
        }
        static getEvaluateOnCallFrameExpression() {
            return Agent.singleton.stickyFinger.evaluateOnCallFrameExpression;
        }
        static evaluateOnCallFrame(id, returnValue, error, generatePreview) {
            return Agent.singleton.stickyFinger.evaluateOnCallFrame(id, returnValue, error, generatePreview);
        }
        static getScopeVariables() {
            return Agent.singleton.stickyFinger.scopeVariables;
        }
        static inflateStickyParamsObject(inflateObject) {
            return Agent.singleton.stickyFinger.inflateStickyParamsObject(inflateObject);
        }
        static entry(contextId, scopeUid) {
            return Agent.singleton.stickyFinger.fingerEntry(contextId, scopeUid);
        }
        static exit(contextId, scopeUid, fingerId) {
            Agent.singleton.stickyFinger.fingerExit(contextId, scopeUid, fingerId);
        }
        static instance(instrumentId, rawContextJSON) {
            Agent.singleton = new Agent(instrumentId, rawContextJSON);
        }
    }
    Agent.isPhone = true;
    Agent.instrumentId = null;
    return Agent;
})();
Agent.getShadowMethod();
const globalReference = (typeof window !== 'undefined' ? window : self);
globalReference.StickyFinger = StickyFinger;
globalReference.Agent = Agent;
//# sourceMappingURL=agent.js.map
!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=42)}({0:function(module,exports,__webpack_require__){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var originalBridgeCall=self.AlipayJSBridge&&self.AlipayJSBridge.call,originalFetch=self.fetch,originImportScripts=self.importScripts,originEval="function"==typeof self.__eval?self.__eval:self.eval;exports.getUserAgent=function(){return navigator.swuserAgent||navigator.userAgent||""},exports.debug=console.log.bind(console),exports.checkIOS=function(){return/\(i[^;]+;( U;)? CPU.+Mac OS X/.test(exports.getUserAgent())},exports.isLyra=function(){return Boolean(self.__LyraWSWorkerOrigin)},exports.callInternalAPI=function(e,t){var n={data:{method:e,param:t},action:"internalAPI"},o=encodeURIComponent(JSON.stringify(n));originalFetch?originalFetch("https://alipay.kylinBridge/?data="+o,{mode:"no-cors"}).then((function(){})).catch((function(){})):originalBridgeCall&&originalBridgeCall("internalAPI",{method:e,param:t})},exports.getStartupParams=function(){return self.__appxStartupParams&&self.__appxStartupParams.version?self.__appxStartupParams:self.AFAppX&&self.AFAppX.bridge&&self.AFAppX.bridge.callSync&&self.AFAppX.bridge.callSync("getStartupParams")||{}},exports.getBridge=function(){return self.AFAppX.bridge};var appxImported=!1,appxImportListener=[];exports.runAfterAppx=function(e){if(self.AFAppX)return appxImported=!0,void e();self.importScripts=function(e){originImportScripts(e),appxImported||"https://appx/af-appx.worker.min.js"!==e||(appxImported=!0,appxImportListener.forEach((function(e){return e()})),appxImportListener=[])},appxImportListener.push(e)},exports.evaluateScript=function(expression){return"function"==typeof eval?eval(expression):originEval(expression)}},10:function(e,t){
/*!
Copyright (C) 2013-2017 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var n="\\x"+("0"+"~".charCodeAt(0).toString(16)).slice(-2),o="\\"+n,r=new RegExp(n,"g"),s=new RegExp(o,"g"),a=new RegExp("(?:^|([^\\\\]))"+o),i=[].indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},c=String;function u(e,t,n){return t instanceof Array?function(e,t,n){for(var o=0,r=t.length;o<r;o++)t[o]=u(e,t[o],n);return t}(e,t,n):t instanceof c?t.length?n.hasOwnProperty(t)?n[t]:n[t]=function(e,t){for(var n=0,o=t.length;n<o;e=e[t[n++].replace(s,"~")]);return e}(e,t.split("~")):e:t instanceof Object?function(e,t,n){for(var o in t)t.hasOwnProperty(o)&&(t[o]=u(e,t[o],n));return t}(e,t,n):t}var l={stringify:function(e,t,s,a){return l.parser.stringify(e,function(e,t,s){var a,c,u=!1,l=!!t,p=[],d=[e],f=[e],g=[s?"~":"[Circular]"],m=e,h=1;return l&&(c="object"==typeof t?function(e,n){return""!==e&&t.indexOf(e)<0?void 0:n}:t),function(e,t){return l&&(t=c.call(this,e,t)),u?(m!==this&&(a=h-i.call(d,this)-1,h-=a,d.splice(h,d.length),p.splice(h-1,p.length),m=this),"object"==typeof t&&t?(i.call(d,t)<0&&d.push(m=t),h=d.length,(a=i.call(f,t))<0?(a=f.push(t)-1,s?(p.push((""+e).replace(r,n)),g[a]="~"+p.join("~")):g[a]=g[0]):t=g[a]):"string"==typeof t&&s&&(t=t.replace(n,o).replace("~",n))):u=!0,t}}(e,t,!a),s)},parse:function(e,t){return l.parser.parse(e,function(e){return function(t,r){var s="string"==typeof r;return s&&"~"===r.charAt(0)?new c(r.slice(1)):(""===t&&(r=u(r,r,{})),s&&(r=r.replace(a,"$1~").replace(o,n)),e?e.call(this,t,r):r)}}(t))},parser:JSON};e.exports=l},2:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){e.Connect="RemoteX.connect",e.Disconnect="RemoteX.disconnect",e.PageChanged="RemoteX.pageChanged",e.DataChanged="RemoteX.dataChanged",e.EvaluteScript="RemoteX.evaluteScript",e.syncStorage="RemoteX.syncStorage",e.requestWillBeSent="RemoteX.requestWillBeSent",e.requestFinished="RemoteX.requestFinished",e.Ping="RemoteX.ping",e.Pong="RemoteX.pong"}(t.RemoteXMethods||(t.RemoteXMethods={}))},42:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n(43),r=n(46),s=n(0);s.runAfterAppx((function(){s.debug("[bugme] run after appx"),s.getStartupParams().isRemoteX||s.isLyra()?(s.debug("[bugme] remotex mode"),o.registerRemoteX()):(s.debug("[bugme] preview mode"),r.registerPreview())}))},43:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n(9),r=n(0),s=n(44);t.registerRemoteX=function(){if(self.navigator){r.debug("[bugme] start to register remotex"),s.listenEvents(),o.SocketConn.open(),self.bugmeAPI={send:function(e){o.SocketConn.send(e)}};if(self.document&&self.document.dispatchEvent)try{self.document.dispatchEvent("bugmeInjected")}catch(e){self.document.dispatchEvent(new CustomEvent("bugmeInjected"))}else self.dispatchEvent&&self.dispatchEvent(new CustomEvent("bugmeInjected"))}}},44:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n(2),r=n(0),s=n(9),a=n(45);function i(e){if(!e||"object"!=typeof e)return{};var t={};return Object.keys(e).forEach((function(n){t[n]=""+e[n]})),t}var c=/^https?:\/\/hpmweb\.alipay\.com/,u=function(e){c.test(e.url)||s.SocketConn.send({method:o.RemoteXMethods.requestWillBeSent,params:{reqId:e.requestId,url:e.url,method:(e.method||"GET").toUpperCase(),body:e.postBody,headers:i(e.headers)}})},l=function(e){c.test(e.url)||s.SocketConn.send({method:o.RemoteXMethods.requestFinished,params:{reqId:e.requestId,url:e.url,status:e.status,body:e.body,headers:i(e.headers)}})},p=function(e){c.test(e.url)||s.SocketConn.send({method:o.RemoteXMethods.requestFinished,params:{reqId:e.requestId,url:e.url,status:null}})},d=function(e){var t={};Object.keys(e.data).forEach((function(n){try{t[n]=JSON.parse(e.data[n]).APDataStorage}catch(e){}})),s.SocketConn.send({method:o.RemoteXMethods.syncStorage,params:{data:t}})};t.listenEvents=function(){var e=r.getBridge();e.on(a.ERiverWorkerEvent.PageResume,(function(){s.SocketConn.send({method:o.RemoteXMethods.PageChanged})})),e.on(a.ERiverWorkerEvent.DebugPanelClick,(function(){s.SocketConn.close()})),r.checkIOS()&&!r.isLyra()?(e.on(a.ERiverDebugEvent.networkRequest,(function(e){var t=e.data;u(t)})),e.on(a.ERiverDebugEvent.networkResponse,(function(e){var t=e.data;l(t)})),e.on(a.ERiverDebugEvent.networkError,(function(e){var t=e.data;p(t)})),e.on(a.ERiverDebugEvent.storageChanged,(function(e){var t=e.data;d(t)}))):e.on(a.ERiverDebugEvent.debugConsole,(function(e){var t,n=e.data,o=n.type,r=n.content;try{t=JSON.parse(r)}catch(e){return}switch(o){case a.ERiverDebugEvent.networkRequest:u(t);break;case a.ERiverDebugEvent.networkResponse:l(t);break;case a.ERiverDebugEvent.networkError:p(t);break;case a.ERiverDebugEvent.storageChanged:d(t)}}))}},45:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){e.networkRequest="tinyAppRemoteDebug_network_request",e.networkResponse="tinyAppRemoteDebug_network_response",e.networkError="tinyAppRemoteDebug_network_error",e.storageChanged="tinyAppRemoteDebug_storage",e.debugConsole="onTinyDebugConsole",e.vconsoleMessage="onMessageFromVConsole"}(t.ERiverDebugEvent||(t.ERiverDebugEvent={})),function(e){e.PageResume="pageResume",e.DebugPanelClick="tinyRemoteDebugPanelButtonClick"}(t.ERiverWorkerEvent||(t.ERiverWorkerEvent={}))},46:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n(10),r=n(0),s=function(e,t){return void 0===t?"©undefined":null===t?"©null":t===-1/0?"©- Infinity":t===1/0?"©Infinity":"number"==typeof t&&isNaN(t)?"©NaN":"function"==typeof t?"©function":t},a=Function,i=function(e){try{if(e.fromVConsoleToWorker){var t=e.requestId;if("exec"===e.method){try{new a("requestId","sendBack","var res = "+e.script+";console.log(res);")(t,(function(e){return r.callInternalAPI("tinyDebugConsole",{type:"msgFromWorkerToVConsole",content:o.stringify({requestId:t,returnValue:e},s)})}))}catch(e){console.error(e.name+":"+e.message)}}}}catch(e){}};t.registerPreview=function(){setTimeout((function(){self.document?self.document.addEventListener("push",(function(e){try{var t=e.data.param;i(JSON.parse(t.content||t.data.content))}catch(e){}})):self.addEventListener&&self.addEventListener("push",(function(e){try{var t=JSON.parse(JSON.parse(e.data.text()).param.data.content);i(t)}catch(e){}}))}),10),["log","info","error","debug","warn"].forEach((function(e){var t="o"+e;console[t]||(console[t]=console[e],console[e]=function(){for(var n,a=[],i=0;i<arguments.length;i++)a[i]=arguments[i];console[t].apply(console,a);try{n=o.stringify(a.map((function(e){return e instanceof Error?e.name+": "+e.message:e})),s)}catch(e){return void console.error(e.name+": "+e.message)}r.callInternalAPI("tinyDebugConsole",{content:n,type:"console_"+e})})}))}},9:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n(10),r=n(0),s=n(2),a=function(){r.getBridge().call("showRemoteDebugPanel",{status:"connecting",text:"远程调试准备中",buttonTitle:"退出"})},i=function(){r.getBridge().call("showRemoteDebugPanel",{status:"connected",text:"远程调试已连接",buttonTitle:"退出"})},c=function(){r.getBridge().call("showRemoteDebugPanel",{status:"disconnected",text:"远程调试已断开",buttonTitle:"退出"})};t.SocketConn={messageQueue:[],socketTask:null,send:function(e){var t=this,n="string"==typeof e?e:JSON.stringify(e);n.length>5242880?r.debug("[bugme] socket send failed, size: ",n.length):this.socketTask?(this.messageQueue.length&&(this.messageQueue.forEach((function(e){t.socketTask.send({data:e})})),this.messageQueue=[]),this.socketTask.send({data:n})):this.messageQueue.push(n)},close:function(){this.socketTask?this.socketTask.close():r.getBridge().showToast({content:"请点击右上角关闭按钮退出",duration:1e3})},connect:function(e){var t=this,n=r.getBridge(),o=n.connectSocket({url:e,multiple:!0});o.onOpen((function(){t.socketTask=o,t.onopen(),r.debug("[bugme] websocket connected")})),o.onMessage((function(e){t.onmessage(e)})),o.onClose((function(){t.onclose()})),o.onError((function(){t.socketTask||(c(),n.showToast({content:"本次真机调试已结束，请重新生成调试版本",duration:2e3}))}))},open:function(){var e=this,t=r.getStartupParams(),n=t.channelId,o=t.channelAuthPair,s=self.__LyraWSWorkerOrigin;if(n||s){a();var i=r.getBridge(),c=s?s+"/worker":"wss://openchannel.alipay.com/host/"+n;if(o&&(c+="?"+o.key+"="+o.value),r.checkIOS()&&!r.isLyra()){this.connect(c);var u=i.connectSocket;i.connectSocket=function(e){if(e&&e.multiple)return u(e);i.showToast({content:"iOS 真机调试暂不支持 connectSocket JSAPI",duration:1e3})},i.onSocketOpen=i.offSocketOpen=i.onSocketMessage=i.offSocketMessage=i.closeSocket=function(){}}else setTimeout((function(){e.connect(c)}),1200)}else r.debug("[bugme] missing channelId in startup params")},onopen:function(){var e=r.getBridge(),t=e.getSystemInfoSync();this.send({method:s.RemoteXMethods.Connect,params:{userAgent:r.getUserAgent(),sdkVersion:e.SDKVersion,alipayVersion:t.version,model:t.model,system:t.system}}),i()},onmessage:function(e){try{var t=JSON.parse(e.data.data),n=t.method,a=t.id,i=t.params;if(n===s.RemoteXMethods.Disconnect)this.close();else if(n===s.RemoteXMethods.EvaluteScript){if(i&&i.code)try{var c=r.evaluateScript(i.code);this.send({returnId:a,payload:o.stringify(c)})}catch(e){r.debug("[remoteX worker evaluateScript] ",e)}}else n===s.RemoteXMethods.Ping&&this.send({method:s.RemoteXMethods.Pong,params:{returnId:a}})}catch(t){r.debug("RemoteX onSocketMessage error",t,e)}},onclose:function(){this.socketTask=null,this.messageQueue=[],c(),[1,2].forEach((function(e){r.getBridge().call("closeSocket",{socketTaskId:e})}))}}}});
if(!self.__appxInited) {
self.__appxInited = 1;


require('./config$');
require('./importScripts$');

var AFAppX = self.AFAppX;
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