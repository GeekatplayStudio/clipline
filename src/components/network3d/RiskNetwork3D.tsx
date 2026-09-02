// src/components/network3d/RiskNetwork3D.tsx
// Justification: Full WebGL 3D Interactive Organizational Risk Web built with Three.js.
// Provides 360-degree rotation, zoom, pan, raycast hover inspection, manager-employee hierarchy links, and risk-tier color coding.

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Workflow } from '../../types/workflow.js';
import { NodeDetailOverlay, GraphNodeData, getTierNumber } from './NodeDetailOverlay';
import { RotateCw, Maximize2, Minimize2 } from 'lucide-react';

interface RiskNetwork3DProps {
  workflows: Workflow[];
  onSelectWorkflow?: (workflow: Workflow) => void;
  onFilterLOB?: (lob: string) => void;
}

interface Node3DEntity {
  mesh: THREE.Mesh;
  data: GraphNodeData;
  initialPos: THREE.Vector3;
  color: THREE.Color;
}

export const RiskNetwork3D: React.FC<RiskNetwork3DProps> = ({
  workflows,
  onSelectWorkflow,
  onFilterLOB,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNodeData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Group workflows by LOB and Department
  const { lobs, departmentsByLob } = useMemo(() => {
    const lobsSet = new Set<string>();
    const deptsMap = new Map<string, Set<string>>();

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
    let cameraTarget = new THREE.Vector3(0, 0, 0);
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
    });

    // Ring 1: LOB Nodes
    const lobPositions = new Map<string, THREE.Vector3>();
    const lobMeshes = new Map<string, THREE.Mesh>();
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

        const deptWorkflows = workflows.filter(
          (w) => w.lob === lob && w.department === dept
        );
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
              deptWorkflows.reduce((acc, w) => acc + getTierNumber(w.risk_tier), 0) / (deptWorkflows.length || 1),
          },
          initialPos: pos.clone(),
          color: new THREE.Color(0x94a3b8),
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
      const isRed =
        tierNum === 4 ||
        !w.training_current ||
        (w.status === 'In review' && tierNum >= 3);
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
      });
    });

    // 7. Raycasting & Interaction Logic
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredEntity: Node3DEntity | null = null;

    // Camera Orbit State
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = new THREE.Spherical(110, Math.PI / 3, Math.PI / 4);

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

          if (hit.data.type === 'employee' && hit.data.workflow && onSelectWorkflow) {
            onSelectWorkflow(hit.data.workflow);
          } else if (hit.data.type === 'lob' && hit.data.lob && onFilterLOB) {
            onFilterLOB(hit.data.lob);
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
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Auto-rotation when not user-dragging
      if (autoRotate && !isDragging) {
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
            hoveredEntity.mesh.scale.set(
              hoveredEntity.data.type === 'enterprise' ? 4.5 : hoveredEntity.data.type === 'lob' ? 2.8 : 1.2,
              hoveredEntity.data.type === 'enterprise' ? 4.5 : hoveredEntity.data.type === 'lob' ? 2.8 : 1.2,
              hoveredEntity.data.type === 'enterprise' ? 4.5 : hoveredEntity.data.type === 'lob' ? 2.8 : 1.2
            );
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
          hoveredEntity.mesh.scale.set(
            hoveredEntity.data.type === 'enterprise' ? 4.5 : hoveredEntity.data.type === 'lob' ? 2.8 : 1.2,
            hoveredEntity.data.type === 'enterprise' ? 4.5 : hoveredEntity.data.type === 'lob' ? 2.8 : 1.2,
            hoveredEntity.data.type === 'enterprise' ? 4.5 : hoveredEntity.data.type === 'lob' ? 2.8 : 1.2
          );
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
      renderer.dispose();
    };
  }, [workflows, autoRotate, lobs, departmentsByLob, onSelectWorkflow, onFilterLOB]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0a0f1d] transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[580px]'
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Tooltip */}
      <NodeDetailOverlay
        node={hoveredNode}
        position={hoverPos}
        onSelectWorkflow={onSelectWorkflow}
      />

      {/* Top Banner & Telemetry Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-white tracking-tight">
              3D Enterprise Governance Topology
            </span>
          </div>
          <span className="text-slate-500 text-xs">|</span>
          <span className="text-xs text-slate-300 font-mono">
            {workflows.length} Nodes Governed Across 5 LOBs
          </span>
        </div>

        {/* Action Controls */}
        <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              autoRotate ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Orbit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend & Navigation Guide */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-none">
        {/* Risk Color Legend */}
        <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/90 shadow-lg pointer-events-auto flex flex-wrap items-center gap-3.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            <span className="text-slate-300 font-medium">Critical / Prohibited (Red)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            <span className="text-slate-300 font-medium">Tier 3 High (Orange)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            <span className="text-slate-300 font-medium">Tier 2 Moderate (Yellow)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-slate-300 font-medium">Tier 1 Governed (Green)</span>
          </div>
        </div>

        {/* Interaction Hint */}
        <div className="bg-slate-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono hidden md:block">
          🖱 Drag: Rotate 360° | 📜 Scroll: Zoom | 👆 Click Node: Inspect
        </div>
      </div>
    </div>
  );
};
