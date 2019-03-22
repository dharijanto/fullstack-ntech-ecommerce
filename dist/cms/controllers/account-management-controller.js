"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const base_controller_1=require("./base-controller"),account_service_1=require("../../services/account-service");let log=require("npmlog");const TAG="ProductManagementController";class AccountManagementController extends base_controller_1.default{constructor(e){super(e,!1),super.routeGet("/",(e,t,c)=>{t.render("account-management")}),super.routeGet("/accounts",(e,t,c)=>{account_service_1.default.getAccounts(e.query.shopId).then(t.json.bind(t)).catch(c)}),super.routePost("/account",(e,t,c)=>{account_service_1.default.createAccount(e.query.shopId,e.body).then(t.json.bind(t)).catch(c)}),super.routePost("/account/edit",(e,t,c)=>{account_service_1.default.updateAccount(e.query.shopId,e.body.id,e.body).then(t.json.bind(t)).catch(c)}),super.routePost("/account/delete",(e,t,c)=>{account_service_1.default.deleteAccount(e.body.id).then(t.json.bind(t)).catch(c)})}}exports.default=AccountManagementController;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbXMvY29udHJvbGxlcnMvYWNjb3VudC1tYW5hZ2VtZW50LWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOlsiYmFzZV9jb250cm9sbGVyXzEiLCJyZXF1aXJlIiwiYWNjb3VudF9zZXJ2aWNlXzEiLCJsb2ciLCJUQUciLCJBY2NvdW50TWFuYWdlbWVudENvbnRyb2xsZXIiLCJkZWZhdWx0IiwiW29iamVjdCBPYmplY3RdIiwiaW5pdERhdGEiLCJzdXBlciIsInJvdXRlR2V0IiwicmVxIiwicmVzIiwibmV4dCIsInJlbmRlciIsImdldEFjY291bnRzIiwicXVlcnkiLCJzaG9wSWQiLCJ0aGVuIiwianNvbiIsImJpbmQiLCJjYXRjaCIsInJvdXRlUG9zdCIsImNyZWF0ZUFjY291bnQiLCJib2R5IiwidXBkYXRlQWNjb3VudCIsImlkIiwiZGVsZXRlQWNjb3VudCIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJvRUFDQSxNQUFBQSxrQkFBQUMsUUFBQSxxQkFLQUMsa0JBQUFELFFBQUEsa0NBRUEsSUFBSUUsSUFBTUYsUUFBUSxVQUVsQixNQUFNRyxJQUFNLG9DQUNaQyxvQ0FBeURMLGtCQUFBTSxRQUN2REMsWUFBYUMsR0FDWEMsTUFBTUQsR0FBVSxHQUNoQkMsTUFBTUMsU0FBUyxJQUFLLENBQUNDLEVBQUtDLEVBQUtDLEtBQzdCRCxFQUFJRSxPQUFPLHdCQUdiTCxNQUFNQyxTQUFTLFlBQWEsQ0FBQ0MsRUFBS0MsRUFBS0MsS0FDckNYLGtCQUFBSSxRQUFlUyxZQUFZSixFQUFJSyxNQUFNQyxRQUFRQyxLQUFLTixFQUFJTyxLQUFLQyxLQUFLUixJQUFNUyxNQUFNUixLQUc5RUosTUFBTWEsVUFBVSxXQUFZLENBQUNYLEVBQUtDLEVBQUtDLEtBQ3JDWCxrQkFBQUksUUFBZWlCLGNBQWNaLEVBQUlLLE1BQU1DLE9BQVFOLEVBQUlhLE1BQU1OLEtBQUtOLEVBQUlPLEtBQUtDLEtBQUtSLElBQU1TLE1BQU1SLEtBRzFGSixNQUFNYSxVQUFVLGdCQUFpQixDQUFDWCxFQUFLQyxFQUFLQyxLQUMxQ1gsa0JBQUFJLFFBQWVtQixjQUFjZCxFQUFJSyxNQUFNQyxPQUFRTixFQUFJYSxLQUFLRSxHQUFJZixFQUFJYSxNQUFNTixLQUFLTixFQUFJTyxLQUFLQyxLQUFLUixJQUFNUyxNQUFNUixLQUd2R0osTUFBTWEsVUFBVSxrQkFBbUIsQ0FBQ1gsRUFBS0MsRUFBS0MsS0FDNUNYLGtCQUFBSSxRQUFlcUIsY0FBY2hCLEVBQUlhLEtBQUtFLElBQUlSLEtBQUtOLEVBQUlPLEtBQUtDLEtBQUtSLElBQU1TLE1BQU1SLE1BcEIvRWUsUUFBQXRCLFFBQUFEIiwiZmlsZSI6ImNtcy9jb250cm9sbGVycy9hY2NvdW50LW1hbmFnZW1lbnQtY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBCYXNlQ29udHJvbGxlciBmcm9tICcuL2Jhc2UtY29udHJvbGxlcidcbmltcG9ydCBQcm9kdWN0U2VydmljZSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wcm9kdWN0LXNlcnZpY2UnXG5pbXBvcnQgeyBJbWFnZVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zaXRlLWRlZmluaXRpb25zJ1xuXG5pbXBvcnQgQXBwQ29uZmlnIGZyb20gJy4uLy4uL2FwcC1jb25maWcnXG5pbXBvcnQgQWNjb3VudFNlcnZpY2UgZnJvbSAnLi4vLi4vc2VydmljZXMvYWNjb3VudC1zZXJ2aWNlJ1xuXG5sZXQgbG9nID0gcmVxdWlyZSgnbnBtbG9nJylcblxuY29uc3QgVEFHID0gJ1Byb2R1Y3RNYW5hZ2VtZW50Q29udHJvbGxlcidcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjY291bnRNYW5hZ2VtZW50Q29udHJvbGxlciBleHRlbmRzIEJhc2VDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IgKGluaXREYXRhKSB7XG4gICAgc3VwZXIoaW5pdERhdGEsIGZhbHNlKVxuICAgIHN1cGVyLnJvdXRlR2V0KCcvJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICByZXMucmVuZGVyKCdhY2NvdW50LW1hbmFnZW1lbnQnKVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL2FjY291bnRzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBBY2NvdW50U2VydmljZS5nZXRBY2NvdW50cyhyZXEucXVlcnkuc2hvcElkKS50aGVuKHJlcy5qc29uLmJpbmQocmVzKSkuY2F0Y2gobmV4dClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvYWNjb3VudCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgQWNjb3VudFNlcnZpY2UuY3JlYXRlQWNjb3VudChyZXEucXVlcnkuc2hvcElkLCByZXEuYm9keSkudGhlbihyZXMuanNvbi5iaW5kKHJlcykpLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL2FjY291bnQvZWRpdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgQWNjb3VudFNlcnZpY2UudXBkYXRlQWNjb3VudChyZXEucXVlcnkuc2hvcElkLCByZXEuYm9keS5pZCwgcmVxLmJvZHkpLnRoZW4ocmVzLmpzb24uYmluZChyZXMpKS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZVBvc3QoJy9hY2NvdW50L2RlbGV0ZScsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgQWNjb3VudFNlcnZpY2UuZGVsZXRlQWNjb3VudChyZXEuYm9keS5pZCkudGhlbihyZXMuanNvbi5iaW5kKHJlcykpLmNhdGNoKG5leHQpXG4gICAgfSlcbiAgfVxufVxuIl19