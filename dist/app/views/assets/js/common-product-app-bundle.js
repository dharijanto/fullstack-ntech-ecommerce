(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
"use strict";
/* Contains code that is used by both inStockProduct and poProducts */
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
const currentImg = $('#img-current');
$('.img-gallery').on('click', function () {
    const img = $(this);
    const src = img.attr('src');
    currentImg.attr('src', src);
    console.dir(src);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){

},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tbW9uLXByb2R1Y3QtYXBwL21haW4udHMiLCJzcmMvaW5kZXguZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsc0VBQXNFOztBQUV0RSw0QkFBMkI7QUFJM0IsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBRXBDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO0lBQzVCLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNuQixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzNCLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDbEIsQ0FBQyxDQUFDLENBQUE7Ozs7O0FDYkYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBDb250YWlucyBjb2RlIHRoYXQgaXMgdXNlZCBieSBib3RoIGluU3RvY2tQcm9kdWN0IGFuZCBwb1Byb2R1Y3RzICovXG5cbmltcG9ydCAqIGFzICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0ICogYXMgdG9hc3RyIGZyb20gJ3RvYXN0cidcblxuaW1wb3J0IGF4aW9zIGZyb20gJy4uL2xpYnMvYXhpb3Mtd3JhcHBlcidcbmNvbnN0IGN1cnJlbnRJbWcgPSAkKCcjaW1nLWN1cnJlbnQnKVxuXG4kKCcuaW1nLWdhbGxlcnknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGltZyA9ICQodGhpcylcbiAgY29uc3Qgc3JjID0gaW1nLmF0dHIoJ3NyYycpXG4gIGN1cnJlbnRJbWcuYXR0cignc3JjJywgc3JjKVxuICBjb25zb2xlLmRpcihzcmMpXG59KVxuIiwiIl19
