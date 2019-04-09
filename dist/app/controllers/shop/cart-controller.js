"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const base_controller_1=require("../base-controller"),cart_service_1=require("../../local-shop-services/cart-service"),local_shop_service_1=require("../../local-shop-services/local-shop-service"),path=require("path");let log=require("npmlog");const TAG="MainController";class CartController extends base_controller_1.default{constructor(e){super(Object.assign(e,{viewPath:path.join(__dirname,"../views")})),this.routePost("/add-item",(e,s,t)=>{if(log.verbose(TAG,"/add-item.POST:"+JSON.stringify(e.session,null,2)),e.body.variantId&&e.body.quantity){const t={variantId:e.body.variantId,quantity:parseInt(e.body.quantity,10)};local_shop_service_1.default.getVariantAvailability(e.body.variantId).then(r=>{r.status&&r.data?e.session&&cart_service_1.default.addItemToCart(r.data.status,e.session.cart,t).then(t=>{t.status?e.session?(e.session.cart=t.data,s.json({status:!0,data:t.data})):s.json({status:!1,errMessage:"Session is not defined!"}):s.json(t)}):s.json({status:!1,errMessage:"Failed to get variant availability: "+r.errMessage})})}else s.json({status:!1,errMessage:"variantId and quantity are required!"})}),this.routeGet("/details",(e,s,t)=>{s.json(e.session?e.session.cart:"Your cart is empty!")}),this.routePost("/place-order",(e,s,t)=>{e.session?cart_service_1.default.placeOrder(e.body.fullName,e.body.phoneNumber,e.body.notes,e.session.cart).then(t=>{t.status?e.session?cart_service_1.default.emptyCart(e.session.cart).then(e=>{e.status||log.error(TAG,"place-order.POST: emptyCart failed!"),s.json(t)}):s.json(t):s.json({status:!1,errMessage:t.errMessage})}).catch(t):s.json({status:!1,errMessage:"Session is not defined!"})}),this.routeGet("/order-placed",(e,s,t)=>{s.render("order-placed")}),this.routeGet("/",(e,s,t)=>{e.session?cart_service_1.default.getCart(e.session.cart).then(e=>{e.status?(s.locals.cart=e.data,s.render("cart")):t(new Error(e.errMessage))}):t(new Error("Session is not defined!"))})}}exports.default=CartController;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHAvY29udHJvbGxlcnMvc2hvcC9jYXJ0LWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOlsiYmFzZV9jb250cm9sbGVyXzEiLCJyZXF1aXJlIiwiY2FydF9zZXJ2aWNlXzEiLCJsb2NhbF9zaG9wX3NlcnZpY2VfMSIsInBhdGgiLCJsb2ciLCJUQUciLCJDYXJ0Q29udHJvbGxlciIsImRlZmF1bHQiLCJbb2JqZWN0IE9iamVjdF0iLCJzaXRlRGF0YSIsInN1cGVyIiwiT2JqZWN0IiwiYXNzaWduIiwidmlld1BhdGgiLCJqb2luIiwiX19kaXJuYW1lIiwidGhpcyIsInJvdXRlUG9zdCIsInJlcSIsInJlcyIsIm5leHQiLCJ2ZXJib3NlIiwiSlNPTiIsInN0cmluZ2lmeSIsInNlc3Npb24iLCJib2R5IiwidmFyaWFudElkIiwicXVhbnRpdHkiLCJkYXRhIiwicGFyc2VJbnQiLCJnZXRWYXJpYW50QXZhaWxhYmlsaXR5IiwidGhlbiIsInJlc3AiLCJzdGF0dXMiLCJhZGRJdGVtVG9DYXJ0IiwiY2FydCIsImpzb24iLCJlcnJNZXNzYWdlIiwicm91dGVHZXQiLCJwbGFjZU9yZGVyIiwiZnVsbE5hbWUiLCJwaG9uZU51bWJlciIsIm5vdGVzIiwiZW1wdHlDYXJ0IiwicmVzcDIiLCJlcnJvciIsImNhdGNoIiwicmVuZGVyIiwiZ2V0Q2FydCIsImxvY2FscyIsIkVycm9yIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Im9FQUFBLE1BQUFBLGtCQUFBQyxRQUFBLHNCQUNBQyxlQUFBRCxRQUFBLDBDQUVBRSxxQkFBQUYsUUFBQSxnREFFTUcsS0FBT0gsUUFBUSxRQUVyQixJQUFJSSxJQUFNSixRQUFRLFVBRWxCLE1BQU1LLElBQU0sdUJBRVpDLHVCQUE0Q1Asa0JBQUFRLFFBQzFDQyxZQUFhQyxHQUNYQyxNQUFNQyxPQUFPQyxPQUFPSCxHQUFZSSxTQUFVVixLQUFLVyxLQUFLQyxVQUFXLGVBRy9EQyxLQUFLQyxVQUFVLFlBQWEsQ0FBQ0MsRUFBS0MsRUFBS0MsS0FFckMsR0FEQWhCLElBQUlpQixRQUFRaEIsSUFBSyxrQkFBb0JpQixLQUFLQyxVQUFVTCxFQUFJTSxRQUFTLEtBQU0sSUFDbkVOLEVBQUlPLEtBQUtDLFdBQWFSLEVBQUlPLEtBQUtFLFNBQVUsQ0FDM0MsTUFBTUMsR0FDSkYsVUFBV1IsRUFBSU8sS0FBS0MsVUFDcEJDLFNBQVVFLFNBQVNYLEVBQUlPLEtBQUtFLFNBQVUsS0FFeEN6QixxQkFBQUssUUFBaUJ1Qix1QkFBdUJaLEVBQUlPLEtBQUtDLFdBQVdLLEtBQUtDLElBQzNEQSxFQUFLQyxRQUFVRCxFQUFLSixLQUNsQlYsRUFBSU0sU0FDTnZCLGVBQUFNLFFBQVkyQixjQUFjRixFQUFLSixLQUFLSyxPQUFRZixFQUFJTSxRQUFRVyxLQUFNUCxHQUFNRyxLQUFLQyxJQUNuRUEsRUFBS0MsT0FDSGYsRUFBSU0sU0FDTk4sRUFBSU0sUUFBUVcsS0FBT0gsRUFBS0osS0FDeEJULEVBQUlpQixNQUFPSCxRQUFRLEVBQU1MLEtBQU1JLEVBQUtKLFFBRXBDVCxFQUFJaUIsTUFBT0gsUUFBUSxFQUFPSSxXQUFZLDRCQUd4Q2xCLEVBQUlpQixLQUFLSixLQUtmYixFQUFJaUIsTUFBT0gsUUFBUSxFQUFPSSxXQUFZLHVDQUF5Q0wsRUFBS0ssb0JBSXhGbEIsRUFBSWlCLE1BQU9ILFFBQVEsRUFBT0ksV0FBWSwyQ0FLMUNyQixLQUFLc0IsU0FBUyxXQUFZLENBQUNwQixFQUFLQyxFQUFLQyxLQUNuQ0QsRUFBSWlCLEtBQUtsQixFQUFJTSxRQUFVTixFQUFJTSxRQUFRVyxLQUFPLHlCQUc1Q25CLEtBQUtDLFVBQVUsZUFBZ0IsQ0FBQ0MsRUFBS0MsRUFBS0MsS0FDcENGLEVBQUlNLFFBQ052QixlQUFBTSxRQUFZZ0MsV0FBV3JCLEVBQUlPLEtBQUtlLFNBQVV0QixFQUFJTyxLQUFLZ0IsWUFBYXZCLEVBQUlPLEtBQUtpQixNQUFPeEIsRUFBSU0sUUFBUVcsTUFBTUosS0FBS0MsSUFDakdBLEVBQUtDLE9BQ0hmLEVBQUlNLFFBQ052QixlQUFBTSxRQUFZb0MsVUFBVXpCLEVBQUlNLFFBQVFXLE1BQU1KLEtBQUthLElBQ3RDQSxFQUFNWCxRQUNUN0IsSUFBSXlDLE1BQU14QyxJQUFLLHVDQUVqQmMsRUFBSWlCLEtBQUtKLEtBR1hiLEVBQUlpQixLQUFLSixHQUdYYixFQUFJaUIsTUFBT0gsUUFBUSxFQUFPSSxXQUFZTCxFQUFLSyxlQUU1Q1MsTUFBTTFCLEdBRVRELEVBQUlpQixNQUFPSCxRQUFRLEVBQU9JLFdBQVksOEJBSTFDckIsS0FBS3NCLFNBQVMsZ0JBQWlCLENBQUNwQixFQUFLQyxFQUFLQyxLQUN4Q0QsRUFBSTRCLE9BQU8sa0JBR2IvQixLQUFLc0IsU0FBUyxJQUFLLENBQUNwQixFQUFLQyxFQUFLQyxLQUN4QkYsRUFBSU0sUUFDTnZCLGVBQUFNLFFBQVl5QyxRQUFROUIsRUFBSU0sUUFBUVcsTUFBTUosS0FBS0MsSUFDckNBLEVBQUtDLFFBQ1BkLEVBQUk4QixPQUFPZCxLQUFPSCxFQUFLSixLQUN2QlQsRUFBSTRCLE9BQU8sU0FFWDNCLEVBQUssSUFBSThCLE1BQU1sQixFQUFLSyxlQUl4QmpCLEVBQUssSUFBSThCLE1BQU0sK0JBaEZ2QkMsUUFBQTVDLFFBQUFEIiwiZmlsZSI6ImFwcC9jb250cm9sbGVycy9zaG9wL2NhcnQtY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCYXNlQ29udHJvbGxlciBmcm9tICcuLi9iYXNlLWNvbnRyb2xsZXInXG5pbXBvcnQgQ2FydFNlcnZpY2UgZnJvbSAnLi4vLi4vbG9jYWwtc2hvcC1zZXJ2aWNlcy9jYXJ0LXNlcnZpY2UnXG5pbXBvcnQgeyBTaXRlRGF0YSB9IGZyb20gJy4uLy4uLy4uL3NpdGUtZGVmaW5pdGlvbnMnXG5pbXBvcnQgTG9jYWxTaG9wU2VydmljZSBmcm9tICcuLi8uLi9sb2NhbC1zaG9wLXNlcnZpY2VzL2xvY2FsLXNob3Atc2VydmljZSdcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5sZXQgbG9nID0gcmVxdWlyZSgnbnBtbG9nJylcblxuY29uc3QgVEFHID0gJ01haW5Db250cm9sbGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYXJ0Q29udHJvbGxlciBleHRlbmRzIEJhc2VDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IgKHNpdGVEYXRhOiBTaXRlRGF0YSkge1xuICAgIHN1cGVyKE9iamVjdC5hc3NpZ24oc2l0ZURhdGEsIHsgdmlld1BhdGg6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi92aWV3cycpIH0pKVxuXG4gICAgLy8gVE9ETzogVGhpcyBzaG91bGQgdGFrZSBpbnRvIGFjY291bnQgdGhlIGNhc2Ugd2hlcmUgbnVtYmVyIHRoaW5nIHRvIGFkZCA+IGF2YWlsYWJsZSBzdG9ja3NcbiAgICB0aGlzLnJvdXRlUG9zdCgnL2FkZC1pdGVtJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBsb2cudmVyYm9zZShUQUcsICcvYWRkLWl0ZW0uUE9TVDonICsgSlNPTi5zdHJpbmdpZnkocmVxLnNlc3Npb24sIG51bGwsIDIpKVxuICAgICAgaWYgKHJlcS5ib2R5LnZhcmlhbnRJZCAmJiByZXEuYm9keS5xdWFudGl0eSkge1xuICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgIHZhcmlhbnRJZDogcmVxLmJvZHkudmFyaWFudElkLFxuICAgICAgICAgIHF1YW50aXR5OiBwYXJzZUludChyZXEuYm9keS5xdWFudGl0eSwgMTApXG4gICAgICAgIH1cbiAgICAgICAgTG9jYWxTaG9wU2VydmljZS5nZXRWYXJpYW50QXZhaWxhYmlsaXR5KHJlcS5ib2R5LnZhcmlhbnRJZCkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgJiYgcmVzcC5kYXRhKSB7XG4gICAgICAgICAgICBpZiAocmVxLnNlc3Npb24pIHtcbiAgICAgICAgICAgICAgQ2FydFNlcnZpY2UuYWRkSXRlbVRvQ2FydChyZXNwLmRhdGEuc3RhdHVzLCByZXEuc2Vzc2lvbi5jYXJ0LCBkYXRhKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgaWYgKHJlcS5zZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5zZXNzaW9uLmNhcnQgPSByZXNwLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IHRydWUsIGRhdGE6IHJlc3AuZGF0YSB9KVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiAnU2Vzc2lvbiBpcyBub3QgZGVmaW5lZCEnIH0pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMuanNvbih7IHN0YXR1czogZmFsc2UsIGVyck1lc3NhZ2U6ICdGYWlsZWQgdG8gZ2V0IHZhcmlhbnQgYXZhaWxhYmlsaXR5OiAnICsgcmVzcC5lcnJNZXNzYWdlIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiAndmFyaWFudElkIGFuZCBxdWFudGl0eSBhcmUgcmVxdWlyZWQhJyB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBVc2VkIGZvciBkZWJ1Z2dpbmcgcHVycG9zZXNcbiAgICB0aGlzLnJvdXRlR2V0KCcvZGV0YWlscycsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgcmVzLmpzb24ocmVxLnNlc3Npb24gPyByZXEuc2Vzc2lvbi5jYXJ0IDogJ1lvdXIgY2FydCBpcyBlbXB0eSEnKVxuICAgIH0pXG5cbiAgICB0aGlzLnJvdXRlUG9zdCgnL3BsYWNlLW9yZGVyJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBpZiAocmVxLnNlc3Npb24pIHtcbiAgICAgICAgQ2FydFNlcnZpY2UucGxhY2VPcmRlcihyZXEuYm9keS5mdWxsTmFtZSwgcmVxLmJvZHkucGhvbmVOdW1iZXIsIHJlcS5ib2R5Lm5vdGVzLCByZXEuc2Vzc2lvbi5jYXJ0KS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgIGlmIChyZXNwLnN0YXR1cykge1xuICAgICAgICAgICAgaWYgKHJlcS5zZXNzaW9uKSB7XG4gICAgICAgICAgICAgIENhcnRTZXJ2aWNlLmVtcHR5Q2FydChyZXEuc2Vzc2lvbi5jYXJ0KS50aGVuKHJlc3AyID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3AyLnN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgbG9nLmVycm9yKFRBRywgJ3BsYWNlLW9yZGVyLlBPU1Q6IGVtcHR5Q2FydCBmYWlsZWQhJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcy5qc29uKHsgc3RhdHVzOiBmYWxzZSwgZXJyTWVzc2FnZTogcmVzcC5lcnJNZXNzYWdlIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChuZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiAnU2Vzc2lvbiBpcyBub3QgZGVmaW5lZCEnIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMucm91dGVHZXQoJy9vcmRlci1wbGFjZWQnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIHJlcy5yZW5kZXIoJ29yZGVyLXBsYWNlZCcpXG4gICAgfSlcblxuICAgIHRoaXMucm91dGVHZXQoJy8nLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGlmIChyZXEuc2Vzc2lvbikge1xuICAgICAgICBDYXJ0U2VydmljZS5nZXRDYXJ0KHJlcS5zZXNzaW9uLmNhcnQpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgaWYgKHJlc3Auc3RhdHVzKSB7XG4gICAgICAgICAgICByZXMubG9jYWxzLmNhcnQgPSByZXNwLmRhdGFcbiAgICAgICAgICAgIHJlcy5yZW5kZXIoJ2NhcnQnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXh0KG5ldyBFcnJvcihyZXNwLmVyck1lc3NhZ2UpKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHQobmV3IEVycm9yKCdTZXNzaW9uIGlzIG5vdCBkZWZpbmVkIScpKVxuICAgICAgfVxuICAgIH0pXG5cbiAgfVxufVxuIl19
