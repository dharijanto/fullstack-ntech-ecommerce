"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const base_controller_1=require("./base-controller"),product_service_1=require("../../services/product-service"),Utils=require("../../libs/utils");let log=require("npmlog");const TAG="ProductManagementController";class ProductManagementController extends base_controller_1.default{constructor(e){super(e,!1),this.imageService=new e.services.ImageService(e.db.sequelize,e.db.models),this.imageURLFormatter=Utils.getImageURL,super.routePost("/category",(e,t,r)=>{product_service_1.default.createCategory(e.body).then(e=>{t.json(e)}).catch(r)}),super.routeGet("/categories",(e,t,r)=>{product_service_1.default.getCategories().then(e=>{t.json(e)}).catch(r)}),super.routePost("/category/edit",(e,t,r)=>{product_service_1.default.updateCategory(e.body.id,e.body).then(e=>{t.json(e)}).catch(r)}),super.routePost("/category/delete",(e,t,r)=>{product_service_1.default.deleteCategory(e.body.id).then(e=>{t.json(e)}).catch(r)}),super.routePost("/subCategory",(e,t,r)=>{e.query.categoryId?product_service_1.default.createSubCategory(Object.assign({},e.body,{categoryId:e.query.categoryId})).then(e=>{t.json(e)}).catch(r):t.json({status:!1,errMessage:"Category is needed"})}),super.routeGet("/subCategories",(e,t,r)=>{product_service_1.default.getSubCategories({categoryId:e.query.categoryId}).then(e=>{t.json(e)}).catch(r)}),super.routePost("/subCategory/edit",(e,t,r)=>{product_service_1.default.updateSubCategory(e.body.id,e.body).then(e=>{t.json(e)}).catch(r)}),super.routePost("/subCategory/delete",(e,t,r)=>{product_service_1.default.deleteSubCategory(e.body.id).then(e=>{t.json(e)}).catch(r)}),super.routePost("/product",(e,t,r)=>{e.query.subCategoryId?product_service_1.default.create("Product",Object.assign({},e.body,{subCategoryId:e.query.subCategoryId})).then(e=>{t.json(e)}).catch(r):t.json({status:!1,errMessage:"Sub-Category is needed"})}),super.routeGet("/products",(e,t,r)=>{const o=e.query.subCategoryId?{subCategoryId:e.query.subCategoryId}:{};product_service_1.default.read("Product",o).then(e=>{t.json(e)}).catch(r)}),super.routePost("/product/edit",(e,t,r)=>{product_service_1.default.update("Product",e.body,{id:e.body.id}).then(e=>{t.json(e)}).catch(r)}),super.routePost("/product/delete",(e,t,r)=>{product_service_1.default.delete("Product",{id:e.body.id}).then(e=>{t.json(e)}).catch(r)}),super.routePost("/variant",(e,t,r)=>{e.query.productId?product_service_1.default.create("Variant",Object.assign({},e.body,{productId:e.query.productId})).then(e=>{t.json(e)}).catch(r):t.json({status:!1,errMessage:"Product is needed"})}),super.routeGet("/variants",(e,t,r)=>{product_service_1.default.read("Variant",{productId:e.query.productId}).then(e=>{t.json(e)}).catch(r)}),super.routePost("/variant/edit",(e,t,r)=>{product_service_1.default.update("Variant",e.body,{id:e.body.id}).then(e=>{t.json(e)}).catch(r)}),super.routePost("/variant/delete",(e,t,r)=>{product_service_1.default.delete("Variant",{id:e.body.id}).then(e=>{t.json(e)}).catch(r)}),super.routeGet("/variant/qr-code",(e,t,r)=>{const o=e.query.variantId;o?product_service_1.default.readOne("Variant",{id:o}).then(e=>{if(e.status&&e.data)return t.locals.serializedQRData=e.data.id,t.locals.variant=e.data,product_service_1.default.readOne("Product",{id:e.data.productId}).then(e=>{if(!e.status||!e.data)throw new Error(e.errMessage);t.locals.product=e.data,t.render("qrcode")});throw new Error(e.errMessage)}).catch(r):t.status(500).send("variantId is required!")}),super.routeGet("/product/description",(e,t,r)=>{const o=e.query.id;product_service_1.default.readOne("Product",{id:o}).then(e=>{e.status?(t.locals.product=e.data,t.render("product-description")):t.json(e)}).catch(r)}),super.routeGet("/product/images",(e,t,r)=>{const o=e.query.productId;product_service_1.default.getProductImages(o).then(e=>{t.json(e)}).catch(r)}),super.routePost("/product/image",(e,t,r)=>{const o=e.query.productId;product_service_1.default.create("ProductImage",Object.assign(e.body,{productId:o})).then(e=>{t.json(e)}).catch(r)}),super.routePost("/product/image/edit",(e,t,r)=>{const o=e.body.id;product_service_1.default.update("ProductImage",e.body,{id:o}).then(e=>{t.json(e)}).catch(r)}),super.routePost("/product/image/delete",(e,t,r)=>{product_service_1.default.delete("ProductImage",{id:e.body.id}).then(e=>{t.json(e)}).catch(r)}),super.routePost("/product/image/get-url",(e,t,r)=>{const o=e.body.filename;t.json({status:!0,data:this.imageURLFormatter(o)})})}}exports.default=ProductManagementController;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbXMvY29udHJvbGxlcnMvcHJvZHVjdC1tYW5hZ2VtZW50LWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOlsiYmFzZV9jb250cm9sbGVyXzEiLCJyZXF1aXJlIiwicHJvZHVjdF9zZXJ2aWNlXzEiLCJVdGlscyIsImxvZyIsIlRBRyIsIlByb2R1Y3RNYW5hZ2VtZW50Q29udHJvbGxlciIsImRlZmF1bHQiLCJbb2JqZWN0IE9iamVjdF0iLCJpbml0RGF0YSIsInN1cGVyIiwidGhpcyIsImltYWdlU2VydmljZSIsInNlcnZpY2VzIiwiSW1hZ2VTZXJ2aWNlIiwiZGIiLCJzZXF1ZWxpemUiLCJtb2RlbHMiLCJpbWFnZVVSTEZvcm1hdHRlciIsImdldEltYWdlVVJMIiwicm91dGVQb3N0IiwicmVxIiwicmVzIiwibmV4dCIsImNyZWF0ZUNhdGVnb3J5IiwiYm9keSIsInRoZW4iLCJyZXNwIiwianNvbiIsImNhdGNoIiwicm91dGVHZXQiLCJnZXRDYXRlZ29yaWVzIiwidXBkYXRlQ2F0ZWdvcnkiLCJpZCIsImRlbGV0ZUNhdGVnb3J5IiwicXVlcnkiLCJjYXRlZ29yeUlkIiwiY3JlYXRlU3ViQ2F0ZWdvcnkiLCJPYmplY3QiLCJhc3NpZ24iLCJzdGF0dXMiLCJlcnJNZXNzYWdlIiwiZ2V0U3ViQ2F0ZWdvcmllcyIsInVwZGF0ZVN1YkNhdGVnb3J5IiwiZGVsZXRlU3ViQ2F0ZWdvcnkiLCJzdWJDYXRlZ29yeUlkIiwiY3JlYXRlIiwic2VhcmNoQ2xhdXNlIiwicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSIsInByb2R1Y3RJZCIsInZhcmlhbnRJZCIsInJlYWRPbmUiLCJkYXRhIiwibG9jYWxzIiwic2VyaWFsaXplZFFSRGF0YSIsInZhcmlhbnQiLCJyZXNwMiIsIkVycm9yIiwicHJvZHVjdCIsInJlbmRlciIsInNlbmQiLCJnZXRQcm9kdWN0SW1hZ2VzIiwiZmlsZW5hbWUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoib0VBQ0EsTUFBQUEsa0JBQUFDLFFBQUEs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QixFQUFJYyxNQUFNZ0IsVUFDNUJqRCxrQkFBQUssUUFBZXVDLE9BQXFCLGVBQWdCUixPQUFPQyxPQUFPbEIsRUFBSUksTUFBUTBCLFVBQUFBLEtBQWN6QixLQUFLQyxJQUMvRkwsRUFBSU0sS0FBS0QsS0FDUkUsTUFBTU4sS0FHWGIsTUFBTVUsVUFBVSxzQkFBdUIsQ0FBQ0MsRUFBS0MsRUFBS0MsS0FDaEQsTUFBTVUsRUFBS1osRUFBSUksS0FBS1EsR0FDcEIvQixrQkFBQUssUUFBZTBDLE9BQXFCLGVBQWdCNUIsRUFBSUksTUFBUVEsR0FBQUEsSUFBTVAsS0FBS0MsSUFDekVMLEVBQUlNLEtBQUtELEtBQ1JFLE1BQU1OLEtBR1hiLE1BQU1VLFVBQVUsd0JBQXlCLENBQUNDLEVBQUtDLEVBQUtDLEtBQ2xEckIsa0JBQUFLLFFBQWUyQyxPQUFxQixnQkFBa0JqQixHQUFJWixFQUFJSSxLQUFLUSxLQUFNUCxLQUFLQyxJQUM1RUwsRUFBSU0sS0FBS0QsS0FDUkUsTUFBTU4sS0FHWGIsTUFBTVUsVUFBVSx5QkFBMEIsQ0FBQ0MsRUFBS0MsRUFBS0MsS0FDbkQsTUFBTXlDLEVBQVczQyxFQUFJSSxLQUFLdUMsU0FDMUIxQyxFQUFJTSxNQUFPWSxRQUFRLEVBQU1jLEtBQU0zQyxLQUFLTyxrQkFBa0I4QyxRQTFMNURDLFFBQUExRCxRQUFBRCIsImZpbGUiOiJjbXMvY29udHJvbGxlcnMvcHJvZHVjdC1tYW5hZ2VtZW50LWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgQmFzZUNvbnRyb2xsZXIgZnJvbSAnLi9iYXNlLWNvbnRyb2xsZXInXG5pbXBvcnQgUHJvZHVjdFNlcnZpY2UgZnJvbSAnLi4vLi4vc2VydmljZXMvcHJvZHVjdC1zZXJ2aWNlJ1xuaW1wb3J0IHsgSW1hZ2VTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2l0ZS1kZWZpbml0aW9ucydcblxuaW1wb3J0ICogYXMgVXRpbHMgZnJvbSAnLi4vLi4vbGlicy91dGlscydcblxuaW1wb3J0IEFwcENvbmZpZyBmcm9tICcuLi8uLi9hcHAtY29uZmlnJ1xuXG5sZXQgbG9nID0gcmVxdWlyZSgnbnBtbG9nJylcblxuY29uc3QgVEFHID0gJ1Byb2R1Y3RNYW5hZ2VtZW50Q29udHJvbGxlcidcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2R1Y3RNYW5hZ2VtZW50Q29udHJvbGxlciBleHRlbmRzIEJhc2VDb250cm9sbGVyIHtcbiAgcHJpdmF0ZSBpbWFnZVNlcnZpY2U6IEltYWdlU2VydmljZVxuICBwcml2YXRlIHJlYWRvbmx5IGltYWdlVVJMRm9ybWF0dGVyXG4gIGNvbnN0cnVjdG9yIChpbml0RGF0YSkge1xuICAgIHN1cGVyKGluaXREYXRhLCBmYWxzZSlcbiAgICB0aGlzLmltYWdlU2VydmljZSA9IG5ldyBpbml0RGF0YS5zZXJ2aWNlcy5JbWFnZVNlcnZpY2UoaW5pdERhdGEuZGIuc2VxdWVsaXplLCBpbml0RGF0YS5kYi5tb2RlbHMpXG4gICAgdGhpcy5pbWFnZVVSTEZvcm1hdHRlciA9IFV0aWxzLmdldEltYWdlVVJMLy8gZmlsZW5hbWUgPT4gYCR7QXBwQ29uZmlnLkJBU0VfVVJMfSR7QXBwQ29uZmlnLklNQUdFX01PVU5UX1BBVEh9JHtmaWxlbmFtZX1gXG5cbiAgICAvLyBQcm9kdWN0LU1hbmFnZW1lbnRcbiAgICBzdXBlci5yb3V0ZVBvc3QoJy9jYXRlZ29yeScsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgUHJvZHVjdFNlcnZpY2UuY3JlYXRlQ2F0ZWdvcnkocmVxLmJvZHkpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICB9KS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL2NhdGVnb3JpZXMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIFByb2R1Y3RTZXJ2aWNlLmdldENhdGVnb3JpZXMoKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICByZXMuanNvbihyZXNwKVxuICAgICAgfSkuY2F0Y2gobmV4dClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvY2F0ZWdvcnkvZWRpdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgUHJvZHVjdFNlcnZpY2UudXBkYXRlQ2F0ZWdvcnkocmVxLmJvZHkuaWQsIHJlcS5ib2R5KS50aGVuKHJlc3AgPT4ge1xuICAgICAgICByZXMuanNvbihyZXNwKVxuICAgICAgfSkuY2F0Y2gobmV4dClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvY2F0ZWdvcnkvZGVsZXRlJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBQcm9kdWN0U2VydmljZS5kZWxldGVDYXRlZ29yeShyZXEuYm9keS5pZCkudGhlbihyZXNwID0+IHtcbiAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgIH0pLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL3N1YkNhdGVnb3J5JywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBpZiAocmVxLnF1ZXJ5LmNhdGVnb3J5SWQpIHtcbiAgICAgICAgUHJvZHVjdFNlcnZpY2UuY3JlYXRlU3ViQ2F0ZWdvcnkoeyAuLi5yZXEuYm9keSwgY2F0ZWdvcnlJZDogcmVxLnF1ZXJ5LmNhdGVnb3J5SWQgfSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICByZXMuanNvbihyZXNwKVxuICAgICAgICB9KS5jYXRjaChuZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLmpzb24oeyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiAnQ2F0ZWdvcnkgaXMgbmVlZGVkJyB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL3N1YkNhdGVnb3JpZXMnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIFByb2R1Y3RTZXJ2aWNlLmdldFN1YkNhdGVnb3JpZXMoeyBjYXRlZ29yeUlkOiByZXEucXVlcnkuY2F0ZWdvcnlJZCB9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgICByZXMuanNvbihyZXNwKVxuICAgICAgfSkuY2F0Y2gobmV4dClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvc3ViQ2F0ZWdvcnkvZWRpdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgUHJvZHVjdFNlcnZpY2UudXBkYXRlU3ViQ2F0ZWdvcnkocmVxLmJvZHkuaWQsIHJlcS5ib2R5KS50aGVuKHJlc3AgPT4ge1xuICAgICAgICByZXMuanNvbihyZXNwKVxuICAgICAgfSkuY2F0Y2gobmV4dClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvc3ViQ2F0ZWdvcnkvZGVsZXRlJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBQcm9kdWN0U2VydmljZS5kZWxldGVTdWJDYXRlZ29yeShyZXEuYm9keS5pZCkudGhlbihyZXNwID0+IHtcbiAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgIH0pLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL3Byb2R1Y3QnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGlmIChyZXEucXVlcnkuc3ViQ2F0ZWdvcnlJZCkge1xuICAgICAgICBQcm9kdWN0U2VydmljZS5jcmVhdGUoJ1Byb2R1Y3QnLCB7IC4uLnJlcS5ib2R5LCBzdWJDYXRlZ29yeUlkOiByZXEucXVlcnkuc3ViQ2F0ZWdvcnlJZCB9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICAgIH0pLmNhdGNoKG5leHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMuanNvbih7IHN0YXR1czogZmFsc2UsIGVyck1lc3NhZ2U6ICdTdWItQ2F0ZWdvcnkgaXMgbmVlZGVkJyB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL3Byb2R1Y3RzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBjb25zdCBzZWFyY2hDbGF1c2UgPSByZXEucXVlcnkuc3ViQ2F0ZWdvcnlJZCA/IHsgc3ViQ2F0ZWdvcnlJZDogcmVxLnF1ZXJ5LnN1YkNhdGVnb3J5SWQgfSA6IHt9XG4gICAgICBQcm9kdWN0U2VydmljZS5yZWFkPFByb2R1Y3Q+KCdQcm9kdWN0Jywgc2VhcmNoQ2xhdXNlKS50aGVuKHJlc3AgPT4ge1xuICAgICAgICByZXMuanNvbihyZXNwKVxuICAgICAgfSkuY2F0Y2gobmV4dClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvcHJvZHVjdC9lZGl0JywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBQcm9kdWN0U2VydmljZS51cGRhdGUoJ1Byb2R1Y3QnLCByZXEuYm9keSwgeyBpZDogcmVxLmJvZHkuaWQgfSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgIH0pLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL3Byb2R1Y3QvZGVsZXRlJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBQcm9kdWN0U2VydmljZS5kZWxldGUoJ1Byb2R1Y3QnLCB7IGlkOiByZXEuYm9keS5pZCB9KS50aGVuKHJlc3AgPT4ge1xuICAgICAgICByZXMuanNvbihyZXNwKVxuICAgICAgfSkuY2F0Y2gobmV4dClcbiAgICB9KVxuXG4gICAgc3VwZXIucm91dGVQb3N0KCcvdmFyaWFudCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgaWYgKHJlcS5xdWVyeS5wcm9kdWN0SWQpIHtcbiAgICAgICAgUHJvZHVjdFNlcnZpY2UuY3JlYXRlKCdWYXJpYW50JywgeyAuLi5yZXEuYm9keSwgcHJvZHVjdElkOiByZXEucXVlcnkucHJvZHVjdElkIH0pLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgICAgfSkuY2F0Y2gobmV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5qc29uKHsgc3RhdHVzOiBmYWxzZSwgZXJyTWVzc2FnZTogJ1Byb2R1Y3QgaXMgbmVlZGVkJyB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL3ZhcmlhbnRzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBQcm9kdWN0U2VydmljZS5yZWFkPFZhcmlhbnQ+KCdWYXJpYW50JywgeyBwcm9kdWN0SWQ6IHJlcS5xdWVyeS5wcm9kdWN0SWQgfSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgIH0pLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL3ZhcmlhbnQvZWRpdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgUHJvZHVjdFNlcnZpY2UudXBkYXRlKCdWYXJpYW50JywgcmVxLmJvZHksIHsgaWQ6IHJlcS5ib2R5LmlkIH0pLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICB9KS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZVBvc3QoJy92YXJpYW50L2RlbGV0ZScsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgUHJvZHVjdFNlcnZpY2UuZGVsZXRlKCdWYXJpYW50JywgeyBpZDogcmVxLmJvZHkuaWQgfSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgIH0pLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlR2V0KCcvdmFyaWFudC9xci1jb2RlJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBjb25zdCB2YXJpYW50SWQgPSByZXEucXVlcnkudmFyaWFudElkXG4gICAgICBpZiAodmFyaWFudElkKSB7XG4gICAgICAgIFByb2R1Y3RTZXJ2aWNlLnJlYWRPbmU8VmFyaWFudD4oJ1ZhcmlhbnQnLCB7IGlkOiB2YXJpYW50SWQgfSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgICBpZiAocmVzcC5zdGF0dXMgJiYgcmVzcC5kYXRhKSB7XG4gICAgICAgICAgICByZXMubG9jYWxzLnNlcmlhbGl6ZWRRUkRhdGEgPSByZXNwLmRhdGEuaWRcbiAgICAgICAgICAgIHJlcy5sb2NhbHMudmFyaWFudCA9IHJlc3AuZGF0YVxuICAgICAgICAgICAgcmV0dXJuIFByb2R1Y3RTZXJ2aWNlLnJlYWRPbmU8UHJvZHVjdD4oJ1Byb2R1Y3QnLCB7IGlkOiByZXNwLmRhdGEucHJvZHVjdElkIH0pLnRoZW4ocmVzcDIgPT4ge1xuICAgICAgICAgICAgICBpZiAocmVzcDIuc3RhdHVzICYmIHJlc3AyLmRhdGEpIHtcbiAgICAgICAgICAgICAgICByZXMubG9jYWxzLnByb2R1Y3QgPSByZXNwMi5kYXRhXG4gICAgICAgICAgICAgICAgLy8gUVJDb2RlIGNvbnRhaW5zIHZhcmlhbnRJZFxuICAgICAgICAgICAgICAgIHJlcy5yZW5kZXIoJ3FyY29kZScpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3AyLmVyck1lc3NhZ2UpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwLmVyck1lc3NhZ2UpXG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChuZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoJ3ZhcmlhbnRJZCBpcyByZXF1aXJlZCEnKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBQcm9kdWN0IERlc2NyaXB0aW9uXG4gICAgc3VwZXIucm91dGVHZXQoJy9wcm9kdWN0L2Rlc2NyaXB0aW9uJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHJlcS5xdWVyeS5pZFxuICAgICAgUHJvZHVjdFNlcnZpY2UucmVhZE9uZTxQcm9kdWN0PignUHJvZHVjdCcsIHsgaWQgfSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgaWYgKHJlc3Auc3RhdHVzKSB7XG4gICAgICAgICAgcmVzLmxvY2Fscy5wcm9kdWN0ID0gcmVzcC5kYXRhXG4gICAgICAgICAgcmVzLnJlbmRlcigncHJvZHVjdC1kZXNjcmlwdGlvbicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLyogbmV4dChuZXcgRXJyb3IoJ1Byb2R1Y3QgZG9lcyBub3QgZXhpc3QnKSkgKi9cbiAgICAgICAgICByZXMuanNvbihyZXNwKVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZUdldCgnL3Byb2R1Y3QvaW1hZ2VzJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICBjb25zdCBwcm9kdWN0SWQgPSByZXEucXVlcnkucHJvZHVjdElkXG4gICAgICBQcm9kdWN0U2VydmljZS5nZXRQcm9kdWN0SW1hZ2VzKHByb2R1Y3RJZCkudGhlbihyZXNwID0+IHtcbiAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgIH0pLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL3Byb2R1Y3QvaW1hZ2UnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGNvbnN0IHByb2R1Y3RJZCA9IHJlcS5xdWVyeS5wcm9kdWN0SWRcbiAgICAgIFByb2R1Y3RTZXJ2aWNlLmNyZWF0ZTxQcm9kdWN0SW1hZ2U+KCdQcm9kdWN0SW1hZ2UnLCBPYmplY3QuYXNzaWduKHJlcS5ib2R5LCB7IHByb2R1Y3RJZCB9KSkudGhlbihyZXNwID0+IHtcbiAgICAgICAgcmVzLmpzb24ocmVzcClcbiAgICAgIH0pLmNhdGNoKG5leHQpXG4gICAgfSlcblxuICAgIHN1cGVyLnJvdXRlUG9zdCgnL3Byb2R1Y3QvaW1hZ2UvZWRpdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgY29uc3QgaWQgPSByZXEuYm9keS5pZFxuICAgICAgUHJvZHVjdFNlcnZpY2UudXBkYXRlPFByb2R1Y3RJbWFnZT4oJ1Byb2R1Y3RJbWFnZScsIHJlcS5ib2R5LCB7IGlkIH0pLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICB9KS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZVBvc3QoJy9wcm9kdWN0L2ltYWdlL2RlbGV0ZScsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgUHJvZHVjdFNlcnZpY2UuZGVsZXRlPFByb2R1Y3RJbWFnZT4oJ1Byb2R1Y3RJbWFnZScsIHsgaWQ6IHJlcS5ib2R5LmlkIH0pLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIHJlcy5qc29uKHJlc3ApXG4gICAgICB9KS5jYXRjaChuZXh0KVxuICAgIH0pXG5cbiAgICBzdXBlci5yb3V0ZVBvc3QoJy9wcm9kdWN0L2ltYWdlL2dldC11cmwnLCAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gcmVxLmJvZHkuZmlsZW5hbWVcbiAgICAgIHJlcy5qc29uKHsgc3RhdHVzOiB0cnVlLCBkYXRhOiB0aGlzLmltYWdlVVJMRm9ybWF0dGVyKGZpbGVuYW1lKSB9KVxuICAgIH0pXG4gIH1cbn1cbiJdfQ==
