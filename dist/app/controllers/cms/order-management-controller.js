"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const base_controller_1=require("../base-controller"),order_service_1=require("../../../services/local-shop/order-service"),app_config_1=require("../../../app-config"),path=require("path");let log=require("npmlog");const TAG="OrderManagementController";class OrderManagementController extends base_controller_1.default{constructor(e){super(Object.assign(e,{viewPath:path.join(__dirname,"../../views")})),this.addInterceptor((e,r,t)=>{log.verbose(TAG,"req.path="+e.path),log.verbose(TAG,"loggedIn="+e.isAuthenticated()),log.verbose(TAG,"req.on="+JSON.stringify(e.session)),t()}),super.routeGet("/",(e,r,t)=>{r.redirect(`${e.baseUrl}/open-order-management`)}),super.routeGet("/open-order-management",(e,r,t)=>{r.render("cms/open-order-management")}),super.routeGet("/closed-order-management",(e,r,t)=>{r.render("cms/closed-order-management")}),super.routeGet("/open-orders",(e,r,t)=>{order_service_1.default.getOpenOrders().then(r.json.bind(r)).catch(t)}),super.routeGet("/closed-orders",(e,r,t)=>{order_service_1.default.getClosedOrders().then(r.json.bind(r)).catch(t)}),super.routePost("/order",(e,r,t)=>{order_service_1.default.addOrder(e.body).then(r.json.bind(r)).catch(t)}),super.routePost("/order/edit",(e,r,t)=>{order_service_1.default.editOrder(e.body).then(r.json.bind(r)).catch(t)}),super.routePost("/order/cancel",(e,r,t)=>{order_service_1.default.cancelOrder(e.body.id).then(r.json.bind(r)).catch(t)}),super.routePost("/order/close",(e,r,t)=>{const o=e.body.id;order_service_1.default.closeOrder(o).then(e=>e.status?order_service_1.default.printReceipt(`${app_config_1.default.BASE_URL}${this.getRouter().path()}/order/receipt?orderId=${o}&originalCopy=1`,1).then(e=>e.status&&e.data?void r.json({status:!0}):void r.json(e)):void r.json({status:!1,errMessage:e.errMessage}))}),super.routePost("/order/close-po",(e,r,t)=>{const o=e.body.id;order_service_1.default.finishPOOrder(o).then(e=>e.status?order_service_1.default.printReceipt(`${app_config_1.default.BASE_URL}${this.getRouter().path()}/order/receipt?orderId=${o}&originalCopy=1`,1).then(e=>e.status&&e.data?void r.json({status:!0}):void r.json(e)):void r.json({status:!1,errMessage:e.errMessage}))}),super.routePost("/order/print-receipt",(e,r,t)=>{const o=e.body.orderId;order_service_1.default.getReceipt(o).then(e=>e.status?order_service_1.default.printReceipt(`${app_config_1.default.BASE_URL}${this.getRouter().path()}/order/receipt?orderId=${o}`).then(e=>{e.status&&e.data?r.json({status:!0}):r.json(e)}):void r.json({status:!1,errMessage:e.errMessage})).catch(e=>{r.json({status:!1,errMessage:"Error: "+e.message})})}),super.routeGet("/order/receipt",(e,r,t)=>{const o=e.query.orderId,s=e.query.originalCopy;order_service_1.default.getReceipt(o).then(e=>{e.status&&e.data?(console.dir(e.data),r.locals.receipt=e.data,r.locals.originalCopy=s,r.render("cms/receipt")):r.status(500).send("Error: "+e.errMessage)}).catch(t)}),super.routeGet("/order-details",(e,r,t)=>{const o=e.query.orderId;o?order_service_1.default.getOrderDetails(o).then(r.json.bind(r)).catch(t):r.json({status:!1,errMessage:"orderId is required!"})}),super.routePost("/order-detail",(e,r,t)=>{const o=e.query.orderId,s=e.body.variantId,d=e.body.quantity;order_service_1.default.addOrderDetail(o,s,d).then(r.json.bind(r)).catch(t)}),super.routePost("/order-detail/edit",(e,r,t)=>{r.json({status:!1,errMessage:"Not implemented yet!"})}),super.routePost("/order-detail/delete",(e,r,t)=>{const o=e.body.id;order_service_1.default.deleteOrderDetail(o).then(r.json.bind(r)).catch(t)})}}exports.default=OrderManagementController;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHAvY29udHJvbGxlcnMvY21zL29yZGVyLW1hbmFnZW1lbnQtY29udHJvbGxlci50cyJdLCJuYW1lcyI6WyJiYXNlX2NvbnRyb2xsZXJfMSIsInJlcXVpcmUiLCJvcmRlcl9zZXJ2aWNlXzEiLCJhcHBfY29uZmlnXzEiLCJwYXRoIiwibG9nIiwiVEFHIiwiT3JkZXJNYW5hZ2VtZW50Q29udHJvbGxlciIsImRlZmF1bHQiLCJbb2JqZWN0IE9iamVjdF0iLCJzaXRlRGF0YSIsInN1cGVyIiwiT2JqZWN0IiwiYXNzaWduIiwidmlld1BhdGgiLCJqb2luIiwiX19kaXJuYW1lIiwidGhpcyIsImFkZEludGVyY2VwdG9yIiwicmVxIiwicmVzIiwibmV4dCIsInZlcmJvc2UiLCJpc0F1dGhlbnRpY2F0ZWQiLCJKU09OIiwic3RyaW5naWZ5Iiwic2Vzc2lvbiIsInJvdXRlR2V0IiwicmVkaXJlY3QiLCJiYXNlVXJsIiwicmVuZGVyIiwiZ2V0T3Blbk9yZGVycyIsInRoZW4iLCJqc29uIiwiYmluZCIsImNhdGNoIiwiZ2V0Q2xvc2VkT3JkZXJzIiwicm91dGVQb3N0IiwiYWRkT3JkZXIiLCJib2R5IiwiZWRpdE9yZGVyIiwiY2FuY2VsT3JkZXIiLCJpZCIsIm9yZGVySWQiLCJjbG9zZU9yZGVyIiwicmVzcCIsInN0YXR1cyIsInByaW50UmVjZWlwdCIsIkJBU0VfVVJMIiwiZ2V0Um91dGVyIiwiZGF0YSIsImVyck1lc3NhZ2UiLCJmaW5pc2hQT09yZGVyIiwiZ2V0UmVjZWlwdCIsImVyciIsIm1lc3NhZ2UiLCJxdWVyeSIsIm9yaWdpbmFsQ29weSIsImNvbnNvbGUiLCJkaXIiLCJsb2NhbHMiLCJyZWNlaXB0Iiwic2VuZCIsImdldE9yZGVyRGV0YWlscyIsInZhcmlhbnRJZCIsInF1YW50aXR5IiwiYWRkT3JkZXJEZXRhaWwiLCJvcmRlckRldGFpbElkIiwiZGVsZXRlT3JkZXJEZXRhaWwiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoib0VBSUEsTUFBQUEs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QU1kLEdBRXJFRCxFQUFJYSxNQUFPYSxRQUFRLEVBQU9LLFdBQVksMkJBSTFDeEMsTUFBTTBCLFVBQVUsZ0JBQWlCLENBQUNsQixFQUFLQyxFQUFLQyxLQUMxQyxNQUFNc0IsRUFBVXhCLEVBQUlxQyxNQUFNYixRQUNwQnFCLEVBQVk3QyxFQUFJb0IsS0FBS3lCLFVBQ3JCQyxFQUFXOUMsRUFBSW9CLEtBQUswQixTQUMxQi9ELGdCQUFBTSxRQUFhMEQsZUFBZXZCLEVBQVNxQixFQUFXQyxHQUFVakMsS0FBS1osRUFBSWEsS0FBS0MsS0FBS2QsSUFBTWUsTUFBTWQsS0FHM0ZWLE1BQU0wQixVQUFVLHFCQUFzQixDQUFDbEIsRUFBS0MsRUFBS0MsS0FFL0NELEVBQUlhLE1BQU9hLFFBQVEsRUFBT0ssV0FBWSwyQkFHeEN4QyxNQUFNMEIsVUFBVSx1QkFBd0IsQ0FBQ2xCLEVBQUtDLEVBQUtDLEtBQ2pELE1BQU04QyxFQUFnQmhELEVBQUlvQixLQUFLRyxHQUMvQnhDLGdCQUFBTSxRQUFhNEQsa0JBQWtCRCxHQUFlbkMsS0FBS1osRUFBSWEsS0FBS0MsS0FBS2QsSUFBTWUsTUFBTWQsTUFsSm5GZ0QsUUFBQTdELFFBQUFEIiwiZmlsZSI6ImFwcC9jb250cm9sbGVycy9jbXMvb3JkZXItbWFuYWdlbWVudC1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0ICogYXMgUHJvbWlzZSBmcm9tICdibHVlYmlyZCdcbmltcG9ydCAqIGFzIHB1ZyBmcm9tICdwdWcnXG5cbmltcG9ydCBCYXNlQ29udHJvbGxlciBmcm9tICcuLi9iYXNlLWNvbnRyb2xsZXInXG5pbXBvcnQgQ2FydFNlcnZpY2UgZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvY2FydC1zZXJ2aWNlJ1xuaW1wb3J0IHsgU2l0ZURhdGEgfSBmcm9tICcuLi8uLi8uLi9zaXRlLWRlZmluaXRpb25zJ1xuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi4vLi4vLi4vbGlicy91dGlscydcbmltcG9ydCBPcmRlclNlcnZpY2UgZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvbG9jYWwtc2hvcC9vcmRlci1zZXJ2aWNlJ1xuaW1wb3J0IEFwcENvbmZpZyBmcm9tICcuLi8uLi8uLi9hcHAtY29uZmlnJztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5sZXQgbG9nID0gcmVxdWlyZSgnbnBtbG9nJylcblxuY29uc3QgVEFHID0gJ09yZGVyTWFuYWdlbWVudENvbnRyb2xsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yZGVyTWFuYWdlbWVudENvbnRyb2xsZXIgZXh0ZW5kcyBCYXNlQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yIChzaXRlRGF0YTogU2l0ZURhdGEpIHtcbiAgICBzdXBlcihPYmplY3QuYXNzaWduKHNpdGVEYXRhLCB7IHZpZXdQYXRoOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vdmlld3MnKSB9KSlcblxuICAgIHRoaXMuYWRkSW50ZXJjZXB0b3IoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBsb2cudmVyYm9zZShUQUcsICdyZXEucGF0aD0nICsgcmVxLnBhdGgpXG4gICAgICBsb2cudmVyYm9zZShUQUcsICdsb2dnZWRJbj0nICsgcmVxLmlzQXV0aGVudGljYXRlZCgpKVxuICAgICAgbG9nLnZlcmJvc2UoVEFHLCAncmVxLm9uPScgKyBKU09OLnN0cmluZ2lmeShyZXEuc2Vzc2lvbikpXG4gICAgICBuZXh0KClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVHZXQoJy8nLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIHJlcy5yZWRpcmVjdChgJHtyZXEuYmFzZVVybH0vb3Blbi1vcmRlci1tYW5hZ2VtZW50YClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVHZXQoJy9vcGVuLW9yZGVyLW1hbmFnZW1lbnQnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIHJlcy5yZW5kZXIoJ2Ntcy9vcGVuLW9yZGVyLW1hbmFnZW1lbnQnKVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL2Nsb3NlZC1vcmRlci1tYW5hZ2VtZW50JywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICByZXMucmVuZGVyKCdjbXMvY2xvc2VkLW9yZGVyLW1hbmFnZW1lbnQnKVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL29wZW4tb3JkZXJzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBPcmRlclNlcnZpY2UuZ2V0T3Blbk9yZGVycygpLnRoZW4ocmVzLmpzb24uYmluZChyZXMpKS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL2Nsb3NlZC1vcmRlcnMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIE9yZGVyU2VydmljZS5nZXRDbG9zZWRPcmRlcnMoKS50aGVuKHJlcy5qc29uLmJpbmQocmVzKSkuY2F0Y2gobmV4dClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvb3JkZXInLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIE9yZGVyU2VydmljZS5hZGRPcmRlcihyZXEuYm9keSkudGhlbihyZXMuanNvbi5iaW5kKHJlcykpLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL29yZGVyL2VkaXQnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIE9yZGVyU2VydmljZS5lZGl0T3JkZXIocmVxLmJvZHkpLnRoZW4ocmVzLmpzb24uYmluZChyZXMpKS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZVBvc3QoJy9vcmRlci9jYW5jZWwnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIE9yZGVyU2VydmljZS5jYW5jZWxPcmRlcihyZXEuYm9keS5pZCkudGhlbihyZXMuanNvbi5iaW5kKHJlcykpLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL29yZGVyL2Nsb3NlJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBjb25zdCBvcmRlcklkID0gcmVxLmJvZHkuaWRcbiAgICAgIE9yZGVyU2VydmljZS5jbG9zZU9yZGVyKG9yZGVySWQpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIGlmIChyZXNwLnN0YXR1cykge1xuICAgICAgICAgIHJldHVybiBPcmRlclNlcnZpY2UucHJpbnRSZWNlaXB0KGAke0FwcENvbmZpZy5CQVNFX1VSTH0ke3RoaXMuZ2V0Um91dGVyKCkucGF0aCgpfS9vcmRlci9yZWNlaXB0P29yZGVySWQ9JHtvcmRlcklkfSZvcmlnaW5hbENvcHk9MWAsIDEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgJiYgcmVzcC5kYXRhKSB7XG4gICAgICAgICAgICAgIHJlcy5qc29uKHsgc3RhdHVzOiB0cnVlIH0pXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXMuanNvbih7IHN0YXR1czogZmFsc2UsIGVyck1lc3NhZ2U6IHJlc3AuZXJyTWVzc2FnZSB9KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZVBvc3QoJy9vcmRlci9jbG9zZS1wbycsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgY29uc3Qgb3JkZXJJZCA9IHJlcS5ib2R5LmlkXG4gICAgICBPcmRlclNlcnZpY2UuZmluaXNoUE9PcmRlcihvcmRlcklkKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICBpZiAocmVzcC5zdGF0dXMpIHtcbiAgICAgICAgICByZXR1cm4gT3JkZXJTZXJ2aWNlLnByaW50UmVjZWlwdChgJHtBcHBDb25maWcuQkFTRV9VUkx9JHt0aGlzLmdldFJvdXRlcigpLnBhdGgoKX0vb3JkZXIvcmVjZWlwdD9vcmRlcklkPSR7b3JkZXJJZH0mb3JpZ2luYWxDb3B5PTFgLCAxKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzICYmIHJlc3AuZGF0YSkge1xuICAgICAgICAgICAgICByZXMuanNvbih7IHN0YXR1czogdHJ1ZSB9KVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiByZXNwLmVyck1lc3NhZ2UgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvb3JkZXIvcHJpbnQtcmVjZWlwdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgY29uc3Qgb3JkZXJJZCA9IHJlcS5ib2R5Lm9yZGVySWRcbiAgICAgIC8vIFRPRE86IFRoaXMgaXMgdmVyeSBpbmVmZmljaWVudCBiZWNhdXNlIHdlJ3JlIHRlY2huaWNhbGx5IGNhbGxpbmcgZ2V0UmVjZWlwdCgpIHR3aWNlOlxuICAgICAgLy8gSGVyZSwgYW5kIGZyb20gcHJpbnQtc2VydmljZS4gQnV0IGZvciBub3csIHdlJ2xsIGxpdmUgd2l0aCBpdC4uLlxuICAgICAgT3JkZXJTZXJ2aWNlLmdldFJlY2VpcHQob3JkZXJJZCkudGhlbihyZXNwID0+IHtcbiAgICAgICAgaWYgKHJlc3Auc3RhdHVzKSB7XG4gICAgICAgICAgcmV0dXJuIE9yZGVyU2VydmljZS5wcmludFJlY2VpcHQoYCR7QXBwQ29uZmlnLkJBU0VfVVJMfSR7dGhpcy5nZXRSb3V0ZXIoKS5wYXRoKCl9L29yZGVyL3JlY2VpcHQ/b3JkZXJJZD0ke29yZGVySWR9YCkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwLnN0YXR1cyAmJiByZXNwLmRhdGEpIHtcbiAgICAgICAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IHRydWUgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiByZXNwLmVyck1lc3NhZ2UgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiAnRXJyb3I6ICcgKyBlcnIubWVzc2FnZSB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVHZXQoJy9vcmRlci9yZWNlaXB0JywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBjb25zdCBvcmRlcklkID0gcmVxLnF1ZXJ5Lm9yZGVySWRcbiAgICAgIGNvbnN0IG9yaWdpbmFsQ29weSA9IHJlcS5xdWVyeS5vcmlnaW5hbENvcHlcbiAgICAgIE9yZGVyU2VydmljZS5nZXRSZWNlaXB0KG9yZGVySWQpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIGlmIChyZXNwLnN0YXR1cyAmJiByZXNwLmRhdGEpIHtcbiAgICAgICAgICBjb25zb2xlLmRpcihyZXNwLmRhdGEpXG4gICAgICAgICAgLy8gUmVuZGVyIHVzaW5nIHB1Z1xuICAgICAgICAgIHJlcy5sb2NhbHMucmVjZWlwdCA9IHJlc3AuZGF0YVxuICAgICAgICAgIHJlcy5sb2NhbHMub3JpZ2luYWxDb3B5ID0gb3JpZ2luYWxDb3B5XG4gICAgICAgICAgcmVzLnJlbmRlcignY21zL3JlY2VpcHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcy5zdGF0dXMoNTAwKS5zZW5kKCdFcnJvcjogJyArIHJlc3AuZXJyTWVzc2FnZSlcbiAgICAgICAgICAvLyByZXMuanNvbihyZXNwKVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL29yZGVyLWRldGFpbHMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGNvbnN0IG9yZGVySWQgPSByZXEucXVlcnkub3JkZXJJZFxuICAgICAgaWYgKG9yZGVySWQpIHtcbiAgICAgICAgT3JkZXJTZXJ2aWNlLmdldE9yZGVyRGV0YWlscyhvcmRlcklkKS50aGVuKHJlcy5qc29uLmJpbmQocmVzKSkuY2F0Y2gobmV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5qc29uKHsgc3RhdHVzOiBmYWxzZSwgZXJyTWVzc2FnZTogJ29yZGVySWQgaXMgcmVxdWlyZWQhJyB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZVBvc3QoJy9vcmRlci1kZXRhaWwnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGNvbnN0IG9yZGVySWQgPSByZXEucXVlcnkub3JkZXJJZFxuICAgICAgY29uc3QgdmFyaWFudElkID0gcmVxLmJvZHkudmFyaWFudElkXG4gICAgICBjb25zdCBxdWFudGl0eSA9IHJlcS5ib2R5LnF1YW50aXR5XG4gICAgICBPcmRlclNlcnZpY2UuYWRkT3JkZXJEZXRhaWwob3JkZXJJZCwgdmFyaWFudElkLCBxdWFudGl0eSkudGhlbihyZXMuanNvbi5iaW5kKHJlcykpLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL29yZGVyLWRldGFpbC9lZGl0JywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgdGhpcy4gQVRNIHRoaXMgaXMgZGlzYWJsZWQgZnJvbSBVSVxuICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiAnTm90IGltcGxlbWVudGVkIHlldCEnIH0pXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL29yZGVyLWRldGFpbC9kZWxldGUnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGNvbnN0IG9yZGVyRGV0YWlsSWQgPSByZXEuYm9keS5pZFxuICAgICAgT3JkZXJTZXJ2aWNlLmRlbGV0ZU9yZGVyRGV0YWlsKG9yZGVyRGV0YWlsSWQpLnRoZW4ocmVzLmpzb24uYmluZChyZXMpKS5jYXRjaChuZXh0KVxuICAgIH0pXG4gIH1cbn1cbiJdfQ==