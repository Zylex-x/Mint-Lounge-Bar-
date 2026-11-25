import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("mint-scene");
const host = document.querySelector(".hero-3d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && host) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, host.clientWidth / host.clientHeight, .1, 100);
    camera.position.set(0, 0, 7);

    const group = new THREE.Group();
    scene.add(group);

    const coreGeometry = new THREE.TorusKnotGeometry(1.12, .32, 190, 28, 2, 5);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xb77e58,
      metalness: .78,
      roughness: .2,
      clearcoat: 1,
      clearcoatRoughness: .1,
      emissive: 0x24150c,
      emissiveIntensity: .34
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(.68, 2),
      new THREE.MeshPhysicalMaterial({ color: 0x596c50, metalness: .48, roughness: .26, clearcoat: .8, transparent: true, opacity: .9 })
    );
    group.add(inner);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd5a47d, transparent: true, opacity: .74 });
    const ringOne = new THREE.Mesh(new THREE.TorusGeometry(2.05, .009, 8, 180), ringMaterial);
    ringOne.rotation.x = 1.12;
    ringOne.rotation.y = .28;
    group.add(ringOne);
    const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(2.28, .006, 8, 180), new THREE.MeshBasicMaterial({ color: 0x8ca17c, transparent: true, opacity: .45 }));
    ringTwo.rotation.x = .5;
    ringTwo.rotation.y = -.8;
    group.add(ringTwo);

    const starGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 170; i++) {
      const radius = 2.7 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi));
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xd7b18e, size: .018, transparent: true, opacity: .7 }));
    scene.add(stars);

    const keyLight = new THREE.PointLight(0xf2c8a2, 48, 12);
    keyLight.position.set(3, 3, 4);
    scene.add(keyLight);
    const greenLight = new THREE.PointLight(0x718d64, 34, 11);
    greenLight.position.set(-3, -2, 1);
    scene.add(greenLight);
    scene.add(new THREE.AmbientLight(0xc7b49c, 1.25));

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    host.addEventListener("pointermove", event => {
      const rect = host.getBoundingClientRect();
      pointer.tx = ((event.clientX - rect.left) / rect.width - .5) * 1.2;
      pointer.ty = ((event.clientY - rect.top) / rect.height - .5) * 1.2;
    }, { passive: true });
    host.addEventListener("pointerleave", () => { pointer.tx = 0; pointer.ty = 0; }, { passive: true });

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    };
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(host);
    else window.addEventListener("resize", resize);

    let frame = 0;
    const clock = new THREE.Clock();
    const render = () => {
      frame = requestAnimationFrame(render);
      const time = clock.getElapsedTime();
      pointer.x += (pointer.tx - pointer.x) * .035;
      pointer.y += (pointer.ty - pointer.y) * .035;
      group.rotation.y = (reduceMotion ? 0 : time * .12) + pointer.x * .2;
      group.rotation.x = pointer.y * .14 + Math.sin(time * .35) * .04;
      core.rotation.z = reduceMotion ? 0 : Math.sin(time * .28) * .1;
      inner.rotation.y = -time * .1;
      ringOne.rotation.z = reduceMotion ? .2 : time * .12;
      ringTwo.rotation.z = reduceMotion ? -.4 : -time * .08;
      group.position.y = reduceMotion ? 0 : Math.sin(time * .7) * .09;
      stars.rotation.y = reduceMotion ? 0 : time * .012;
      renderer.render(scene, camera);
    };
    render();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else if (!document.hidden) render();
    });
  } catch (error) {
    console.warn("3D rendering unavailable; decorative CSS fallback remains visible.", error);
  }
}
