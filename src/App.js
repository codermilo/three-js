// src/App.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import './App.css';

const App = () => {
  const canvasRef = useRef();
  const cursor = useRef({ x: 0, y: 0 });
  const scrollY = useRef(window.scrollY);
  const currentSection = useRef(0);

  useEffect(() => {
    // Scene
    const scene = new THREE.Scene();

    // Objects
    const objectsDistance = 4;
    const material = new THREE.MeshToonMaterial({ color: '#ffeded' });

    const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
    const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
    const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material);

    mesh1.position.set(2, -objectsDistance * 0, 0);
    mesh2.position.set(-2, -objectsDistance * 1, 0);
    mesh3.position.set(2, -objectsDistance * 2, 0);

    const sectionMeshes = [mesh1, mesh2, mesh3];
    scene.add(mesh1, mesh2, mesh3);

    // Particles
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: '#ffeded',
      sizeAttenuation: true,
      size: 0.03,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lights
    const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
    directionalLight.position.set(1, 1, 0);
    scene.add(directionalLight);

    // Sizes
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Camera
    const cameraGroup = new THREE.Group();
    scene.add(cameraGroup);

    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = 6;
    cameraGroup.add(camera);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Resize handling
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // Scroll handling
    const handleScroll = () => {
      scrollY.current = window.scrollY;
      const newSection = Math.round(scrollY.current / sizes.height);

      if (newSection !== currentSection.current) {
        currentSection.current = newSection;
        gsap.to(sectionMeshes[currentSection.current].rotation, {
          duration: 1.5,
          ease: 'power2.inOut',
          x: '+=6',
          y: '+=3',
        });
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Mouse move handling
    const handleMouseMove = (event) => {
      cursor.current.x = event.clientX / sizes.width - 0.5;
      cursor.current.y = event.clientY / sizes.height - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const clock = new THREE.Clock();
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const deltaTime = elapsedTime - (clock.oldTime || 0);
      clock.oldTime = elapsedTime;

      // Rotate meshes
      sectionMeshes.forEach((mesh) => {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
      });

      // Animate camera
      camera.position.y = (-scrollY.current / sizes.height) * objectsDistance;
      const parallaxX = cursor.current.x * 0.5;
      const parallaxY = -cursor.current.y * 0.5;

      cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
      cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

      // Render
      renderer.render(scene, camera);

      // Call tick again on the next frame
      requestAnimationFrame(tick);
    };
    tick();

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="App">
      <canvas ref={canvasRef} className="webgl"></canvas>
    </div>
  );
};

export default App;
