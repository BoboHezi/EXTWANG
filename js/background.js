var saveLoginInfo = null;
var config = {
    activepage: 'https://s.taobao.com',
    httpHome: 'https://s.taobao.com'
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostEquals: config.activepage
                },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });

    console.log('EXTWANG started.');
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var retFun = null;
    if (typeof request === 'object') {
        retFun = request
    } else {
        retFun = eval('(' + request + ')');
    }

    if (retFun && retFun.type) {
        if (retFun.type === 'ajax') {
            var conf = retFun.conf;
            $.ajax({
                url: config.httpHome + conf.url,
                type: conf.type,
                async: false,
                data: conf.data,
                dataType: conf.dataType,
                success: function(data) {
                    sendResponse({
                        type: "success",
                        data: data,
                        config: config
                    })
                },
                error: function(data) {
                    if (data.responseText && data.responseText.indexOf('后台登录') > -1) {} else {
                        sendResponse({
                            type: "error",
                            data: data,
                            info: info,
                            config: config
                        })
                    }
                }
            })
        } else if (retFun.type === 'fake_ajax') {
            sendResponse({
                type: "success",
                data: loadFakeData(retFun.conf.data.listUid),
                config: config
            });
        } else if (retFun.type === 'log') {
            console.log(retFun.log);
        }
    } else {
        sendResponse(JSON.stringify(retFun));
    }
})

function loadFakeData(uids) {
    var data = [];
    uids.forEach(function(uid) {
        var ele = {
            Uid: uid,
            Company: 'AvocadoEli',
            RegDate: '2102',
            Mobile: '19839489304',
            Phone: '010-3874623'
        };
        data.push(ele);
    });
    return data;
}