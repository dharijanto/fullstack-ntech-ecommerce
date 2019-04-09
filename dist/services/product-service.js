"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const crud_service_1=require("./crud-service");class ProductService extends crud_service_1.CRUDService{getProductsWithPrimaryImage(){return super.getModels("Product").findAll({include:[{model:super.getModels("ProductImage"),where:{primary:!0}},{model:super.getModels("SubCategory"),include:[{model:super.getModels("Category")}]}]}).then(e=>({status:!0,data:e.map(e=>e.get({plain:!0}))}))}createCategory(e){return super.create("Category",e)}getCategory(e){return super.readOne("Category",{id:e})}getCategories(e={},t=!1){return t?this.getModels("Category").findAll({include:[{model:this.getModels("SubCategory")}],where:e}).then(e=>({status:!0,data:e.map(e=>e.get({plain:!0}))})):super.read("Category",e)}updateCategory(e,t){return super.update("Category",t,{id:e})}deleteCategory(e){return super.delete("Category",{id:e})}createSubCategory(e){return super.create("SubCategory",e)}getSubCategories(e){return super.read("SubCategory",e)}getSubCategory(e){return super.getModels("SubCategory").findOne({where:{id:e},include:[{model:super.getModels("Category")}]}).then(t=>t?{status:!0,data:t}:{status:!1,errMessage:`subCategoryId=${e} could not be found!`})}updateSubCategory(e,t){return super.update("SubCategory",t,{id:e})}deleteSubCategory(e){return super.delete("SubCategory",{id:e})}getProductImages(e){return this.getModels("ProductImage").findAll({where:{productId:e}}).then(e=>({status:!0,data:e}))}getProductImage(e){return super.read("ProductImage",{productId:e}).then(e=>{if(e.status){if(e.data&&e.data.length>0){return{status:!0,data:e.data.find(e=>!0===e.primary)||e.data[0]}}return{status:!1,errMessage:"Product has no image!"}}return{status:!1,errMessage:e.errMessage}})}getVariantImage(e){return this.readOne("Variant",{id:e}).then(e=>{if(e.status&&e.data){const t=e.data.productId;return this.getProductImage(t)}return{status:!1,errMessage:e.errMessage}})}}exports.default=new ProductService;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlcy9wcm9kdWN0LXNlcnZpY2UudHMiXSwibmFtZXMiOlsiY3J1ZF9zZXJ2aWNlXzEiLCJyZXF1aXJlIiwiUHJvZHVjdFNlcnZpY2UiLCJDUlVEU2VydmljZSIsIltvYmplY3QgT2JqZWN0XSIsInN1cGVyIiwiZ2V0TW9kZWxzIiwiZmluZEFsbCIsImluY2x1ZGUiLCJtb2RlbCIsIndoZXJlIiwicHJpbWFyeSIsInRoZW4iLCJyZWFkRGF0YSIsInN0YXR1cyIsImRhdGEiLCJtYXAiLCJnZXQiLCJwbGFpbiIsImNyZWF0ZSIsImNhdGVnb3J5SWQiLCJyZWFkT25lIiwiaWQiLCJzZWFyY2hDbGF1c2UiLCJpbmNsdWRlU3ViQ2F0ZWdvcmllcyIsInRoaXMiLCJyZWFkIiwidXBkYXRlIiwiZGVsZXRlIiwic3ViQ2F0ZWdvcnlJZCIsImZpbmRPbmUiLCJlcnJNZXNzYWdlIiwicHJvZHVjdElkIiwicmVzcCIsImxlbmd0aCIsImZpbmQiLCJpbWFnZSIsInZhcmlhbnRJZCIsImdldFByb2R1Y3RJbWFnZSIsImV4cG9ydHMiLCJkZWZhdWx0Il0sIm1hcHBpbmdzIjoib0VBQUEsTUFBQUEsZUFBQUMsUUFBQSx3QkFJQUMsdUJBQTZCRixlQUFBRyxZQUUzQkMsOEJBQ0UsT0FBT0MsTUFBTUMsVUFBVSxXQUFXQyxTQUNoQ0MsVUFFSUMsTUFBT0osTUFBTUMsVUFBVSxnQkFDdkJJLE9BQVNDLFNBQVMsS0FHbEJGLE1BQU9KLE1BQU1DLFVBQVUsZUFDdkJFLFVBQVlDLE1BQU9KLE1BQU1DLFVBQVUsa0JBR3RDTSxLQUFLQyxLQUNHQyxRQUFRLEVBQU1DLEtBQU1GLEVBQVNHLElBQUlELEdBQVFBLEVBQUtFLEtBQU1DLE9BQU8sUUFJeEVkLGVBQWdCVyxHQUNkLE9BQU9WLE1BQU1jLE9BQU8sV0FBWUosR0FHbENYLFlBQWFnQixHQUNYLE9BQU9mLE1BQU1nQixRQUFrQixZQUFjQyxHQUFJRixJQUduRGhCLGNBQWVtQixLQUFzQ0MsR0FBZ0MsR0FDbkYsT0FBSUEsRUFDS0MsS0FBS25CLFVBQVUsWUFBWUMsU0FDaENDLFVBRUlDLE1BQU9nQixLQUFLbkIsVUFBVSxpQkFHMUJJLE1BQU9hLElBQ05YLEtBQUtDLEtBQ0dDLFFBQVEsRUFBTUMsS0FBTUYsRUFBU0csSUFBSUQsR0FBUUEsRUFBS0UsS0FBTUMsT0FBTyxRQUcvRGIsTUFBTXFCLEtBQWUsV0FBWUgsR0FJNUNuQixlQUFnQmtCLEVBQVlQLEdBQzFCLE9BQU9WLE1BQU1zQixPQUFPLFdBQVlaLEdBQVFPLEdBQUFBLElBRzFDbEIsZUFBZ0JrQixHQUNkLE9BQU9qQixNQUFNdUIsT0FBTyxZQUFjTixHQUFBQSxJQUdwQ2xCLGtCQUFtQlcsR0FDakIsT0FBT1YsTUFBTWMsT0FBTyxjQUFlSixHQUdyQ1gsaUJBQWtCbUIsR0FDaEIsT0FBT2xCLE1BQU1xQixLQUFrQixjQUFlSCxHQU9oRG5CLGVBQWdCeUIsR0FDZCxPQUFPeEIsTUFBTUMsVUFBVSxlQUFld0IsU0FDcENwQixPQUFTWSxHQUFJTyxHQUNickIsVUFBWUMsTUFBT0osTUFBTUMsVUFBVSxnQkFDbENNLEtBQUtHLEdBQ0ZBLEdBQ09ELFFBQVEsRUFBTUMsS0FBQUEsSUFFZEQsUUFBUSxFQUFPaUIsNEJBQTZCRiwwQkFLM0R6QixrQkFBbUJrQixFQUFZUCxHQUM3QixPQUFPVixNQUFNc0IsT0FBTyxjQUFlWixHQUFRTyxHQUFBQSxJQUc3Q2xCLGtCQUFtQmtCLEdBQ2pCLE9BQU9qQixNQUFNdUIsT0FBTyxlQUFpQk4sR0FBQUEsSUFHdkNsQixpQkFBa0I0QixHQUNoQixPQUFRUCxLQUFLbkIsVUFBVSxnQkFDcEJDLFNBQVVHLE9BQVNzQixVQUFBQSxLQUFlcEIsS0FBS0csS0FDN0JELFFBQVEsRUFBTUMsS0FBQUEsS0FNN0JYLGdCQUFpQjRCLEdBQ2YsT0FBTzNCLE1BQU1xQixLQUFtQixnQkFDOUJNLFVBQUFBLElBQ0NwQixLQUFLcUIsSUFDTixHQUFJQSxFQUFLbkIsT0FBUSxDQUNmLEdBQUltQixFQUFLbEIsTUFBUWtCLEVBQUtsQixLQUFLbUIsT0FBUyxFQUFHLENBRXJDLE9BQVNwQixRQUFRLEVBQU1DLEtBREtrQixFQUFLbEIsS0FBS29CLEtBQUtDLElBQTJCLElBQWxCQSxFQUFNekIsVUFBcUJzQixFQUFLbEIsS0FBSyxJQUd6RixPQUFTRCxRQUFRLEVBQU9pQixXQUFZLHlCQUd0QyxPQUFTakIsUUFBUSxFQUFPaUIsV0FBWUUsRUFBS0YsY0FLL0MzQixnQkFBaUJpQyxHQUNmLE9BQU9aLEtBQUtKLFFBQWlCLFdBQzNCQyxHQUFJZSxJQUNIekIsS0FBS3FCLElBQ04sR0FBSUEsRUFBS25CLFFBQVVtQixFQUFLbEIsS0FBTSxDQUM1QixNQUFNaUIsRUFBWUMsRUFBS2xCLEtBQUtpQixVQUM1QixPQUFPUCxLQUFLYSxnQkFBZ0JOLEdBRTVCLE9BQVNsQixRQUFRLEVBQU9pQixXQUFZRSxFQUFLRixlQU1qRFEsUUFBQUMsUUFBZSxJQUFJdEMiLCJmaWxlIjoic2VydmljZXMvcHJvZHVjdC1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ1JVRFNlcnZpY2UgfSBmcm9tICcuL2NydWQtc2VydmljZSdcbmltcG9ydCB7IE1vZGVsIH0gZnJvbSAnc2VxdWVsaXplJ1xuaW1wb3J0ICogYXMgUHJvbWlzZSBmcm9tICdibHVlYmlyZCdcblxuY2xhc3MgUHJvZHVjdFNlcnZpY2UgZXh0ZW5kcyBDUlVEU2VydmljZSB7XG4gIC8vIEdldCBhbGwgcHJvZHVjdHMgd2l0aCBvbmx5IHRoZWlyIHByaW1hcnkgaW1hZ2VcbiAgZ2V0UHJvZHVjdHNXaXRoUHJpbWFyeUltYWdlICgpOiBQcm9taXNlPE5DUmVzcG9uc2U8UHJvZHVjdFtdPj4ge1xuICAgIHJldHVybiBzdXBlci5nZXRNb2RlbHMoJ1Byb2R1Y3QnKS5maW5kQWxsPFByb2R1Y3Q+KHtcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGVsOiBzdXBlci5nZXRNb2RlbHMoJ1Byb2R1Y3RJbWFnZScpLFxuICAgICAgICAgIHdoZXJlOiB7IHByaW1hcnk6IHRydWUgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbW9kZWw6IHN1cGVyLmdldE1vZGVscygnU3ViQ2F0ZWdvcnknKSxcbiAgICAgICAgICBpbmNsdWRlOiBbeyBtb2RlbDogc3VwZXIuZ2V0TW9kZWxzKCdDYXRlZ29yeScpIH1dXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KS50aGVuKHJlYWREYXRhID0+IHtcbiAgICAgIHJldHVybiB7IHN0YXR1czogdHJ1ZSwgZGF0YTogcmVhZERhdGEubWFwKGRhdGEgPT4gZGF0YS5nZXQoeyBwbGFpbjogdHJ1ZSB9KSkgfVxuICAgIH0pXG4gIH1cblxuICBjcmVhdGVDYXRlZ29yeSAoZGF0YTogUGFydGlhbDxDYXRlZ29yeT4pIHtcbiAgICByZXR1cm4gc3VwZXIuY3JlYXRlKCdDYXRlZ29yeScsIGRhdGEpXG4gIH1cblxuICBnZXRDYXRlZ29yeSAoY2F0ZWdvcnlJZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHN1cGVyLnJlYWRPbmU8Q2F0ZWdvcnk+KCdDYXRlZ29yeScsIHsgaWQ6IGNhdGVnb3J5SWQgfSlcbiAgfVxuXG4gIGdldENhdGVnb3JpZXMgKHNlYXJjaENsYXVzZTogUGFydGlhbDxDYXRlZ29yeT4gPSB7fSwgaW5jbHVkZVN1YkNhdGVnb3JpZXM6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8TkNSZXNwb25zZTxDYXRlZ29yeVtdPj4ge1xuICAgIGlmIChpbmNsdWRlU3ViQ2F0ZWdvcmllcykge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxzKCdDYXRlZ29yeScpLmZpbmRBbGw8Q2F0ZWdvcnk+KHtcbiAgICAgICAgaW5jbHVkZTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1vZGVsOiB0aGlzLmdldE1vZGVscygnU3ViQ2F0ZWdvcnknKVxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgd2hlcmU6IHNlYXJjaENsYXVzZVxuICAgICAgfSkudGhlbihyZWFkRGF0YSA9PiB7XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogdHJ1ZSwgZGF0YTogcmVhZERhdGEubWFwKGRhdGEgPT4gZGF0YS5nZXQoeyBwbGFpbjogdHJ1ZSB9KSkgfVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLnJlYWQ8Q2F0ZWdvcnk+KCdDYXRlZ29yeScsIHNlYXJjaENsYXVzZSlcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDYXRlZ29yeSAoaWQ6IG51bWJlciwgZGF0YTogUGFydGlhbDxDYXRlZ29yeT4pIHtcbiAgICByZXR1cm4gc3VwZXIudXBkYXRlKCdDYXRlZ29yeScsIGRhdGEsIHsgaWQgfSlcbiAgfVxuXG4gIGRlbGV0ZUNhdGVnb3J5IChpZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZSgnQ2F0ZWdvcnknLCB7IGlkIH0pXG4gIH1cblxuICBjcmVhdGVTdWJDYXRlZ29yeSAoZGF0YTogUGFydGlhbDxTdWJDYXRlZ29yeT4pIHtcbiAgICByZXR1cm4gc3VwZXIuY3JlYXRlKCdTdWJDYXRlZ29yeScsIGRhdGEpXG4gIH1cblxuICBnZXRTdWJDYXRlZ29yaWVzIChzZWFyY2hDbGF1c2UpOiBQcm9taXNlPE5DUmVzcG9uc2U8U3ViQ2F0ZWdvcnlbXT4+IHtcbiAgICByZXR1cm4gc3VwZXIucmVhZDxTdWJDYXRlZ29yeT4oJ1N1YkNhdGVnb3J5Jywgc2VhcmNoQ2xhdXNlKVxuICB9XG5cbiAgLyogZ2V0U3ViQ2F0ZWdvcnkgKHNlYXJjaENsYXVzZTogUGFydGlhbDxDYXRlZ29yeT4pIHtcbiAgICByZXR1cm4gc3VwZXIucmVhZE9uZTxTdWJDYXRlZ29yeT4oJ1N1YkNhdGVnb3J5Jywgc2VhcmNoQ2xhdXNlKVxuICB9ICovXG5cbiAgZ2V0U3ViQ2F0ZWdvcnkgKHN1YkNhdGVnb3J5SWQ6IG51bWJlcikge1xuICAgIHJldHVybiBzdXBlci5nZXRNb2RlbHMoJ1N1YkNhdGVnb3J5JykuZmluZE9uZSh7XG4gICAgICB3aGVyZTogeyBpZDogc3ViQ2F0ZWdvcnlJZCB9LFxuICAgICAgaW5jbHVkZTogW3sgbW9kZWw6IHN1cGVyLmdldE1vZGVscygnQ2F0ZWdvcnknKSB9XVxuICAgIH0pLnRoZW4oZGF0YSA9PiB7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4geyBzdGF0dXM6IHRydWUsIGRhdGEgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBmYWxzZSwgZXJyTWVzc2FnZTogYHN1YkNhdGVnb3J5SWQ9JHtzdWJDYXRlZ29yeUlkfSBjb3VsZCBub3QgYmUgZm91bmQhYCB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHVwZGF0ZVN1YkNhdGVnb3J5IChpZDogbnVtYmVyLCBkYXRhOiBQYXJ0aWFsPFN1YkNhdGVnb3J5Pikge1xuICAgIHJldHVybiBzdXBlci51cGRhdGUoJ1N1YkNhdGVnb3J5JywgZGF0YSwgeyBpZCB9KVxuICB9XG5cbiAgZGVsZXRlU3ViQ2F0ZWdvcnkgKGlkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gc3VwZXIuZGVsZXRlKCdTdWJDYXRlZ29yeScsIHsgaWQgfSlcbiAgfVxuXG4gIGdldFByb2R1Y3RJbWFnZXMgKHByb2R1Y3RJZDogbnVtYmVyKTogUHJvbWlzZTxOQ1Jlc3BvbnNlPFByb2R1Y3RJbWFnZVtdPj4ge1xuICAgIHJldHVybiAodGhpcy5nZXRNb2RlbHMoJ1Byb2R1Y3RJbWFnZScpIGFzIE1vZGVsPFByb2R1Y3RJbWFnZSwgUGFydGlhbDxQcm9kdWN0SW1hZ2U+PilcbiAgICAgIC5maW5kQWxsKHsgd2hlcmU6IHsgcHJvZHVjdElkIH0gfSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiB0cnVlLCBkYXRhIH1cbiAgICAgIH0pXG4gIH1cblxuICAvLyBUcnkgdG8gcmV0dXJuIHByaW1hcnkgaW1hZ2UsIGlmIG5vdCBhdmFpbGFibGUsIHJldHVybiB0aGUgZmlyc3RcbiAgLy8gaW1hZ2UgYXZhaWxhYmxlXG4gIGdldFByb2R1Y3RJbWFnZSAocHJvZHVjdElkKTogUHJvbWlzZTxOQ1Jlc3BvbnNlPFByb2R1Y3RJbWFnZT4+IHtcbiAgICByZXR1cm4gc3VwZXIucmVhZDxQcm9kdWN0SW1hZ2U+KCdQcm9kdWN0SW1hZ2UnLCB7XG4gICAgICBwcm9kdWN0SWRcbiAgICB9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgaWYgKHJlc3Auc3RhdHVzKSB7XG4gICAgICAgIGlmIChyZXNwLmRhdGEgJiYgcmVzcC5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBpbWFnZTogUHJvZHVjdEltYWdlID0gcmVzcC5kYXRhLmZpbmQoaW1hZ2UgPT4gaW1hZ2UucHJpbWFyeSA9PT0gdHJ1ZSkgfHwgcmVzcC5kYXRhWzBdXG4gICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiB0cnVlLCBkYXRhOiBpbWFnZSB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiBmYWxzZSwgZXJyTWVzc2FnZTogJ1Byb2R1Y3QgaGFzIG5vIGltYWdlIScgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4geyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiByZXNwLmVyck1lc3NhZ2UgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBnZXRWYXJpYW50SW1hZ2UgKHZhcmlhbnRJZCk6IFByb21pc2U8TkNSZXNwb25zZTxQcm9kdWN0SW1hZ2U+PiB7XG4gICAgcmV0dXJuIHRoaXMucmVhZE9uZTxWYXJpYW50PignVmFyaWFudCcsIHtcbiAgICAgIGlkOiB2YXJpYW50SWRcbiAgICB9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgaWYgKHJlc3Auc3RhdHVzICYmIHJlc3AuZGF0YSkge1xuICAgICAgICBjb25zdCBwcm9kdWN0SWQgPSByZXNwLmRhdGEucHJvZHVjdElkXG4gICAgICAgIHJldHVybiB0aGlzLmdldFByb2R1Y3RJbWFnZShwcm9kdWN0SWQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4geyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiByZXNwLmVyck1lc3NhZ2UgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFByb2R1Y3RTZXJ2aWNlKClcbiJdfQ==
