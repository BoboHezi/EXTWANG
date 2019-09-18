var lastUids = []

function sendMessage(conf, callback) {
    chrome.runtime.sendMessage(conf, callback)
}

$(document).ready(function() {
    setTimeout(intervalQuery, 2000);
});

var intervalQuery = () => {
    var uids = getlistUid();
    if (uids.length > 0) {
        if (lastUids.toString() != uids.toString()) {
            lastUids = uids;
            sendMessage({
                type: 'log',
                log: 'lastUids changed: ' + lastUids
            }, null);
            query(lastUids);
        }
    }
    setTimeout(intervalQuery, 2000);
}

function getlistUid() {
    var listUid = [];
    $('#list-container>.list-item .shop-name').each(function(i, it) {
        var par = $(it).parents('.list-item');
        var uid = $(it).attr('trace-uid');
        listUid.push(uid)
    });
    return listUid;
}

var query = (listUid) => {
    listUid.forEach(function(uid) {
        var conf = {
            url: '/tm/getCompanyByShopId',
            type: 'GET',
            data: {
                shopId: uid
            },
            dataType: 'JSON'
        };

        sendMessage('{type: "ajax", conf:' + JSON.stringify(conf) + '}', function(response) {
            if (response && response.type == 'success') {
                sendMessage({
                    type: 'log',
                    log: 'response.data:\n' + JSON.stringify(response.data)
                }, null);
                if (response.data && response.data.message == "登陆失效") {
                    sendMessage({type: 'clear_login'}, null);
                    return;
                }
                parseDom(response.data, uid);
            }
        });
    })
}

function parseDom(data, uid) {
    var thi = $('#list-container>.list-item .shop-name[trace-uid=' + uid + ']');
    var par = thi.parents('.list-item');
    var info = par.children('.gaohao_info');
    if (info) {
        info.remove()
    }
    var msg = creatDomStr(data);
    par.attr('GaoHao-IsSearch', 'true');
    par.append(msg);
}

