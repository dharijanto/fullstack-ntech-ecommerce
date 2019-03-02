(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (global){
const $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
const selectVariant = $('#select-variant');
const selectQuantity = $('#select-quantity');
function onSelectedVariantChanged() {
    const selectedId = selectVariant.find(':selected').data('id');
    const selectedQuantity = selectVariant.find(':selected').data('quantity');
    selectQuantity.empty();
    for (let i = 1; i <= selectedQuantity; i++) {
        selectQuantity.append(`<option data-quantity=${i}>${i}</option>`);
    }
}
$(document).ready(function () {
    onSelectedVariantChanged();
});
$('#select-variant').on('change', function () {
    onSelectedVariantChanged();
});
$('#add-to-cart').on('click', function () {
    const variantId = selectVariant.find(':selected').data('id');
    const qtty = selectQuantity.val();
    console.log('variantId=' + variantId);
    console.log('qtty=' + qtty);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[2,1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguZC50cyIsInNyYy9wcm9kdWN0LWFwcC9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7OztBQ0FBLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUUzQixNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUMxQyxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUM1QyxTQUFTLHdCQUF3QjtJQUMvQixNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3RCxNQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ3pFLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDMUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDbEU7QUFDSCxDQUFDO0FBQ0QsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNoQix3QkFBd0IsRUFBRSxDQUFBO0FBQzVCLENBQUMsQ0FBQyxDQUFBO0FBQ0YsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNoQyx3QkFBd0IsRUFBRSxDQUFBO0FBQzVCLENBQUMsQ0FBQyxDQUFBO0FBRUYsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7SUFDNUIsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDNUQsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxDQUFBO0lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFBO0FBQzdCLENBQUMsQ0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiIiwiY29uc3QgJCA9IHJlcXVpcmUoJ2pxdWVyeScpXG5cbmNvbnN0IHNlbGVjdFZhcmlhbnQgPSAkKCcjc2VsZWN0LXZhcmlhbnQnKVxuY29uc3Qgc2VsZWN0UXVhbnRpdHkgPSAkKCcjc2VsZWN0LXF1YW50aXR5JylcbmZ1bmN0aW9uIG9uU2VsZWN0ZWRWYXJpYW50Q2hhbmdlZCAoKSB7XG4gIGNvbnN0IHNlbGVjdGVkSWQgPSBzZWxlY3RWYXJpYW50LmZpbmQoJzpzZWxlY3RlZCcpLmRhdGEoJ2lkJylcbiAgY29uc3Qgc2VsZWN0ZWRRdWFudGl0eSA9IHNlbGVjdFZhcmlhbnQuZmluZCgnOnNlbGVjdGVkJykuZGF0YSgncXVhbnRpdHknKVxuICBzZWxlY3RRdWFudGl0eS5lbXB0eSgpXG4gIGZvciAobGV0IGkgPSAxOyBpIDw9IHNlbGVjdGVkUXVhbnRpdHk7IGkrKykge1xuICAgIHNlbGVjdFF1YW50aXR5LmFwcGVuZChgPG9wdGlvbiBkYXRhLXF1YW50aXR5PSR7aX0+JHtpfTwvb3B0aW9uPmApXG4gIH1cbn1cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgb25TZWxlY3RlZFZhcmlhbnRDaGFuZ2VkKClcbn0pXG4kKCcjc2VsZWN0LXZhcmlhbnQnKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICBvblNlbGVjdGVkVmFyaWFudENoYW5nZWQoKVxufSlcblxuJCgnI2FkZC10by1jYXJ0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICBjb25zdCB2YXJpYW50SWQgPSBzZWxlY3RWYXJpYW50LmZpbmQoJzpzZWxlY3RlZCcpLmRhdGEoJ2lkJylcbiAgY29uc3QgcXR0eSA9IHNlbGVjdFF1YW50aXR5LnZhbCgpXG4gIGNvbnNvbGUubG9nKCd2YXJpYW50SWQ9JyArIHZhcmlhbnRJZClcbiAgY29uc29sZS5sb2coJ3F0dHk9JyArIHF0dHkpXG59KVxuIl19
