var saveLoginInfo = null;
var config = {
    activepage: 'https://s.taobao.com',
    httpHome: 'http://47.99.172.85:8028'
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
                    sendResponse({
                        type: "error",
                        data: data,
                        config: config
                    })
                }
            })
        } else if (retFun.type === 'fake_ajax') {
            sendResponse({
                type: "success",
                data: loadFakeData(retFun.conf.data.shopId),
                config: config
            });
        } else if (retFun.type === 'clear_login') {
            clearlogindata();
        } else if (retFun.type === 'log') {
            console.log(retFun.log);
        }
    } else {
        sendResponse(JSON.stringify(retFun));
    }
})

function loadFakeData(uid) {
    return {
        Uid: uid,
        company_name: 'AvocadoEli',
        start_time: '2102-02-30',
        phone: '010-1234509876'
    };
}

function islogineffective() {
    var username = sessionStorage.getItem('username');
    var expre_time = sessionStorage.getItem('expre_time');

    if (username && expre_time) {
        var expre = new Date(expre_time);
        var now = new Date();
        return expre > now;
    }
    return false;
}

function savelogindata(data) {
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('expre_time', data.expre_time);
}

function readlogindata() {
    var username = sessionStorage.getItem('username');
    var expre_time = sessionStorage.getItem('expre_time');

    if (username && expre_time) {
        return {
            'username': username,
            'expre_time': expre_time
        }
    }
    return null;
}

function clearlogindata() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('expre_time');
}