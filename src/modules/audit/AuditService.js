import { mapAssetToTimeline } from './TimelineMapper';
export const auditService = {
 buildTimeline({assets=[]}) { return assets.slice(0,5).map(mapAssetToTimeline); }
};
