/**
 * Created by Administrator on 2017/3/30.
 */
function hasClass (obj, prop) {
    if (obj.currentStyle) {//IE
        return obj.currentStyle[prop];

    }else if (window.getComputedStyle) { //非IE

        propprop = prop.replace (/([A-Z])/g, "-$1");
        propprop = prop.toLowerCase ();
        return document.defaultView.getComputedStyle(obj,null)[propprop];
    }
    return null;
}

var BODY = document.getElementById('body-container'),
    WRAP = document.getElementById('wrap');

WRAP.style.minHeight = hasClass(BODY, 'height');