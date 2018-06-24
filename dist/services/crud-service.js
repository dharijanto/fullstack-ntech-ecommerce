"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const sequelize_service_1=require("./sequelize-service");let log=require("npmlog");const TAG="BaseService";class CRUDService{getModels(e){return sequelize_service_1.default.getInstance().models[e]}errHandler(e){if(e.name)return{status:!1,errMessage:e.message};throw e}create(e,t){return log.verbose(TAG,`create(): modelName=${e} data=${JSON.stringify(t)}`),this.getModels(e).create(Object.assign(t,{id:null})).then(e=>({status:!0,data:e.get({plain:!0})})).catch(this.errHandler)}read(e,t){return log.verbose(TAG,`read(): modelName=${e} searchClause=${JSON.stringify(t)}`),this.getModels(e).findAll({where:t}).then(e=>({status:!0,data:e.map(e=>e.get({plain:!0}))})).catch(this.errHandler)}readOne(e,t){return this.getModels(e).findOne({where:t}).then(e=>e?{status:!0,data:(e.get({plain:!0})||[])[0]}:{status:!1,errMessage:"Data not found"}).catch(this.errHandler)}update(e,t,r){return log.verbose(TAG,`update(): modelName=${e} data=${JSON.stringify(t)}`),this.getModels(e).update(t,{where:r}).spread(e=>e>0?{status:!0,data:e}:{status:!1,errMessage:"Data not found"}).catch(this.errHandler)}delete(e,t){return log.verbose(TAG,`delete(): modelName=${e} searchClause=${JSON.stringify(t)}`),this.getModels(e).destroy({where:t}).then(e=>e>0?{status:!0,data:e}:{status:!1,errMessage:"Data not found"}).catch(this.errHandler)}}exports.CRUDService=CRUDService,exports.default=CRUDService;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlcy9jcnVkLXNlcnZpY2UudHMiXSwibmFtZXMiOlsic2VxdWVsaXplX3NlcnZpY2VfMSIsInJlcXVpcmUiLCJsb2ciLCJUQUciLCJDUlVEU2VydmljZSIsIltvYmplY3QgT2JqZWN0XSIsIm5hbWUiLCJkZWZhdWx0IiwiZ2V0SW5zdGFuY2UiLCJtb2RlbHMiLCJlcnIiLCJzdGF0dXMiLCJlcnJNZXNzYWdlIiwibWVzc2FnZSIsIm1vZGVsTmFtZSIsImRhdGEiLCJ2ZXJib3NlIiwiSlNPTiIsInN0cmluZ2lmeSIsInRoaXMiLCJnZXRNb2RlbHMiLCJjcmVhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJpZCIsInRoZW4iLCJjcmVhdGVkRGF0YSIsImdldCIsInBsYWluIiwiY2F0Y2giLCJlcnJIYW5kbGVyIiwic2VhcmNoQ2xhdXNlIiwiZmluZEFsbCIsIndoZXJlIiwicmVhZERhdGEiLCJtYXAiLCJmaW5kT25lIiwidXBkYXRlIiwic3ByZWFkIiwiY291bnQiLCJkZXN0cm95IiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Im9FQUFBLE1BQUFBLG9CQUFBQyxRQUFBLHVCQUdBLElBQUlDLElBQU1ELFFBQVEsVUFFbEIsTUFBTUUsSUFBTSxvQkFFWkMsWUFDWUMsVUFBV0MsR0FDbkIsT0FBT04sb0JBQUFPLFFBQWlCQyxjQUFjQyxPQUFPSCxHQUd2Q0QsV0FBWUssR0FDbEIsR0FBSUEsRUFBSUosS0FDTixPQUFTSyxRQUFRLEVBQU9DLFdBQVlGLEVBQUlHLFNBRXhDLE1BQU1ILEVBSVZMLE9BQTZCUyxFQUFtQkMsR0FFOUMsT0FEQWIsSUFBSWMsUUFBUWIsMkJBQTRCVyxVQUFrQkcsS0FBS0MsVUFBVUgsTUFDakVJLEtBQUtDLFVBQVVOLEdBQThDTyxPQUFPQyxPQUFPQyxPQUFPUixHQUFRUyxHQUFJLFFBQVNDLEtBQUtDLEtBQ3pHZixRQUFRLEVBQU1JLEtBQU1XLEVBQVlDLEtBQU1DLE9BQU8sT0FDckRDLE1BQU1WLEtBQUtXLFlBUWhCekIsS0FBNEJTLEVBQW1CaUIsR0FFN0MsT0FEQTdCLElBQUljLFFBQVFiLHlCQUEwQlcsa0JBQTBCRyxLQUFLQyxVQUFVYSxNQUN2RVosS0FBS0MsVUFBVU4sR0FBOENrQixTQUFVQyxNQUFPRixJQUFnQk4sS0FBS1MsS0FDaEd2QixRQUFRLEVBQU1JLEtBQU1tQixFQUFTQyxJQUFJcEIsR0FBUUEsRUFBS1ksS0FBTUMsT0FBTyxRQUNuRUMsTUFBTVYsS0FBS1csWUFHaEJ6QixRQUErQlMsRUFBbUJpQixHQUNoRCxPQUFRWixLQUFLQyxVQUFVTixHQUE4Q3NCLFNBQVVILE1BQU9GLElBQWdCTixLQUFLUyxHQUNyR0EsR0FDT3ZCLFFBQVEsRUFBTUksTUFBT21CLEVBQVNQLEtBQU1DLE9BQU8sU0FBZSxLQUUxRGpCLFFBQVEsRUFBT0MsV0FBWSxtQkFFckNpQixNQUFNVixLQUFLVyxZQUdoQnpCLE9BQThCUyxFQUFtQkMsRUFBa0JnQixHQUVqRSxPQURBN0IsSUFBSWMsUUFBUWIsMkJBQTRCVyxVQUFrQkcsS0FBS0MsVUFBVUgsTUFDakVJLEtBQUtDLFVBQVVOLEdBQ3BCdUIsT0FBT3RCLEdBQVFrQixNQUFPRixJQUF1Qk8sT0FBUUMsR0FDaERBLEVBQVEsR0FDRDVCLFFBQVEsRUFBTUksS0FBTXdCLElBRXBCNUIsUUFBUSxFQUFPQyxXQUFZLG1CQUVyQ2lCLE1BQU1WLEtBQUtXLFlBR2xCekIsT0FBOEJTLEVBQW1CaUIsR0FFL0MsT0FEQTdCLElBQUljLFFBQVFiLDJCQUE0Qlcsa0JBQTBCRyxLQUFLQyxVQUFVYSxNQUN6RVosS0FBS0MsVUFBVU4sR0FDcEIwQixTQUFVUCxNQUFPRixJQUF1Qk4sS0FBTWMsR0FDekNBLEVBQVEsR0FDRDVCLFFBQVEsRUFBTUksS0FBTXdCLElBRXBCNUIsUUFBUSxFQUFPQyxXQUFZLG1CQUVyQ2lCLE1BQU1WLEtBQUtXLGFBL0RwQlcsUUFBQXJDLFlBQUFBLFlBbUVBcUMsUUFBQWxDLFFBQWVIIiwiZmlsZSI6InNlcnZpY2VzL2NydWQtc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXF1ZWxpemVTZXJ2aWNlIGZyb20gJy4vc2VxdWVsaXplLXNlcnZpY2UnXG5pbXBvcnQgeyBNb2RlbCwgSW5zdGFuY2UsIFdoZXJlT3B0aW9ucywgVXBkYXRlT3B0aW9ucyB9IGZyb20gJ3NlcXVlbGl6ZSdcbmltcG9ydCAqIGFzIFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnXG5sZXQgbG9nID0gcmVxdWlyZSgnbnBtbG9nJylcblxuY29uc3QgVEFHID0gJ0Jhc2VTZXJ2aWNlJ1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ1JVRFNlcnZpY2Uge1xuICBwcm90ZWN0ZWQgZ2V0TW9kZWxzIChuYW1lKSB7XG4gICAgcmV0dXJuIFNlcXVlbGl6ZVNlcnZpY2UuZ2V0SW5zdGFuY2UoKS5tb2RlbHNbbmFtZV1cbiAgfVxuXG4gIHByaXZhdGUgZXJySGFuZGxlciAoZXJyKSB7XG4gICAgaWYgKGVyci5uYW1lKSB7XG4gICAgICByZXR1cm4geyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiBlcnIubWVzc2FnZSB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZTxUIGV4dGVuZHMgQmFzZU1vZGVsPiAobW9kZWxOYW1lOiBzdHJpbmcsIGRhdGE6IFBhcnRpYWw8VD4pIHtcbiAgICBsb2cudmVyYm9zZShUQUcsIGBjcmVhdGUoKTogbW9kZWxOYW1lPSR7bW9kZWxOYW1lfSBkYXRhPSR7SlNPTi5zdHJpbmdpZnkoZGF0YSl9YClcbiAgICByZXR1cm4gKHRoaXMuZ2V0TW9kZWxzKG1vZGVsTmFtZSkgYXMgTW9kZWw8SW5zdGFuY2U8VD4sIFBhcnRpYWw8VD4+KS5jcmVhdGUoT2JqZWN0LmFzc2lnbihkYXRhLCB7IGlkOiBudWxsIH0pKS50aGVuKGNyZWF0ZWREYXRhID0+IHtcbiAgICAgIHJldHVybiB7IHN0YXR1czogdHJ1ZSwgZGF0YTogY3JlYXRlZERhdGEuZ2V0KHsgcGxhaW46IHRydWUgfSkgfVxuICAgIH0pLmNhdGNoKHRoaXMuZXJySGFuZGxlcilcbiAgfVxuXG4gIC8vIElmIHRoZXJlJ3MgZGF0YSB0byBiZSByZWFkOlxuICAvLyB7c3RhdHVzOiB0cnVlLCBkYXRhOiBbXX1cbiAgLy9cbiAgLy8gSWYgdGhlcmUncyBubyBkYXRhOlxuICAvLyB7c3RhdHVzOiBmYWxzZSwgZXJyQ29kZTogLi4uLCBlcnJNZXNzYWdlOiAuLi4sIGVyckRhdGF9XG4gIHJlYWQgPFQgZXh0ZW5kcyBCYXNlTW9kZWw+IChtb2RlbE5hbWU6IHN0cmluZywgc2VhcmNoQ2xhdXNlOiBXaGVyZU9wdGlvbnM8VD4pOiBQcm9taXNlPE5DUmVzcG9uc2U8VFtdPj4ge1xuICAgIGxvZy52ZXJib3NlKFRBRywgYHJlYWQoKTogbW9kZWxOYW1lPSR7bW9kZWxOYW1lfSBzZWFyY2hDbGF1c2U9JHtKU09OLnN0cmluZ2lmeShzZWFyY2hDbGF1c2UpfWApXG4gICAgcmV0dXJuICh0aGlzLmdldE1vZGVscyhtb2RlbE5hbWUpIGFzIE1vZGVsPEluc3RhbmNlPFQ+LCBQYXJ0aWFsPFQ+PikuZmluZEFsbCh7IHdoZXJlOiBzZWFyY2hDbGF1c2UgfSkudGhlbihyZWFkRGF0YSA9PiB7XG4gICAgICByZXR1cm4geyBzdGF0dXM6IHRydWUsIGRhdGE6IHJlYWREYXRhLm1hcChkYXRhID0+IGRhdGEuZ2V0KHsgcGxhaW46IHRydWUgfSkpIH1cbiAgICB9KS5jYXRjaCh0aGlzLmVyckhhbmRsZXIpXG4gIH1cblxuICByZWFkT25lIDxUIGV4dGVuZHMgQmFzZU1vZGVsPiAobW9kZWxOYW1lOiBzdHJpbmcsIHNlYXJjaENsYXVzZTogV2hlcmVPcHRpb25zPFQ+KTogUHJvbWlzZTxOQ1Jlc3BvbnNlPFQ+PiB7XG4gICAgcmV0dXJuICh0aGlzLmdldE1vZGVscyhtb2RlbE5hbWUpIGFzIE1vZGVsPEluc3RhbmNlPFQ+LCBQYXJ0aWFsPFQ+PikuZmluZE9uZSh7IHdoZXJlOiBzZWFyY2hDbGF1c2UgfSkudGhlbihyZWFkRGF0YSA9PiB7XG4gICAgICBpZiAocmVhZERhdGEpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiB0cnVlLCBkYXRhOiAocmVhZERhdGEuZ2V0KHsgcGxhaW46IHRydWUgfSkgfHwgW10pWzBdIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogZmFsc2UsIGVyck1lc3NhZ2U6ICdEYXRhIG5vdCBmb3VuZCcgfVxuICAgICAgfVxuICAgIH0pLmNhdGNoKHRoaXMuZXJySGFuZGxlcilcbiAgfVxuXG4gIHVwZGF0ZSA8VCBleHRlbmRzIEJhc2VNb2RlbD4gKG1vZGVsTmFtZTogc3RyaW5nLCBkYXRhOiBQYXJ0aWFsPFQ+LCBzZWFyY2hDbGF1c2U6IFdoZXJlT3B0aW9uczxUPik6IFByb21pc2U8TkNSZXNwb25zZTxudW1iZXI+PiB7XG4gICAgbG9nLnZlcmJvc2UoVEFHLCBgdXBkYXRlKCk6IG1vZGVsTmFtZT0ke21vZGVsTmFtZX0gZGF0YT0ke0pTT04uc3RyaW5naWZ5KGRhdGEpfWApXG4gICAgcmV0dXJuICh0aGlzLmdldE1vZGVscyhtb2RlbE5hbWUpIGFzIE1vZGVsPEluc3RhbmNlPFQ+LCBQYXJ0aWFsPFQ+PilcbiAgICAgIC51cGRhdGUoZGF0YSwgeyB3aGVyZTogc2VhcmNoQ2xhdXNlIGFzIGFueSB9KS5zcHJlYWQoKGNvdW50OiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgIHJldHVybiB7IHN0YXR1czogdHJ1ZSwgZGF0YTogY291bnQgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7IHN0YXR1czogZmFsc2UsIGVyck1lc3NhZ2U6ICdEYXRhIG5vdCBmb3VuZCcgfVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaCh0aGlzLmVyckhhbmRsZXIpXG4gIH1cblxuICBkZWxldGUgPFQgZXh0ZW5kcyBCYXNlTW9kZWw+IChtb2RlbE5hbWU6IHN0cmluZywgc2VhcmNoQ2xhdXNlOiBXaGVyZU9wdGlvbnM8VD4pOiBQcm9taXNlPE5DUmVzcG9uc2U8bnVtYmVyPj4ge1xuICAgIGxvZy52ZXJib3NlKFRBRywgYGRlbGV0ZSgpOiBtb2RlbE5hbWU9JHttb2RlbE5hbWV9IHNlYXJjaENsYXVzZT0ke0pTT04uc3RyaW5naWZ5KHNlYXJjaENsYXVzZSl9YClcbiAgICByZXR1cm4gKHRoaXMuZ2V0TW9kZWxzKG1vZGVsTmFtZSkgYXMgTW9kZWw8SW5zdGFuY2U8VD4sIFBhcnRpYWw8VD4+KVxuICAgICAgLmRlc3Ryb3koeyB3aGVyZTogc2VhcmNoQ2xhdXNlIGFzIGFueSB9KS50aGVuKChjb3VudDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IHRydWUsIGRhdGE6IGNvdW50IH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4geyBzdGF0dXM6IGZhbHNlLCBlcnJNZXNzYWdlOiAnRGF0YSBub3QgZm91bmQnIH1cbiAgICAgICAgfVxuICAgICAgfSkuY2F0Y2godGhpcy5lcnJIYW5kbGVyKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENSVURTZXJ2aWNlXG4iXX0=
