// src/components/network3d/RiskNetwork3D.tsx
// Justification: Full WebGL 3D Interactive Organizational Risk Web built with Three.js.
// Provides 360-degree rotation, zoom, pan, raycast hover inspection, manager-employee hierarchy links, and risk-tier color coding.
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { LineOfBusiness, Workflow } from '../../types/workflow.js';
import { GraphNodeData, getTierNumber } from './NodeDetailOverlay';
import { RiskNetworkViewport } from './RiskNetworkViewport';
interface RiskNetwork3DProps {
  workflows: Workflow[];
  onSelectWorkflow?: (workflow: Workflow) => void;
  onFilterLOB?: (lob: LineOfBusiness) => void;
}
interface Node3DEntity {
  mesh: THREE.Mesh;
  data: GraphNodeData;
  initialPos: THREE.Vector3;
  color: THREE.Color;
  baseScale: THREE.Vector3;
}
export const RiskNetwork3D: React.FC<RiskNetwork3DProps> = ({ workflows, onSelectWorkflow, onFilterLOB }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNodeData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const autoRotateRef = useRef(autoRotate);
  const onSelectWorkflowRef = useRef(onSelectWorkflow);
  const onFilterLOBRef = useRef(onFilterLOB);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);
  useEffect(() => {
    onSelectWorkflowRef.current = onSelectWorkflow;
    onFilterLOBRef.current = onFilterLOB;
  }, [onFilterLOB, onSelectWorkflow]);
  // Group workflows by LOB and Department
  const { lobs, departmentsByLob } = useMemo(() => {
    const lobsSet = new Set<LineOfBusiness>();
    const deptsMap = new Map<LineOfBusiness, Set<string>>();
    workflows.forEach((w) => {
      lobsSet.add(w.lob);
      if (!deptsMap.has(w.lob)) {
        deptsMap.set(w.lob, new Set());
      }
      deptsMap.get(w.lob)!.add(w.department);
    });
    return {
      lobs: Array.from(lobsSet),
      departmentsByLob: deptsMap,
    };
  }, [workflows]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;
    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Deep space slate
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.0035);
    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 35, 110);
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    camera.lookAt(cameraTarget);
    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);
    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(50, 80, 60);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 200);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    // 5. Starfield / Ambient Particle Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 350;
      starPositions[i + 1] = (Math.random() - 0.5) * 350;
      starPositions[i + 2] = (Math.random() - 0.5) * 350;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 1.2,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);
    // 6. Node Generation & Hierarchical Graph Construction
    const nodes: Node3DEntity[] = [];
    const linesGroup = new THREE.Group();
    scene.add(linesGroup);
    // Material caching
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    // Center Node: Enterprise Hub
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const centerMesh = new THREE.Mesh(sphereGeo, centerMat);
    centerMesh.scale.set(4.5, 4.5, 4.5);
    centerMesh.position.set(0, 0, 0);
    scene.add(centerMesh);
    nodes.push({
      mesh: centerMesh,
      data: {
        id: 'hub-enterprise',
        name: 'Upbound Group AI Governance CoE',
        type: 'enterprise',
        workflowCount: workflows.length,
      },
      initialPos: new THREE.Vector3(0, 0, 0),
      color: new THREE.Color(0x38bdf8),
      baseScale: centerMesh.scale.clone(),
    });
    // Ring 1: LOB Nodes
    const lobPositions = new Map<LineOfBusiness, THREE.Vector3>();
    const lobMeshes = new Map<LineOfBusiness, THREE.Mesh>();
    const lobRadius = 32;
    lobs.forEach((lob, i) => {
      const angle = (i / lobs.length) * Math.PI * 2;
      const x = Math.cos(angle) * lobRadius;
      const z = Math.sin(angle) * lobRadius;
      const y = Math.sin(angle * 2) * 5; // gentle vertical oscillation
      const pos = new THREE.Vector3(x, y, z);
      lobPositions.set(lob, pos);
      const lobMat = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x1e40af,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.6,
      });
      const lobMesh = new THREE.Mesh(sphereGeo, lobMat);
      lobMesh.scale.set(2.8, 2.8, 2.8);
      lobMesh.position.copy(pos);
      scene.add(lobMesh);
      lobMeshes.set(lob, lobMesh);
      // Connect LOB to Enterprise Hub
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), pos]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        linewidth: 2,
      });
      linesGroup.add(new THREE.Line(lineGeo, lineMat));
      const lobWorkflows = workflows.filter((w) => w.lob === lob);
      const avgTier =
        lobWorkflows.reduce((acc, w) => acc + getTierNumber(w.risk_tier), 0) / (lobWorkflows.length || 1);
      nodes.push({
        mesh: lobMesh,
        data: {
          id: `lob-${lob}`,
          name: `${lob} Division`,
          type: 'lob',
          lob,
          workflowCount: lobWorkflows.length,
          avgRisk: avgTier,
        },
        initialPos: pos.clone(),
        color: new THREE.Color(0x60a5fa),
        baseScale: lobMesh.scale.clone(),
      });
    });
    // Ring 2: Department Nodes around their LOB
    const deptPositions = new Map<string, THREE.Vector3>();
    departmentsByLob.forEach((deptsSet, lob) => {
      const lobPos = lobPositions.get(lob);
      if (!lobPos) return;
      const deptsArray = Array.from(deptsSet);
      deptsArray.forEach((dept, di) => {
        const angle = (di / deptsArray.length) * Math.PI * 2;
        const deptDist = 14;
        const dx = Math.cos(angle) * deptDist;
        const dz = Math.sin(angle) * deptDist;
        const dy = (Math.sin(angle) - 0.5) * 8;
        const pos = new THREE.Vector3(lobPos.x + dx, lobPos.y + dy, lobPos.z + dz);
        const deptKey = `${lob}-${dept}`;
        deptPositions.set(deptKey, pos);
        const deptMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          emissive: 0x334155,
          emissiveIntensity: 0.4,
          roughness: 0.4,
        });
        const deptMesh = new THREE.Mesh(sphereGeo, deptMat);
        deptMesh.scale.set(1.8, 1.8, 1.8);
        deptMesh.position.copy(pos);
        scene.add(deptMesh);
        // Connect Department to LOB
        const lineGeo = new THREE.BufferGeometry().setFromPoints([lobPos, pos]);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x64748b,
          transparent: true,
          opacity: 0.35,
        });
        linesGroup.add(new THREE.Line(lineGeo, lineMat));
        const deptWorkflows = workflows.filter((w) => w.lob === lob && w.department === dept);
        nodes.push({
          mesh: deptMesh,
          data: {
            id: `dept-${deptKey}`,
            name: `${dept} (${lob})`,
            type: 'department',
            lob,
            department: dept,
            workflowCount: deptWorkflows.length,
            avgRisk:
              deptWorkflows.reduce((acc, w) => acc + getTierNumber(w.risk_tier), 0) /
              (deptWorkflows.length || 1),
          },
          initialPos: pos.clone(),
          color: new THREE.Color(0x94a3b8),
          baseScale: deptMesh.scale.clone(),
        });
      });
    });
    // Ring 3: Citizen Developer / Employee Workflow Nodes
    workflows.forEach((w, wi) => {
      const deptKey = `${w.lob}-${w.department}`;
      const parentPos = deptPositions.get(deptKey) || lobPositions.get(w.lob);
      if (!parentPos) return;
      const angle = (wi / workflows.length) * Math.PI * 4;
      const radius = 6 + (wi % 3) * 2.5;
      const ex = Math.cos(angle) * radius;
      const ez = Math.sin(angle) * radius;
      const ey = ((wi % 5) - 2) * 2;
      const pos = new THREE.Vector3(parentPos.x + ex, parentPos.y + ey, parentPos.z + ez);
      const tierNum = getTierNumber(w.risk_tier);
      const isRed = tierNum === 4 || !w.training_current || (w.status === 'In review' && tierNum >= 3);
      const isOrange = tierNum === 3 && !isRed;
      const isYellow = tierNum === 2;
      let hexColor = 0x10b981; // Green
      let emissiveColor = 0x064e3b;
      if (isRed) {
        hexColor = 0xf43f5e; // Crimson Red
        emissiveColor = 0x881337;
      } else if (isOrange) {
        hexColor = 0xf97316; // Orange
        emissiveColor = 0x7c2d12;
      } else if (isYellow) {
        hexColor = 0xeab308; // Yellow
        emissiveColor = 0x713f12;
      }
      const empMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.7,
        roughness: 0.3,
        metalness: 0.4,
      });
      const empMesh = new THREE.Mesh(sphereGeo, empMat);
      const scale = isRed ? 1.4 : isOrange ? 1.2 : 1.0;
      empMesh.scale.set(scale, scale, scale);
      empMesh.position.copy(pos);
      scene.add(empMesh);
      // Connect Employee to Department/Manager
      const lineGeo = new THREE.BufferGeometry().setFromPoints([parentPos, pos]);
      const lineMat = new THREE.LineBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: isRed ? 0.6 : 0.25,
      });
      linesGroup.add(new THREE.Line(lineGeo, lineMat));
      nodes.push({
        mesh: empMesh,
        data: {
          id: `emp-${w.id}`,
          name: `${w.owner_name} (${w.owner_role})`,
          type: 'employee',
          lob: w.lob,
          department: w.department,
          manager: `${w.lob} Director / Program Lead`,
          workflow: w,
          riskTier: tierNum,
          overdue: w.status === 'In review',
          trainingLapsed: !w.training_current,
        },
        initialPos: pos.clone(),
        color: new THREE.Color(hexColor),
        baseScale: empMesh.scale.clone(),
      });
    });
    // 7. Raycasting & Interaction Logic
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredEntity: Node3DEntity | null = null;
    // Camera Orbit State
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const spherical = new THREE.Spherical(110, Math.PI / 3, Math.PI / 4);
    const updateCameraPosition = () => {
      spherical.radius = Math.max(25, Math.min(220, spherical.radius));
      camera.position.setFromSpherical(spherical);
      camera.lookAt(cameraTarget);
    };
    updateCameraPosition();
    const handlePointerDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(x, y);
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        spherical.theta -= deltaX * 0.006;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY * 0.006));
        updateCameraPosition();
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };
    const handlePointerUp = () => {
      isDragging = false;
    };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.08;
      updateCameraPosition();
    };
    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes.map((n) => n.mesh));
      if (intersects.length > 0) {
        const hit = nodes.find((n) => n.mesh === intersects[0].object);
        if (hit) {
          // Animate camera gently toward clicked node
          cameraTarget.copy(hit.mesh.position);
          spherical.radius = 45;
          updateCameraPosition();
          if (hit.data.type === 'employee' && hit.data.workflow) {
            onSelectWorkflowRef.current?.(hit.data.workflow);
          } else if (hit.data.type === 'lob' && hit.data.lob) {
            onFilterLOBRef.current?.(hit.data.lob);
          }
        }
      }
    };
    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);
    // 8. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      // Auto-rotation when not user-dragging
      if (autoRotateRef.current && !isDragging) {
        spherical.theta += delta * 0.15;
        updateCameraPosition();
      }
      // Gentle floating animation on nodes
      const time = clock.getElapsedTime();
      nodes.forEach((n, idx) => {
        if (n.data.type !== 'enterprise') {
          n.mesh.position.y = n.initialPos.y + Math.sin(time * 1.5 + idx) * 0.4;
        }
      });
      // Raycast detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes.map((n) => n.mesh));
      if (intersects.length > 0) {
        const hit = nodes.find((n) => n.mesh === intersects[0].object);
        if (hit && hit !== hoveredEntity) {
          if (hoveredEntity) {
            hoveredEntity.mesh.scale.copy(hoveredEntity.baseScale);
          }
          hoveredEntity = hit;
          hit.mesh.scale.multiplyScalar(1.4);
          setHoveredNode(hit.data);
          // Position HUD tooltip
          const pos2D = hit.mesh.position.clone().project(camera);
          const screenX = ((pos2D.x + 1) * width) / 2 + container.getBoundingClientRect().left;
          const screenY = ((-pos2D.y + 1) * height) / 2 + container.getBoundingClientRect().top;
          setHoverPos({ x: screenX, y: screenY });
        }
      } else {
        if (hoveredEntity) {
          hoveredEntity.mesh.scale.copy(hoveredEntity.baseScale);
          hoveredEntity = null;
          setHoveredNode(null);
          setHoverPos(null);
        }
      }
      renderer.render(scene, camera);
    };
    animate();
    // 9. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      scene.traverse((object) => {
        const renderable = object as THREE.Mesh;
        renderable.geometry?.dispose();
        const materials = Array.isArray(renderable.material)
          ? renderable.material
          : renderable.material
            ? [renderable.material]
            : [];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [workflows, lobs, departmentsByLob]);
  return (
    <RiskNetworkViewport
      containerRef={containerRef}
      workflows={workflows}
      hoveredNode={hoveredNode}
      hoverPos={hoverPos}
      autoRotate={autoRotate}
      isFullscreen={isFullscreen}
      onSelectWorkflow={onSelectWorkflow}
      onToggleAutoRotate={() => setAutoRotate((current) => !current)}
      onToggleFullscreen={() => setIsFullscreen((current) => !current)}
    />
  );
};
