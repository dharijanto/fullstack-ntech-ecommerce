"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const Sequelize=require("sequelize");function addTables(e,i){return i.Category=e.define("category",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},name:{type:Sequelize.STRING,unique:!0,allowNull:!1,validate:{len:[1,255]}},description:{type:Sequelize.STRING}}),i.SubCategory=e.define("subCategory",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},name:{type:Sequelize.STRING,allowNull:!1},description:{type:Sequelize.STRING}},{indexes:[{fields:["categoryId","name"],unique:!0}]}),i.SubCategory.belongsTo(i.Category),i.Product=e.define("product",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},name:{type:Sequelize.STRING,allowNull:!1},price:{type:Sequelize.INTEGER},description:{type:Sequelize.TEXT}},{indexes:[{fields:["subCategoryId","name"],unique:!0}]}),i.Product.belongsTo(i.SubCategory),i.Variant=e.define("variant",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},name:{type:Sequelize.STRING,unique:!0,allowNull:!1}},{indexes:[{fields:["productId","name"],unique:!0}]}),i.Variant.belongsTo(i.Product),i.Picture=e.define("picture",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},url:{type:Sequelize.STRING}}),i.Variant.hasMany(i.Picture),i.Supplier=e.define("supplier",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},name:{type:Sequelize.STRING,allowNull:!1},location:{type:Sequelize.STRING,allowNull:!1},city:{type:Sequelize.STRING},pickup:{type:Sequelize.BOOLEAN},courier:{type:Sequelize.BOOLEAN}}),i.Shop=e.define("shop",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},name:{type:Sequelize.STRING,allowNull:!1},city:{type:Sequelize.STRING},address:{type:Sequelize.STRING},zipCode:{type:Sequelize.INTEGER}}),i.Stock=e.define("stock",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},quantity:{type:Sequelize.INTEGER},purchasePrice:{type:Sequelize.INTEGER}}),i.Stock.belongsTo(i.Variant),i.Transaction=e.define("transaction",{id:{type:Sequelize.INTEGER,primaryKey:!0,autoIncrement:!0},quantity:{type:Sequelize.INTEGER}}),i.Transaction.belongsTo(i.Variant),i.Stock.belongsTo(i.Variant),i}exports.default=addTables,module.exports=addTables;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kYi1zdHJ1Y3R1cmUudHMiXSwibmFtZXMiOlsiU2VxdWVsaXplIiwicmVxdWlyZSIsImFkZFRhYmxlcyIsInNlcXVlbGl6ZSIsIm1vZGVscyIsIkNhdGVnb3J5IiwiZGVmaW5lIiwiaWQiLCJ0eXBlIiwiSU5URUdFUiIsInByaW1hcnlLZXkiLCJhdXRvSW5jcmVtZW50IiwibmFtZSIsIlNUUklORyIsInVuaXF1ZSIsImFsbG93TnVsbCIsInZhbGlkYXRlIiwibGVuIiwiZGVzY3JpcHRpb24iLCJTdWJDYXRlZ29yeSIsImluZGV4ZXMiLCJmaWVsZHMiLCJiZWxvbmdzVG8iLCJQcm9kdWN0IiwicHJpY2UiLCJURVhUIiwiVmFyaWFudCIsIlBpY3R1cmUiLCJ1cmwiLCJoYXNNYW55IiwiU3VwcGxpZXIiLCJsb2NhdGlvbiIsImNpdHkiLCJwaWNrdXAiLCJCT09MRUFOIiwiY291cmllciIsIlNob3AiLCJhZGRyZXNzIiwiemlwQ29kZSIsIlN0b2NrIiwicXVhbnRpdHkiLCJwdXJjaGFzZVByaWNlIiwiVHJhbnNhY3Rpb24iLCJleHBvcnRzIiwiZGVmYXVsdCIsIm1vZHVsZSJdLCJtYXBwaW5ncyI6Im9FQUFBLE1BQUFBLFVBQUFDLFFBQUEsYUFFQSxTQUFBQyxVQUFtQ0MsRUFBZ0NDLEdBK0VqRSxPQTlFQUEsRUFBT0MsU0FBV0YsRUFBVUcsT0FBTyxZQUNqQ0MsSUFBTUMsS0FBTVIsVUFBVVMsUUFBU0MsWUFBWSxFQUFNQyxlQUFlLEdBQ2hFQyxNQUFRSixLQUFNUixVQUFVYSxPQUFRQyxRQUFRLEVBQU1DLFdBQVcsRUFBT0MsVUFBWUMsS0FBTSxFQUFHLE9BQ3JGQyxhQUFlVixLQUFNUixVQUFVYSxVQUdqQ1QsRUFBT2UsWUFBY2hCLEVBQVVHLE9BQWlDLGVBQzlEQyxJQUFNQyxLQUFNUixVQUFVUyxRQUFTQyxZQUFZLEVBQU1DLGVBQWUsR0FDaEVDLE1BQVFKLEtBQU1SLFVBQVVhLE9BQVFFLFdBQVcsR0FDM0NHLGFBQWVWLEtBQU1SLFVBQVVhLFVBRS9CTyxVQUNJQyxRQUFTLGFBQWMsUUFBU1AsUUFBUSxNQUc5Q1YsRUFBT2UsWUFBWUcsVUFBVWxCLEVBQU9DLFVBRXBDRCxFQUFPbUIsUUFBVXBCLEVBQVVHLE9BQU8sV0FDaENDLElBQU1DLEtBQU1SLFVBQVVTLFFBQVNDLFlBQVksRUFBTUMsZUFBZSxHQUNoRUMsTUFBUUosS0FBTVIsVUFBVWEsT0FBUUUsV0FBVyxHQUMzQ1MsT0FBU2hCLEtBQU1SLFVBQVVTLFNBQ3pCUyxhQUFlVixLQUFNUixVQUFVeUIsUUFFL0JMLFVBQ0lDLFFBQVMsZ0JBQWlCLFFBQVNQLFFBQVEsTUFHakRWLEVBQU9tQixRQUFRRCxVQUFVbEIsRUFBT2UsYUFFaENmLEVBQU9zQixRQUFVdkIsRUFBVUcsT0FBTyxXQUNoQ0MsSUFBTUMsS0FBTVIsVUFBVVMsUUFBU0MsWUFBWSxFQUFNQyxlQUFlLEdBQ2hFQyxNQUFRSixLQUFNUixVQUFVYSxPQUFRQyxRQUFRLEVBQU1DLFdBQVcsS0FFekRLLFVBQ0lDLFFBQVMsWUFBYSxRQUFTUCxRQUFRLE1BRzdDVixFQUFPc0IsUUFBUUosVUFBVWxCLEVBQU9tQixTQUVoQ25CLEVBQU91QixRQUFVeEIsRUFBVUcsT0FBTyxXQUNoQ0MsSUFBTUMsS0FBTVIsVUFBVVMsUUFBU0MsWUFBWSxFQUFNQyxlQUFlLEdBQ2hFaUIsS0FBT3BCLEtBQU1SLFVBQVVhLFVBRXpCVCxFQUFPc0IsUUFBUUcsUUFBUXpCLEVBQU91QixTQUU5QnZCLEVBQU8wQixTQUFXM0IsRUFBVUcsT0FBTyxZQUNqQ0MsSUFBTUMsS0FBTVIsVUFBVVMsUUFBU0MsWUFBWSxFQUFNQyxlQUFlLEdBQ2hFQyxNQUFRSixLQUFNUixVQUFVYSxPQUFTRSxXQUFXLEdBQzVDZ0IsVUFBWXZCLEtBQU1SLFVBQVVhLE9BQVFFLFdBQVcsR0FDL0NpQixNQUFReEIsS0FBTVIsVUFBVWEsUUFDeEJvQixRQUFVekIsS0FBTVIsVUFBVWtDLFNBQzFCQyxTQUFXM0IsS0FBTVIsVUFBVWtDLFdBRzdCOUIsRUFBT2dDLEtBQU9qQyxFQUFVRyxPQUFPLFFBQzdCQyxJQUFNQyxLQUFNUixVQUFVUyxRQUFTQyxZQUFZLEVBQU1DLGVBQWUsR0FDaEVDLE1BQVFKLEtBQU1SLFVBQVVhLE9BQVFFLFdBQVcsR0FDM0NpQixNQUFReEIsS0FBTVIsVUFBVWEsUUFDeEJ3QixTQUFXN0IsS0FBTVIsVUFBVWEsUUFDM0J5QixTQUFXOUIsS0FBTVIsVUFBVVMsV0FHN0JMLEVBQU9tQyxNQUFRcEMsRUFBVUcsT0FBTyxTQUM5QkMsSUFBTUMsS0FBTVIsVUFBVVMsUUFBU0MsWUFBWSxFQUFNQyxlQUFlLEdBQ2hFNkIsVUFBWWhDLEtBQU1SLFVBQVVTLFNBQzVCZ0MsZUFBaUJqQyxLQUFNUixVQUFVUyxXQUduQ0wsRUFBT21DLE1BQU1qQixVQUFVbEIsRUFBT3NCLFNBRTlCdEIsRUFBT3NDLFlBQWN2QyxFQUFVRyxPQUFPLGVBQ3BDQyxJQUFNQyxLQUFNUixVQUFVUyxRQUFTQyxZQUFZLEVBQU1DLGVBQWUsR0FDaEU2QixVQUFZaEMsS0FBTVIsVUFBVVMsV0FHOUJMLEVBQU9zQyxZQUFZcEIsVUFBVWxCLEVBQU9zQixTQUNwQ3RCLEVBQU9tQyxNQUFNakIsVUFBVWxCLEVBQU9zQixTQUV2QnRCLEVBL0VUdUMsUUFBQUMsUUFBQTFDLFVBa0ZBMkMsT0FBT0YsUUFBVXpDIiwiZmlsZSI6ImRiLXN0cnVjdHVyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFNlcXVlbGl6ZSBmcm9tICdzZXF1ZWxpemUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZFRhYmxlcyAoc2VxdWVsaXplOiBTZXF1ZWxpemUuU2VxdWVsaXplLCBtb2RlbHM6IFNlcXVlbGl6ZS5Nb2RlbHMpIHtcbiAgbW9kZWxzLkNhdGVnb3J5ID0gc2VxdWVsaXplLmRlZmluZSgnY2F0ZWdvcnknLCB7XG4gICAgaWQ6IHsgdHlwZTogU2VxdWVsaXplLklOVEVHRVIsIHByaW1hcnlLZXk6IHRydWUsIGF1dG9JbmNyZW1lbnQ6IHRydWUgfSxcbiAgICBuYW1lOiB7IHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcsIHVuaXF1ZTogdHJ1ZSwgYWxsb3dOdWxsOiBmYWxzZSwgdmFsaWRhdGU6IHsgbGVuOiBbMSwgMjU1XSB9IH0sXG4gICAgZGVzY3JpcHRpb246IHsgdHlwZTogU2VxdWVsaXplLlNUUklORyB9XG4gIH0pXG5cbiAgbW9kZWxzLlN1YkNhdGVnb3J5ID0gc2VxdWVsaXplLmRlZmluZTxTdWJDYXRlZ29yeSwgU3ViQ2F0ZWdvcnk+KCdzdWJDYXRlZ29yeScsIHtcbiAgICBpZDogeyB0eXBlOiBTZXF1ZWxpemUuSU5URUdFUiwgcHJpbWFyeUtleTogdHJ1ZSwgYXV0b0luY3JlbWVudDogdHJ1ZSB9LFxuICAgIG5hbWU6IHsgdHlwZTogU2VxdWVsaXplLlNUUklORywgYWxsb3dOdWxsOiBmYWxzZSB9LFxuICAgIGRlc2NyaXB0aW9uOiB7IHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcgfVxuICB9LCB7XG4gICAgaW5kZXhlczogW1xuICAgICAgeyBmaWVsZHM6IFsnY2F0ZWdvcnlJZCcsICduYW1lJ10sIHVuaXF1ZTogdHJ1ZSB9XG4gICAgXVxuICB9KVxuICBtb2RlbHMuU3ViQ2F0ZWdvcnkuYmVsb25nc1RvKG1vZGVscy5DYXRlZ29yeSlcblxuICBtb2RlbHMuUHJvZHVjdCA9IHNlcXVlbGl6ZS5kZWZpbmUoJ3Byb2R1Y3QnLCB7XG4gICAgaWQ6IHsgdHlwZTogU2VxdWVsaXplLklOVEVHRVIsIHByaW1hcnlLZXk6IHRydWUsIGF1dG9JbmNyZW1lbnQ6IHRydWUgfSxcbiAgICBuYW1lOiB7IHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcsIGFsbG93TnVsbDogZmFsc2UgfSxcbiAgICBwcmljZTogeyB0eXBlOiBTZXF1ZWxpemUuSU5URUdFUiB9LFxuICAgIGRlc2NyaXB0aW9uOiB7IHR5cGU6IFNlcXVlbGl6ZS5URVhUIH1cbiAgfSwge1xuICAgIGluZGV4ZXM6IFtcbiAgICAgIHsgZmllbGRzOiBbJ3N1YkNhdGVnb3J5SWQnLCAnbmFtZSddLCB1bmlxdWU6IHRydWUgfVxuICAgIF1cbiAgfSlcbiAgbW9kZWxzLlByb2R1Y3QuYmVsb25nc1RvKG1vZGVscy5TdWJDYXRlZ29yeSlcblxuICBtb2RlbHMuVmFyaWFudCA9IHNlcXVlbGl6ZS5kZWZpbmUoJ3ZhcmlhbnQnLCB7XG4gICAgaWQ6IHsgdHlwZTogU2VxdWVsaXplLklOVEVHRVIsIHByaW1hcnlLZXk6IHRydWUsIGF1dG9JbmNyZW1lbnQ6IHRydWUgfSxcbiAgICBuYW1lOiB7IHR5cGU6IFNlcXVlbGl6ZS5TVFJJTkcsIHVuaXF1ZTogdHJ1ZSwgYWxsb3dOdWxsOiBmYWxzZSB9XG4gIH0sIHtcbiAgICBpbmRleGVzOiBbXG4gICAgICB7IGZpZWxkczogWydwcm9kdWN0SWQnLCAnbmFtZSddLCB1bmlxdWU6IHRydWUgfVxuICAgIF1cbiAgfSlcbiAgbW9kZWxzLlZhcmlhbnQuYmVsb25nc1RvKG1vZGVscy5Qcm9kdWN0KVxuXG4gIG1vZGVscy5QaWN0dXJlID0gc2VxdWVsaXplLmRlZmluZSgncGljdHVyZScsIHtcbiAgICBpZDogeyB0eXBlOiBTZXF1ZWxpemUuSU5URUdFUiwgcHJpbWFyeUtleTogdHJ1ZSwgYXV0b0luY3JlbWVudDogdHJ1ZSB9LFxuICAgIHVybDogeyB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HIH1cbiAgfSlcbiAgbW9kZWxzLlZhcmlhbnQuaGFzTWFueShtb2RlbHMuUGljdHVyZSlcblxuICBtb2RlbHMuU3VwcGxpZXIgPSBzZXF1ZWxpemUuZGVmaW5lKCdzdXBwbGllcicsIHtcbiAgICBpZDogeyB0eXBlOiBTZXF1ZWxpemUuSU5URUdFUiwgcHJpbWFyeUtleTogdHJ1ZSwgYXV0b0luY3JlbWVudDogdHJ1ZSB9LFxuICAgIG5hbWU6IHsgdHlwZTogU2VxdWVsaXplLlNUUklORyAsIGFsbG93TnVsbDogZmFsc2UgfSxcbiAgICBsb2NhdGlvbjogeyB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HLCBhbGxvd051bGw6IGZhbHNlIH0sXG4gICAgY2l0eTogeyB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HIH0sXG4gICAgcGlja3VwOiB7IHR5cGU6IFNlcXVlbGl6ZS5CT09MRUFOIH0sXG4gICAgY291cmllcjogeyB0eXBlOiBTZXF1ZWxpemUuQk9PTEVBTiB9XG4gIH0pXG5cbiAgbW9kZWxzLlNob3AgPSBzZXF1ZWxpemUuZGVmaW5lKCdzaG9wJywge1xuICAgIGlkOiB7IHR5cGU6IFNlcXVlbGl6ZS5JTlRFR0VSLCBwcmltYXJ5S2V5OiB0cnVlLCBhdXRvSW5jcmVtZW50OiB0cnVlIH0sXG4gICAgbmFtZTogeyB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HLCBhbGxvd051bGw6IGZhbHNlIH0sXG4gICAgY2l0eTogeyB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HIH0sXG4gICAgYWRkcmVzczogeyB0eXBlOiBTZXF1ZWxpemUuU1RSSU5HIH0sXG4gICAgemlwQ29kZTogeyB0eXBlOiBTZXF1ZWxpemUuSU5URUdFUiB9XG4gIH0pXG5cbiAgbW9kZWxzLlN0b2NrID0gc2VxdWVsaXplLmRlZmluZSgnc3RvY2snLCB7XG4gICAgaWQ6IHsgdHlwZTogU2VxdWVsaXplLklOVEVHRVIsIHByaW1hcnlLZXk6IHRydWUsIGF1dG9JbmNyZW1lbnQ6IHRydWUgfSxcbiAgICBxdWFudGl0eTogeyB0eXBlOiBTZXF1ZWxpemUuSU5URUdFUiB9LFxuICAgIHB1cmNoYXNlUHJpY2U6IHsgdHlwZTogU2VxdWVsaXplLklOVEVHRVIgfVxuICB9KVxuXG4gIG1vZGVscy5TdG9jay5iZWxvbmdzVG8obW9kZWxzLlZhcmlhbnQpXG5cbiAgbW9kZWxzLlRyYW5zYWN0aW9uID0gc2VxdWVsaXplLmRlZmluZSgndHJhbnNhY3Rpb24nLCB7XG4gICAgaWQ6IHsgdHlwZTogU2VxdWVsaXplLklOVEVHRVIsIHByaW1hcnlLZXk6IHRydWUsIGF1dG9JbmNyZW1lbnQ6IHRydWUgfSxcbiAgICBxdWFudGl0eTogeyB0eXBlOiBTZXF1ZWxpemUuSU5URUdFUiB9XG4gIH0pXG5cbiAgbW9kZWxzLlRyYW5zYWN0aW9uLmJlbG9uZ3NUbyhtb2RlbHMuVmFyaWFudClcbiAgbW9kZWxzLlN0b2NrLmJlbG9uZ3NUbyhtb2RlbHMuVmFyaWFudClcblxuICByZXR1cm4gbW9kZWxzXG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkVGFibGVzXG4iXX0=