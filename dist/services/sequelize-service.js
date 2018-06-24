"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var log=require("npmlog");const TAG="SequelizeService";class SequelizeService{constructor(e,i){this.sequelize=e,this.models=i}static initialize(e,i){if(log.verbose(TAG,"initialize()"),SequelizeService.instance)throw new Error("SequelizeService is already initialized");SequelizeService.instance=new SequelizeService(e,i)}static getInstance(){if(SequelizeService.instance)return SequelizeService.instance;throw new Error("SequelizeService is not initialized!")}}exports.default=SequelizeService;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlcy9zZXF1ZWxpemUtc2VydmljZS50cyJdLCJuYW1lcyI6WyJsb2ciLCJyZXF1aXJlIiwiVEFHIiwiU2VxdWVsaXplU2VydmljZSIsIltvYmplY3QgT2JqZWN0XSIsInNlcXVlbGl6ZSIsIm1vZGVscyIsInRoaXMiLCJ2ZXJib3NlIiwiaW5zdGFuY2UiLCJFcnJvciIsImV4cG9ydHMiLCJkZWZhdWx0Il0sIm1hcHBpbmdzIjoib0VBQ0EsSUFBSUEsSUFBTUMsUUFBUSxVQUVsQixNQUFNQyxJQUFNLHlCQUVaQyxpQkFLRUMsWUFBcUJDLEVBQXNCQyxHQUN6Q0MsS0FBS0YsVUFBWUEsRUFDakJFLEtBQUtELE9BQVNBLEVBR2hCRixrQkFBbUJDLEVBQXNCQyxHQUV2QyxHQURBTixJQUFJUSxRQUFRTixJQUFLLGdCQUNaQyxpQkFBaUJNLFNBR3BCLE1BQU0sSUFBSUMsTUFBTSwyQ0FGaEJQLGlCQUFpQk0sU0FBVyxJQUFJTixpQkFBaUJFLEVBQVdDLEdBTWhFRixxQkFDRSxHQUFJRCxpQkFBaUJNLFNBQ25CLE9BQU9OLGlCQUFpQk0sU0FFeEIsTUFBTSxJQUFJQyxNQUFNLHlDQXZCdEJDLFFBQUFDLFFBQUFUIiwiZmlsZSI6InNlcnZpY2VzL3NlcXVlbGl6ZS1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTZXF1ZWxpemUsIE1vZGVsc30gZnJvbSAnc2VxdWVsaXplJ1xudmFyIGxvZyA9IHJlcXVpcmUoJ25wbWxvZycpXG5cbmNvbnN0IFRBRyA9ICdTZXF1ZWxpemVTZXJ2aWNlJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXF1ZWxpemVTZXJ2aWNlIHtcbiAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IFNlcXVlbGl6ZVNlcnZpY2VcbiAgcmVhZG9ubHkgc2VxdWVsaXplOiBTZXF1ZWxpemVcbiAgcmVhZG9ubHkgbW9kZWxzOiBNb2RlbHNcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yIChzZXF1ZWxpemU6IFNlcXVlbGl6ZSwgbW9kZWxzOiBNb2RlbHMpIHtcbiAgICB0aGlzLnNlcXVlbGl6ZSA9IHNlcXVlbGl6ZVxuICAgIHRoaXMubW9kZWxzID0gbW9kZWxzXG4gIH1cblxuICBzdGF0aWMgaW5pdGlhbGl6ZSAoc2VxdWVsaXplOiBTZXF1ZWxpemUsIG1vZGVsczogTW9kZWxzKSB7XG4gICAgbG9nLnZlcmJvc2UoVEFHLCAnaW5pdGlhbGl6ZSgpJylcbiAgICBpZiAoIVNlcXVlbGl6ZVNlcnZpY2UuaW5zdGFuY2UpIHtcbiAgICAgIFNlcXVlbGl6ZVNlcnZpY2UuaW5zdGFuY2UgPSBuZXcgU2VxdWVsaXplU2VydmljZShzZXF1ZWxpemUsIG1vZGVscylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXF1ZWxpemVTZXJ2aWNlIGlzIGFscmVhZHkgaW5pdGlhbGl6ZWQnKVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSAoKTogU2VxdWVsaXplU2VydmljZSB7XG4gICAgaWYgKFNlcXVlbGl6ZVNlcnZpY2UuaW5zdGFuY2UpIHtcbiAgICAgIHJldHVybiBTZXF1ZWxpemVTZXJ2aWNlLmluc3RhbmNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VxdWVsaXplU2VydmljZSBpcyBub3QgaW5pdGlhbGl6ZWQhJylcbiAgICB9XG4gIH1cbn1cbiJdfQ==
