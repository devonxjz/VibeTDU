import {
  ClientRect,
  CollisionDetection,
  rectIntersection,
  closestCorners,
} from "@dnd-kit/core";

/**
 * Custom collision detection algorithm for ChemLab.
 * Prioritizes drop zones that are vessels (the Beaker) and uses a tighter hitbox
 * or closestCorners for better accuracy when pouring.
 */
export const chemLabCollisionDetection: CollisionDetection = (args) => {
  // First, get all potential intersections using closestCorners for smooth detection
  const cornerCollisions = closestCorners(args);
  
  if (cornerCollisions.length === 0) {
    return [];
  }

  // Find if any of the collisions are a vessel target
  const vesselCollision = cornerCollisions.find(
    (c) => c.id.toString().startsWith("drop-")
  );

  if (vesselCollision) {
    return [vesselCollision];
  }

  // If no vessel target is found, just return the first one (e.g. board drop zone)
  return [cornerCollisions[0]];
};
