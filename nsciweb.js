// Import necessary libraries
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".hero-content");
  const canvasContainer = document.getElementById("atomCanvas");
  const changeModelButton = document.getElementById("changeModelButton");

  let isScrolling = false;
  let currentModel = "atom_gltf";
  let object;
  let controls;
  let mixer;
  let isCanvasFocused = false; // Flag to track canvas focus state

  // Scroll Handling for navigation between sections
  function scrollToSection(index) {
    isScrolling = true;
    sections[index].scrollIntoView({ behavior: "smooth" });
    setTimeout(() => (isScrolling = false), 500);
  }

  // Mouse enter/leave to track focus on the canvas
  canvasContainer.addEventListener("mouseenter", () => {
    isCanvasFocused = true; // Mouse is inside canvas area
  });

  canvasContainer.addEventListener("mouseleave", () => {
    isCanvasFocused = false; // Mouse left the canvas area
  });

  // Scene Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvasContainer.appendChild(renderer.domElement);

  // Lights Setup
  const topLight = new THREE.DirectionalLight(0xffffff, 2);
  topLight.position.set(500, 500, 500);
  scene.add(topLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const fillLight1 = new THREE.PointLight(0xffffff, 1.5, 1000);
  fillLight1.position.set(-500, 500, 500);
  scene.add(fillLight1);

  const fillLight2 = new THREE.PointLight(0xffffff, 1.5, 1000);
  fillLight2.position.set(500, -500, 500);
  scene.add(fillLight2);

  const backLight = new THREE.DirectionalLight(0xffffff, 1);
  backLight.position.set(0, 0, -500);
  scene.add(backLight);

  // Controls Setup
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true; // Allow zooming with mouse wheel
  controls.enablePan = true; // Disable panning for now

  // Model Loader
  const loader = new GLTFLoader();

  function loadModel(name) {
    if (object) {
      scene.remove(object);
      object = null;
      if (mixer) {
        mixer.stopAllAction(); // Stop all animations
        mixer = null; // Reset the mixer
      }
    }

    loader.load(
      `./models/${name}/scene.gltf`,
      (gltf) => {
        object = gltf.scene;
        if (name === "atom_gltf") {
          object.scale.set(0.05, 0.05, 0.05);
          object.position.set(0, -5, 0);
        } else if (name === "dna_gltf") {
          object.scale.set(0.02, 0.02, 0.02);
          object.position.set(0, -30, 0);
        } else if (name === "earth_gltf") {
          object.scale.set(3, 3, 3);
          object.position.set(0, -10, 0);
        } else {
          object.scale.set(0.05, 0.05, 0.05);
          object.position.set(0, -5, 0);
        }

        scene.add(object);

        if (gltf.animations && gltf.animations.length) {
          mixer = new THREE.AnimationMixer(gltf.scene);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }

        camera.position.z = name === "earth_gltf" ? 50 : (name === "dna_gltf" ? 40 : 25);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );
  }

  

  // Initial model load
  loadModel(currentModel);

  let isButtonCooldown = false; // Cooldown flag

changeModelButton.addEventListener("click", () => {
  if (isButtonCooldown) return; // If cooldown is active, ignore the click

  isButtonCooldown = true; // Activate cooldown
  
  console.log('Preloading Earth model...');
const preloadLoader = new GLTFLoader();
preloadLoader.load('./models/earth_gltf/scene.gltf', (gltf) => {
  console.log('Earth model preloaded');
});

  // Switch models
  if (currentModel === "atom_gltf") {
    currentModel = "dna_gltf";
  } else if (currentModel === "dna_gltf") {
    currentModel = "earth_gltf";
  } else if (currentModel === "earth_gltf") {
    currentModel = "atom_gltf";
  }
  loadModel(currentModel);

  // Set a cooldown duration (e.g., 1 second)
  setTimeout(() => {
    isButtonCooldown = false; // Deactivate cooldown after 1 second
  }, 3000); // Cooldown duration in milliseconds
});

  // Prevent Right-Click Menu
  canvasContainer.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // Prevent the context menu from showing on right-click
  });

  // Modify OrbitControls to use Right-Click for Panning (dragging)
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN, // Right-click will now be used for panning
  };

  // Prevent page scrolling only when canvas is focused (mouse hovering over it)
  window.addEventListener("wheel", (event) => {
    if (isCanvasFocused) {
      event.preventDefault(); // Stop page scroll
    }
  }, { passive: false });

  // Scroll Navigation Logic (Smooth Scroll between sections)
  window.addEventListener("wheel", (event) => {
    if (isScrolling || isCanvasFocused) return; // Don't scroll if canvas is focused
    const current = getCurrentSection();
    if (event.deltaY > 0 && current < sections.length - 1) {
      scrollToSection(current + 1);
    } else if (event.deltaY < 0 && current > 0) {
      scrollToSection(current - 1);
    }
  });

  function getCurrentSection() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    return Array.from(sections).findIndex((section) => {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + rect.height;
      return scrollPosition >= top && scrollPosition < bottom;
    });
  }

  // Animate function
  function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
      mixer.update(0.001);
    }

    renderer.render(scene, camera);
  }

  // Mouse movement handling
  

  // Resize listener
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
});