function creatDomStr(data) {
    var msg;
    if (data.message == "查询成功") {
        msg = $(`
<div class="gaohao_info"><a target="_blank" href="${data.company_name ? 'https://www.tianyancha.com/search?key=' + data.company_name : 'javascript:;'}">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAiCAYAAAAzrKu4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjkzNEIzOTkxM0YyQjExRTk4RkIyODUxRjZCODdFMDM3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjkzNEIzOTkyM0YyQjExRTk4RkIyODUxRjZCODdFMDM3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OTM0QjM5OEYzRjJCMTFFOThGQjI4NTFGNkI4N0UwMzciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OTM0QjM5OTAzRjJCMTFFOThGQjI4NTFGNkI4N0UwMzciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7I0noZAAACTElEQVR42uyYT0gUURzHZ4dFF11KkDAMQkQqwaiwEg8dNv8dU+jgwYOI3VbqVCweEqSgk9Glg1riwToIFd3Wf0cPVvQHQtOLQa1S4Aptm2u4fX/wHRgGZn3P/TOG/uDDvJl9b97Hmffm956+dMjQjeOgH1wDJ4DpUm8HfAOvwD2wptOJT1PsLIhSTidEqhV8yoeYnzc+A9bBIHgHUi71i8B5cBdUgCVQB/7mWqwdvABb7HBRsd1p8AEUgw7wUqWRqfE6LvM4oyFl8EnNsNyg2khHrIzHuKEfVpujOuPGGQFQBUod14/xGATVmmJB2z3qHb8lwCpIuo2xSvAAXKdcIeMPmAS3QcwudhLMU87L+A4awVfrVT6h1E8QBrOq0zoHIQ5XwSM6jIIWeWI1KCyzUhOlvIiQre8amZXneBLzUEpizhpf4mTyw2fwNXodlkPANPZp+B0JOr1fxP6LJ7YCOhXaXADDXG+1gY0MKSzKP74XvFe493OZkU4xSQlvFRp/BPeZXmSx2OdS7yGlfoBxsK1w72Q2r1I6GGA5TIEjtt+lPARu8nxAUWrXJK4Sj8El0E2BG7anLUm6hOUx1i3Y4JfZ20OpOEWukBJeu8U66WwH/17kJL+NMJWd4vUvXBj+ztWs3GuIwOsD8x07FDsUO9BiCdsuyeehi8+2GfolYgtcKZQrri7yFZ10EJcFP7dME6ALPAW1YCrbL7dGSAprBnd4/kzW/ta+Urbu0+Cix0PrDSU3rcG/yQQcAZ8z/GspH5FinxE6iIvxT4ABALtsekngv+jCAAAAAElFTkSuQmCC">公司名称(点击查看)<span>${data.company_name && data.company_name != 'null' ? data.company_name : '---'}</span>
</a>
    <a target="_blank" class="reg_date">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAiCAYAAADYmxC7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZENDE0OTA0M0YzMDExRTk5QUU5OURBREYwQjA0MjlFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZENDE0OTA1M0YzMDExRTk5QUU5OURBREYwQjA0MjlFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RkQ0MTQ5MDIzRjMwMTFFOTlBRTk5REFERjBCMDQyOUUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RkQ0MTQ5MDMzRjMwMTFFOTlBRTk5REFERjBCMDQyOUUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5sCt/rAAABPElEQVR42mL878hwmIGBwYZh8IAjTAyDELAgsd8B8Ro8alWA2AnK3gHEj4gwXw6IPaDsfUB8B4/aECAWQnfUUyBOx6MpCslRU4B4KxGO8kZy1FwgXoZHrSXMUYMy+kYdRU5CJwS+APE9KPsbkXq+Ien5QgtHbYJiUsB+IFYedtEnAcQdA+gWCWyOEgXi8tHcR0T0XRvgivkIEGuhO+ovEL8fQEf9HS3RR0w1swCIuXDIvQHiLCzi04BYBE/Vk0CpowKAmB+H3CM87Sg5HHIfqRFSH4D4H4kWfMSTkz9Rw1EKZCQLvRGZ0AuAmB1PVEzHIp4JxHw49PwE4gmUOqqBQELH5qgKAgl9wrCMPgM8jv+DQ9wWj9n/qOGoB2R49tGwy32jjiInoUsD8cwBdIs0NkeBBhfSRqMPBwAIMADqgTbvVgRU1QAAAABJRU5ErkJggg==">注册日期<span>${data.start_time && data.start_time != 'null' ? data.start_time : '---'}</span>
</a>
    <a target="_blank" class="reg_phone">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAiCAYAAADYmxC7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjAzNTdDMTI2M0YzMTExRTlBMjhGRTMxRjBBRTYwNzc5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjAzNTdDMTI3M0YzMTExRTlBMjhGRTMxRjBBRTYwNzc5Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDM1N0MxMjQzRjMxMTFFOUEyOEZFMzFGMEFFNjA3NzkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDM1N0MxMjUzRjMxMTFFOUEyOEZFMzFGMEFFNjA3NzkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6YHxlJAAAC8klEQVR42syXW4hNURjHz9lzGI1pxqAJyd1B6jAiEyaXvJDk8jCixDSkeJEHlNxvNR54ohQpDxIS5VITLxjXMcghuTUdl1LkNiPGHP+v/ru+Vmef2Wu3Z7Z//c5ZrbPWXv+z1+X7Vjw7MybqD/aBeaBPrOv1CZwBm8HXOEyVonAfjIhFL/FRlcDHamWoGRwB7V1opDtYDMaBiaBGTFWqBjJ9TyJ4QyfBa5ZnOfgoVD82RzRtn1W5h+Oz00hwDmwNOOhwcBZs89PYr6m1YCHYAYYGMLUOLALbwcCwTP1Q5UEBTLl9foGPYZl6o8qTLQ3JGFNYvgPawjJ1WR0TNSBhYUp2dD+WT4S5pt6DqyyPAut99isGdSxnwKkwTYk2gd8sS0ha3kH7EnARJEGWm6U1bFOPwRqWCzgV8s9TRrsiGpZDeAbr9oALfgdKWC7a46CUUyJ9q0mGm6GY01vE9u08m3bb7gxbHQRTwQ1VJ2dPFahQhhrANFtDQd6Uq7s0MQHMB+NBT/ATPOJUPQgac4KactVIQpUT+w/lqBAiIaAlIh8tHF/0XaZvC9PRevAnIlMy7hIwGxyKM0ePWoNBb/BQr6kh4Jm8OrArhA1gozpmnY1uSJI3JadzmuHA1X7eLDpbS5kKx1VdpcMDL2k03ghWdrKhCkaIuFG/zOHBZ0oaHvURdINqLLjCm4ypYWKqm0dHmdZjYEPI55ncnq6B8qCHpxg7AO6BFSpZs5WEoLngNLiZz1C+MCMH2W0wnSlIivPv5uu251kZv1+C81wyH3j5LPTzpl6BMeAS19ZhMAm8U9lkmSUxZgtJJn4l/MMpdQnNa2oVeKs2wALQxPqgauCdMcucvS+zjBeglvWepmS+rxt1A9Tl4anHoPLQLypdNrVXDZw0nivj3cpnKm1x1dLayTBR6/F7R89N51vofz2Cpblgc92gv/FykUvludaOUptpKsMMwc2pCwxzz/ndi5llvceD5zDrzKXR3M1ealXPbfonwAD+hJda4jDCWwAAAABJRU5ErkJggg==">天猫电话<span>${data.phone && data.phone != 'null' ? data.phone : '---'}</span>
</a>
    <a target="_blank" class="reg_phone2">
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAiCAYAAAA+stv/AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA1NjFDOTlCM0YzMTExRTk4ODE3REI0N0FGNTIyQzMzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA1NjFDOTlDM0YzMTExRTk4ODE3REI0N0FGNTIyQzMzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDU2MUM5OTkzRjMxMTFFOTg4MTdEQjQ3QUY1MjJDMzMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDU2MUM5OUEzRjMxMTFFOTg4MTdEQjQ3QUY1MjJDMzMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7O2taTAAAB0klEQVR42uyXSyhEURjH79zGa4HEglggK/IoSlbjUVJEymNnY2OShSxs5JEF2XhszHayk4XXHpuRrJQIzchCkSYpj6to/E/9b91u7m24c4fF+eo39ztz7znf/3zn3vo+T6xJsbN6MAJ8IB/EwB04AKsgpDg0j42AaTApnrG4L8QsgTH6vzKvxf8DYIr+M9gB5xyXg3aQCUbBA5jjPT+oiSOuBk5AUM9AD2jhjsWCp6AChEEriJgWKARboBY88Xg0+lk/SMCCyEAnWGeqr8EKgys858g3E2/BDNgG2aASHIMrkGMTMBUUGca9QsAEg0fBJkgzPPBqs9ijwdfn1MWxa3GEu6AEFKj4qeaNALhU3LczsEY/XWVa9JctWfamO6ryxyYFSAFSgBQgBUgBUsC/FPBh8FNs5mZYzHEs4AXc0++y6Qv6ef0EF4k+giCvzWDZtFtRgM6CQY43TAVqQhqTedAHitmadbM5EdnoMJTWoocYd/IOeG1K7jaWz2UM6Dc9E6GwGzcEKDzXKjDEbJSyBwwz7QFjdetEwDvPNdeifF4kiTQ9liYEHIJGMMwdRl3+9PMYS1hINKcNcPZMLVkyTGTepxoysM8O123TGEvEPPoSYABbP11kgA6XPAAAAABJRU5ErkJggg==">企业电话<span>${data.phone && data.phone != 'null' ? data.phone.replace(',','&nbsp;').replace(',','&nbsp;') : '---'}</span>
</a>
    <p></p>
    <p>邮箱: ${data.mail} 注册资金: ${data.regist_cost} 店铺名称: ${data.shop_name} 法人: ${data.boss_name} 注册号: ${data.regist_num} 位置: ${data.positon} 社会信用代码: ${data.credit_code} 公司状态: ${data.company_status}</p>
</div>`)
    } else {
        msg = $(`<div class="gaohao_info err">${data.message}<div></div></div>`);
    }
    return msg;
}