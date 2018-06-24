"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const path=require("path"),express=require("express");class AppController{constructor(t){this.interceptors=[],this.siteData=t,this.router=express(),this.viewPath=t.viewPath||path.join(__dirname,"views"),this.assetsPath=t.assetPath||path.join(this.viewPath,"/assets"),this.router.set("views",this.viewPath),this.router.set("view engine","pug"),this.router.use("/assets",express.static(this.assetsPath,{maxAge:"1h"}))}initialize(){return Promise.resolve(null)}isUpToDate(){return Promise.resolve(!0)}getInitData(){return this.siteData}getDb(){return this.siteData.db}getSite(){return this.siteData.site}extendInterceptors(...t){return this.interceptors.concat(t)}addInterceptor(...t){this.interceptors=this.extendInterceptors(...t)}routeAll(t,...e){this.router.all(t,this.extendInterceptors(...e))}routeGet(t,...e){this.router.get(t,this.extendInterceptors(...e))}routePost(t,...e){this.router.post(t,this.extendInterceptors(...e))}routeUse(...t){this.router.use("",this.extendInterceptors(...t))}evictRequireCache(){return Promise.resolve(null)}getRouter(){return this.router}}exports.AppController=AppController;class CMSController{constructor(t){this.interceptors=[],this.siteData=t,this.siteHash=t.site.hash,this.router=express(),this.subRouter=express(),this.router.use(`/${this.siteHash}`,this.subRouter),this.subRouter.locals.rootifyPath=this.rootifyPath.bind(this),this.viewPath=t.viewPath,this.assetsPath=t.assetPath||path.join(this.viewPath,"/assets"),this.subRouter.use("/assets",express.static(this.assetsPath)),this.subRouter.set("views",this.viewPath),this.subRouter.set("view engine","pug")}rootifyPath(t){return this.siteHash?`/${this.siteHash}/${t}`:`/${t}`}extendInterceptors(...t){return this.interceptors.concat(t)}addInterceptor(...t){this.interceptors=this.extendInterceptors(...t)}routeAll(t,...e){this.subRouter.all(t,this.extendInterceptors(...e))}routeGet(t,...e){this.subRouter.get(t,this.extendInterceptors(...e))}routePost(t,...e){this.subRouter.post(t,this.extendInterceptors(...e))}routeUse(t,...e){this.subRouter.use(t,this.extendInterceptors(...e))}getRouter(){return this.router}}exports.CMSController=CMSController;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zaXRlLWRlZmluaXRpb25zLnRzIl0sIm5hbWVzIjpbInBhdGgiLCJyZXF1aXJlIiwiZXhwcmVzcyIsIkFwcENvbnRyb2xsZXIiLCJbb2JqZWN0IE9iamVjdF0iLCJkYXRhIiwidGhpcyIsImludGVyY2VwdG9ycyIsInNpdGVEYXRhIiwicm91dGVyIiwidmlld1BhdGgiLCJqb2luIiwiX19kaXJuYW1lIiwiYXNzZXRzUGF0aCIsImFzc2V0UGF0aCIsInNldCIsInVzZSIsInN0YXRpYyIsIm1heEFnZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiZGIiLCJzaXRlIiwiZm5zIiwiY29uY2F0IiwiZXh0ZW5kSW50ZXJjZXB0b3JzIiwiYWxsIiwiZ2V0IiwicG9zdCIsImV4cG9ydHMiLCJDTVNDb250cm9sbGVyIiwic2l0ZUhhc2giLCJoYXNoIiwic3ViUm91dGVyIiwibG9jYWxzIiwicm9vdGlmeVBhdGgiLCJiaW5kIiwiZmlsZW5hbWUiXSwibWFwcGluZ3MiOiJvRUFBQSxNQUFBQSxLQUFBQyxRQUFBLFFBRUFDLFFBQUFELFFBQUEsaUJBdUNBRSxjQU9FQyxZQUFhQyxHQUZIQyxLQUFBQyxnQkFHUkQsS0FBS0UsU0FBV0gsRUFDaEJDLEtBQUtHLE9BQVNQLFVBRWRJLEtBQUtJLFNBQVdMLEVBQUtLLFVBQVlWLEtBQUtXLEtBQUtDLFVBQVcsU0FDdEROLEtBQUtPLFdBQWFSLEVBQUtTLFdBQWFkLEtBQUtXLEtBQUtMLEtBQUtJLFNBQVUsV0FFN0RKLEtBQUtHLE9BQU9NLElBQUksUUFBU1QsS0FBS0ksVUFDOUJKLEtBQUtHLE9BQU9NLElBQUksY0FBZSxPQUMvQlQsS0FBS0csT0FBT08sSUFBSSxVQUFXZCxRQUFRZSxPQUFPWCxLQUFLTyxZQUFhSyxPQUFRLFFBSXRFZCxhQUNFLE9BQU9lLFFBQVFDLFFBQVEsTUFJekJoQixhQUNFLE9BQU9lLFFBQVFDLFNBQVEsR0FHekJoQixjQUNFLE9BQU9FLEtBQUtFLFNBR2RKLFFBQ0UsT0FBT0UsS0FBS0UsU0FBU2EsR0FHdkJqQixVQUNFLE9BQU9FLEtBQUtFLFNBQVNjLEtBSWJsQixzQkFBdUJtQixHQUMvQixPQUFPakIsS0FBS0MsYUFBYWlCLE9BQU9ELEdBR3ZCbkIsa0JBQW1CbUIsR0FDNUJqQixLQUFLQyxhQUFlRCxLQUFLbUIsc0JBQXNCRixHQUdqRG5CLFNBQVVKLEtBQVN1QixHQUNqQmpCLEtBQUtHLE9BQU9pQixJQUFJMUIsRUFBTU0sS0FBS21CLHNCQUFzQkYsSUFHbkRuQixTQUFVSixLQUFTdUIsR0FDakJqQixLQUFLRyxPQUFPa0IsSUFBSTNCLEVBQU1NLEtBQUttQixzQkFBc0JGLElBR25EbkIsVUFBV0osS0FBU3VCLEdBQ2xCakIsS0FBS0csT0FBT21CLEtBQUs1QixFQUFNTSxLQUFLbUIsc0JBQXNCRixJQUdwRG5CLFlBQWFtQixHQUNYakIsS0FBS0csT0FBT08sSUFBSSxHQUFJVixLQUFLbUIsc0JBQXNCRixJQU1qRG5CLG9CQUNFLE9BQU9lLFFBQVFDLFFBQVEsTUFHekJoQixZQUNFLE9BQU9FLEtBQUtHLFFBMUVoQm9CLFFBQUExQixjQUFBQSxvQkE4RUEyQixjQVNFMUIsWUFBYUksR0FISEYsS0FBQUMsZ0JBSVJELEtBQUtFLFNBQVdBLEVBQ2hCRixLQUFLeUIsU0FBV3ZCLEVBQVNjLEtBQUtVLEtBRTlCMUIsS0FBS0csT0FBU1AsVUFDZEksS0FBSzJCLFVBQVkvQixVQUVqQkksS0FBS0csT0FBT08sUUFBUVYsS0FBS3lCLFdBQVl6QixLQUFLMkIsV0FDMUMzQixLQUFLMkIsVUFBVUMsT0FBT0MsWUFBYzdCLEtBQUs2QixZQUFZQyxLQUFLOUIsTUFDMURBLEtBQUtJLFNBQVdGLEVBQVNFLFNBQ3pCSixLQUFLTyxXQUFhTCxFQUFTTSxXQUFhZCxLQUFLVyxLQUFLTCxLQUFLSSxTQUFVLFdBQ2pFSixLQUFLMkIsVUFBVWpCLElBQUksVUFBV2QsUUFBUWUsT0FBT1gsS0FBS08sYUFDbERQLEtBQUsyQixVQUFVbEIsSUFBSSxRQUFTVCxLQUFLSSxVQUNqQ0osS0FBSzJCLFVBQVVsQixJQUFJLGNBQWUsT0FLMUJYLFlBQWFpQyxHQUNyQixPQUFJL0IsS0FBS3lCLGFBQ0l6QixLQUFLeUIsWUFBWU0sUUFFakJBLElBSUxqQyxzQkFBdUJtQixHQUMvQixPQUFPakIsS0FBS0MsYUFBYWlCLE9BQU9ELEdBR3ZCbkIsa0JBQW1CbUIsR0FDNUJqQixLQUFLQyxhQUFlRCxLQUFLbUIsc0JBQXNCRixHQUdqRG5CLFNBQVVKLEtBQWlCdUIsR0FDekJqQixLQUFLMkIsVUFBVVAsSUFBSTFCLEVBQU1NLEtBQUttQixzQkFBc0JGLElBR3REbkIsU0FBVUosS0FBaUJ1QixHQUN6QmpCLEtBQUsyQixVQUFVTixJQUFJM0IsRUFBTU0sS0FBS21CLHNCQUFzQkYsSUFHdERuQixVQUFXSixLQUFpQnVCLEdBQzFCakIsS0FBSzJCLFVBQVVMLEtBQUs1QixFQUFNTSxLQUFLbUIsc0JBQXNCRixJQUd2RG5CLFNBQVVKLEtBQWlCdUIsR0FDekJqQixLQUFLMkIsVUFBVWpCLElBQUloQixFQUFNTSxLQUFLbUIsc0JBQXNCRixJQUd0RG5CLFlBQ0UsT0FBT0UsS0FBS0csUUE1RGhCb0IsUUFBQUMsY0FBQUEiLCJmaWxlIjoic2l0ZS1kZWZpbml0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCdcblxuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tICdleHByZXNzJ1xuaW1wb3J0IHtTZXF1ZWxpemV9IGZyb20gJ3NlcXVlbGl6ZSdcblxuZXhwb3J0IGludGVyZmFjZSBEYXRhYmFzZSB7XG4gIHNlcXVlbGl6ZTogU2VxdWVsaXplXG4gIG1vZGVsczoge31cbn1cblxuZXhwb3J0IGludGVyZmFjZSBVc2VyIHtcbiAgaWQ6IG51bWJlcixcbiAgdXNlcm5hbWU6IHN0cmluZyxcbiAgZW1haWw6IHN0cmluZyxcbiAgc2l0ZUlkOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaXRlIHtcbiAgaWQ6IG51bWJlcixcbiAgdGVtcGxhdGVJZDogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmcsXG4gIGRiTmFtZTogc3RyaW5nLFxuICBoYXNoOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTaXRlRGF0YSB7XG4gIHNpdGU6IFNpdGUsXG4gIHVzZXI6IFVzZXIsXG4gIHNvY2tldElPOiBTb2NrZXRJTyxcbiAgZGI6IERhdGFiYXNlLFxuICB2aWV3UGF0aDogc3RyaW5nLFxuICBhc3NldFBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgU29ja2V0SU8gPSBhbnlcblxuZXhwb3J0IGludGVyZmFjZSBEQlN0cnVjdHVyZSB7XG4gIC8vIFJldHVybiBtb2RlbHNcbiAgYWRkVGFibGVzIChzZXF1ZWxpemU6IFNlcXVlbGl6ZSwgbW9kZWxzOiB7fSk6IHt9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcHBDb250cm9sbGVyIHtcbiAgcmVhZG9ubHkgcm91dGVyOiBleHByZXNzLkV4cHJlc3NcbiAgcHJvdGVjdGVkIHZpZXdQYXRoOiBzdHJpbmdcbiAgcHJvdGVjdGVkIGFzc2V0c1BhdGg6IHN0cmluZ1xuICBwcm90ZWN0ZWQgc2l0ZURhdGE6IFNpdGVEYXRhXG4gIHByb3RlY3RlZCBpbnRlcmNlcHRvcnM6IGV4cHJlc3MuUmVxdWVzdEhhbmRsZXJbXSA9IFtdXG5cbiAgY29uc3RydWN0b3IgKGRhdGE6IFNpdGVEYXRhKSB7XG4gICAgdGhpcy5zaXRlRGF0YSA9IGRhdGFcbiAgICB0aGlzLnJvdXRlciA9IGV4cHJlc3MoKVxuICAgIC8vIFRPRE86IF9fZGlybmFtZSBpcyBub3QgbmVjZXNzYXJ5XG4gICAgdGhpcy52aWV3UGF0aCA9IGRhdGEudmlld1BhdGggfHwgcGF0aC5qb2luKF9fZGlybmFtZSwgJ3ZpZXdzJylcbiAgICB0aGlzLmFzc2V0c1BhdGggPSBkYXRhLmFzc2V0UGF0aCB8fCBwYXRoLmpvaW4odGhpcy52aWV3UGF0aCwgJy9hc3NldHMnKVxuXG4gICAgdGhpcy5yb3V0ZXIuc2V0KCd2aWV3cycsIHRoaXMudmlld1BhdGgpXG4gICAgdGhpcy5yb3V0ZXIuc2V0KCd2aWV3IGVuZ2luZScsICdwdWcnKVxuICAgIHRoaXMucm91dGVyLnVzZSgnL2Fzc2V0cycsIGV4cHJlc3Muc3RhdGljKHRoaXMuYXNzZXRzUGF0aCwge21heEFnZTogJzFoJ30pKVxuICB9XG4gIC8vIEluaXRpYWxpemUgdGhlIGNsYXNzLiBUaGUgcmVhc29uIHRoaXMgY2FuJ3QgYmUgZG9uZSB1c2luZyBjb25zdHJ1Y3RvciBpcyBiZWNhdXNlXG4gIC8vIHdlIG1heSBoYXZlIHRvIHdhaXQgdW50aWwgdGhlIGluaXRpYWxpemF0aW9uIGlzIGNvbXBlbHRlIGJlZm9yZSBwcmVjZWVkaW5nXG4gIGluaXRpYWxpemUgKCk6IFByb21pc2U8bnVsbD4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbClcbiAgfVxuXG4gIC8vIFdoZXRoZXIgdGhlIGluc3RhbmNlIGlzIHN0aWxsIHZhbGlkIG9yIG5vdCAoaS5lLiB0aGVyZSBhcmUgdXBkYXRlZCBmaWxlcylcbiAgaXNVcFRvRGF0ZSAoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKVxuICB9XG5cbiAgZ2V0SW5pdERhdGEgKCk6IFNpdGVEYXRhIHtcbiAgICByZXR1cm4gdGhpcy5zaXRlRGF0YVxuICB9XG5cbiAgZ2V0RGIgKCk6IERhdGFiYXNlIHtcbiAgICByZXR1cm4gdGhpcy5zaXRlRGF0YS5kYlxuICB9XG5cbiAgZ2V0U2l0ZSAoKTogU2l0ZSB7XG4gICAgcmV0dXJuIHRoaXMuc2l0ZURhdGEuc2l0ZVxuICB9XG5cblxuICBwcm90ZWN0ZWQgZXh0ZW5kSW50ZXJjZXB0b3JzICguLi5mbnM6IGV4cHJlc3MuUmVxdWVzdEhhbmRsZXJbXSkge1xuICAgIHJldHVybiB0aGlzLmludGVyY2VwdG9ycy5jb25jYXQoZm5zKVxuICB9XG5cbiAgcHJvdGVjdGVkICBhZGRJbnRlcmNlcHRvciAoLi4uZm5zOiBleHByZXNzLlJlcXVlc3RIYW5kbGVyW10pIHtcbiAgICB0aGlzLmludGVyY2VwdG9ycyA9IHRoaXMuZXh0ZW5kSW50ZXJjZXB0b3JzKC4uLmZucylcbiAgfVxuXG4gIHJvdXRlQWxsIChwYXRoLCAuLi5mbnM6IGV4cHJlc3MuUmVxdWVzdEhhbmRsZXJbXSkge1xuICAgIHRoaXMucm91dGVyLmFsbChwYXRoLCB0aGlzLmV4dGVuZEludGVyY2VwdG9ycyguLi5mbnMpKVxuICB9XG5cbiAgcm91dGVHZXQgKHBhdGgsIC4uLmZuczogQXJyYXk8ZXhwcmVzcy5SZXF1ZXN0SGFuZGxlcj4pIHtcbiAgICB0aGlzLnJvdXRlci5nZXQocGF0aCwgdGhpcy5leHRlbmRJbnRlcmNlcHRvcnMoLi4uZm5zKSlcbiAgfVxuXG4gIHJvdXRlUG9zdCAocGF0aCwgLi4uZm5zOiBBcnJheTxleHByZXNzLlJlcXVlc3RIYW5kbGVyPikge1xuICAgIHRoaXMucm91dGVyLnBvc3QocGF0aCwgdGhpcy5leHRlbmRJbnRlcmNlcHRvcnMoLi4uZm5zKSlcbiAgfVxuXG4gIHJvdXRlVXNlICguLi5mbnM6IEFycmF5PGV4cHJlc3MuUmVxdWVzdEhhbmRsZXI+KSB7XG4gICAgdGhpcy5yb3V0ZXIudXNlKCcnLCB0aGlzLmV4dGVuZEludGVyY2VwdG9ycyguLi5mbnMpKVxuICB9XG5cblxuICAvLyBXaGVuIHRoZSBpbnN0YW5jZSBvZiB0aGUgY2xhc3MgaXMgbm8gbG9uZ2VyIHZhbGlkLFxuICAvLyB3ZSBoYXZlIHRvIGV2aWN0IG91dCB0aGUgY2FjaGUgc28gcmUtaW5zdGFudGlhdGlvbiBpcyBjbGVhblxuICBldmljdFJlcXVpcmVDYWNoZSAoKTogUHJvbWlzZTxudWxsPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKVxuICB9XG5cbiAgZ2V0Um91dGVyICgpOiBleHByZXNzLkV4cHJlc3Mge1xuICAgIHJldHVybiB0aGlzLnJvdXRlclxuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDTVNDb250cm9sbGVyIHtcbiAgcmVhZG9ubHkgc2l0ZUhhc2g6IHN0cmluZ1xuICByZWFkb25seSByb3V0ZXI6IGV4cHJlc3MuRXhwcmVzc1xuICByZWFkb25seSBzdWJSb3V0ZXI6IGV4cHJlc3MuRXhwcmVzc1xuICBwcm90ZWN0ZWQgdmlld1BhdGg6IHN0cmluZ1xuICBwcm90ZWN0ZWQgYXNzZXRzUGF0aDogc3RyaW5nXG4gIHByb3RlY3RlZCBpbnRlcmNlcHRvcnM6IEFycmF5PGFueT4gPSBbXVxuICByZWFkb25seSBzaXRlRGF0YTogU2l0ZURhdGFcblxuICBjb25zdHJ1Y3RvciAoc2l0ZURhdGE6IFNpdGVEYXRhKSB7XG4gICAgdGhpcy5zaXRlRGF0YSA9IHNpdGVEYXRhXG4gICAgdGhpcy5zaXRlSGFzaCA9IHNpdGVEYXRhLnNpdGUuaGFzaFxuICAgIC8vIFNpbmNlIHRoZSBwYXRoIGlzIHByZWZpeGVkIHdpdGggLzpoYXNoLywgd2UgZG9uJ3Qgd2FubmEgaGFuZGxlIGl0IG1hbnVhbGx5IGV2ZXJ5dGltZSwgaGVuY2Ugd2UgdXNlIHR3byByb3V0ZXJzXG4gICAgdGhpcy5yb3V0ZXIgPSBleHByZXNzKClcbiAgICB0aGlzLnN1YlJvdXRlciA9IGV4cHJlc3MoKVxuXG4gICAgdGhpcy5yb3V0ZXIudXNlKGAvJHt0aGlzLnNpdGVIYXNofWAsIHRoaXMuc3ViUm91dGVyKVxuICAgIHRoaXMuc3ViUm91dGVyLmxvY2Fscy5yb290aWZ5UGF0aCA9IHRoaXMucm9vdGlmeVBhdGguYmluZCh0aGlzKVxuICAgIHRoaXMudmlld1BhdGggPSBzaXRlRGF0YS52aWV3UGF0aFxuICAgIHRoaXMuYXNzZXRzUGF0aCA9IHNpdGVEYXRhLmFzc2V0UGF0aCB8fCBwYXRoLmpvaW4odGhpcy52aWV3UGF0aCwgJy9hc3NldHMnKVxuICAgIHRoaXMuc3ViUm91dGVyLnVzZSgnL2Fzc2V0cycsIGV4cHJlc3Muc3RhdGljKHRoaXMuYXNzZXRzUGF0aCkpXG4gICAgdGhpcy5zdWJSb3V0ZXIuc2V0KCd2aWV3cycsIHRoaXMudmlld1BhdGgpXG4gICAgdGhpcy5zdWJSb3V0ZXIuc2V0KCd2aWV3IGVuZ2luZScsICdwdWcnKVxuICB9XG5cbiAgLy8gU2luY2Ugd2UncmUgdXNpbmcgLzpoYXNoL3BhdGgsIHdlIGhhdmUgdG8gcHJlcGVuZCA6aGFzaFxuICAvLyBhcyB0aGUgcm9vdCBvZiB0aGUgcGF0aCwgd2hlbiByZWZlcnJpbmcgdG8gYW4gYXNzZXRcbiAgcHJvdGVjdGVkIHJvb3RpZnlQYXRoIChmaWxlbmFtZSkge1xuICAgIGlmICh0aGlzLnNpdGVIYXNoKSB7XG4gICAgICByZXR1cm4gYC8ke3RoaXMuc2l0ZUhhc2h9LyR7ZmlsZW5hbWV9YFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYC8ke2ZpbGVuYW1lfWBcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZXh0ZW5kSW50ZXJjZXB0b3JzICguLi5mbnM6IGV4cHJlc3MuUmVxdWVzdEhhbmRsZXJbXSkge1xuICAgIHJldHVybiB0aGlzLmludGVyY2VwdG9ycy5jb25jYXQoZm5zKVxuICB9XG5cbiAgcHJvdGVjdGVkICBhZGRJbnRlcmNlcHRvciAoLi4uZm5zOiBleHByZXNzLlJlcXVlc3RIYW5kbGVyW10pIHtcbiAgICB0aGlzLmludGVyY2VwdG9ycyA9IHRoaXMuZXh0ZW5kSW50ZXJjZXB0b3JzKC4uLmZucylcbiAgfVxuXG4gIHJvdXRlQWxsIChwYXRoOiBzdHJpbmcsIC4uLmZuczogZXhwcmVzcy5SZXF1ZXN0SGFuZGxlcltdKSB7XG4gICAgdGhpcy5zdWJSb3V0ZXIuYWxsKHBhdGgsIHRoaXMuZXh0ZW5kSW50ZXJjZXB0b3JzKC4uLmZucykpXG4gIH1cblxuICByb3V0ZUdldCAocGF0aDogc3RyaW5nLCAuLi5mbnM6IEFycmF5PGV4cHJlc3MuUmVxdWVzdEhhbmRsZXI+KSB7XG4gICAgdGhpcy5zdWJSb3V0ZXIuZ2V0KHBhdGgsIHRoaXMuZXh0ZW5kSW50ZXJjZXB0b3JzKC4uLmZucykpXG4gIH1cblxuICByb3V0ZVBvc3QgKHBhdGg6IHN0cmluZywgLi4uZm5zOiBBcnJheTxleHByZXNzLlJlcXVlc3RIYW5kbGVyPikge1xuICAgIHRoaXMuc3ViUm91dGVyLnBvc3QocGF0aCwgdGhpcy5leHRlbmRJbnRlcmNlcHRvcnMoLi4uZm5zKSlcbiAgfVxuXG4gIHJvdXRlVXNlIChwYXRoOiBzdHJpbmcsIC4uLmZuczogQXJyYXk8ZXhwcmVzcy5SZXF1ZXN0SGFuZGxlcj4pIHtcbiAgICB0aGlzLnN1YlJvdXRlci51c2UocGF0aCwgdGhpcy5leHRlbmRJbnRlcmNlcHRvcnMoLi4uZm5zKSlcbiAgfVxuXG4gIGdldFJvdXRlciAoKTogZXhwcmVzcy5FeHByZXNzIHtcbiAgICByZXR1cm4gdGhpcy5yb3V0ZXJcbiAgfVxuXG4gIGFic3RyYWN0IGdldFNpZGViYXIgKCk6IGFueVtdXG59Il19
