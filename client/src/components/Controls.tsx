import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

// Constants for control settings
const ROTATION_SPEED = 0.01;
const DAMPING = 0.95; // Lower value means faster damping
const MAX_POLAR_ANGLE = Math.PI * 0.85;
const MIN_POLAR_ANGLE = Math.PI * 0.15;

const Controls = () => {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  
  // Camera constraints
  const targetDistance = useRef(12); // Distance from center
  const targetPosition = useRef(new THREE.Vector3());

  useEffect(() => {
    const canvas = gl.domElement;
    
    // Mouse down event
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    // Mouse move event
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      
      // Calculate mouse movement delta
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      
      // Update rotation velocity based on mouse movement
      rotationVelocity.current.x += deltaY * ROTATION_SPEED;
      rotationVelocity.current.y += deltaX * ROTATION_SPEED;
      
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };
    
    // Mouse up event
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    
    // Mouse wheel event for zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Update target distance based on wheel direction
      targetDistance.current += e.deltaY * 0.01;
      
      // Clamp distance to reasonable range
      targetDistance.current = Math.max(6, Math.min(20, targetDistance.current));
    };
    
    // Touch events for mobile support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        previousMousePosition.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;
      
      rotationVelocity.current.x += deltaY * ROTATION_SPEED;
      rotationVelocity.current.y += deltaX * ROTATION_SPEED;
      
      previousMousePosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };
    
    const handleTouchEnd = () => {
      isDragging.current = false;
    };
    
    // Add event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    
    canvas.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    
    // Cleanup
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      
      canvas.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gl]);

  useFrame(() => {
    // Apply damping to rotation velocity
    rotationVelocity.current.x *= DAMPING;
    rotationVelocity.current.y *= DAMPING;

    // Convert camera position to spherical coordinates
    const spherical = new THREE.Spherical().setFromVector3(camera.position);
    
    // Update spherical coordinates based on rotation velocity
    spherical.phi += rotationVelocity.current.x;
    spherical.theta += rotationVelocity.current.y;
    
    // Constrain polar angle to avoid flipping
    spherical.phi = Math.max(MIN_POLAR_ANGLE, Math.min(MAX_POLAR_ANGLE, spherical.phi));
    
    // Smoothly adjust radius (distance) to target
    spherical.radius += (targetDistance.current - spherical.radius) * 0.1;
    
    // Convert back to Cartesian coordinates
    targetPosition.current.setFromSpherical(spherical);
    
    // Smoothly update camera position
    camera.position.lerp(targetPosition.current, 0.1);
    
    // Always look at center
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export default Controls;
