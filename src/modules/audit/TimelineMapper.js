export function mapAssetToTimeline(asset) {
  return {
    id: `asset-${asset.id}`,
    type: "success",
    title: `${asset.title} added`,
    meta: `Continuity record in ${asset.type || "Other"}`,
    createdAt: asset.created_at,
  };
}

export function mapSecurityEvent(title, meta, type = "success") {
  return {
    id: `${title}-${meta}`,
    type,
    title,
    meta,
    createdAt: new Date().toISOString(),
  };
}

