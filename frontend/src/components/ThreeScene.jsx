import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Float, Stars, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Shield({ scrollRef }) {
  const meshRef = useRef()
  const ringRef = useRef()
  const cA = useRef(new THREE.Color('#6025C0'))
  const cB = useRef(new THREE.Color('#3b0764'))

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const sp = scrollRef.current
    if (meshRef.current?.material) {
      let tc, te
      if (sp < 0.38)      { tc = '#6025C0'; te = '#3b0764' }
      else if (sp < 0.72) { tc = '#ef4444'; te = '#7f1d1d' }
      else                { tc = '#22c55e'; te = '#14532d' }
      meshRef.current.material.color.lerp(cA.current.set(tc), 0.07)
      meshRef.current.material.emissive.lerp(cB.current.set(te), 0.07)
      meshRef.current.material.distort = 0.18 + Math.sin(t * 0.6) * 0.07
      meshRef.current.material.emissiveIntensity = 0.55 + Math.sin(t * 0.9) * 0.2
    }
    if (ringRef.current?.material) {
      ringRef.current.material.emissiveIntensity = 2 + Math.sin(t * 1.6) * 1
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.7}>
      <group>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.6, 64, 64]} />
          <MeshDistortMaterial
            color="#6025C0"
            distort={0.22}
            speed={1.8}
            roughness={0.05}
            metalness={0.9}
            emissive="#3b0764"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.05, 0.016, 16, 100]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2.8, 0.5, 0]}>
          <torusGeometry args={[2.15, 0.007, 16, 100]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  )
}

function TrackerRing({ radius, count, speed, color, tilt = 0, scrollRef }) {
  const groupRef = useRef()
  const positions = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2
      return [Math.cos(a) * radius, 0, Math.sin(a) * radius]
    }),
    [radius, count]
  )
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const sp = scrollRef.current
    const vp = sp < 0.38 ? 0 : sp < 0.72 ? (sp - 0.38) / 0.34 : sp < 1 ? 1 - (sp - 0.72) / 0.28 : 0
    groupRef.current.scale.setScalar(1 + vp * 0.65)
    groupRef.current.rotation.y = clock.elapsedTime * speed * (1 + vp * 0.9)
  })
  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function FloatingParticles() {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(900 * 3)
    for (let i = 0; i < 900; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 28
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [])
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.02
      ref.current.rotation.x = clock.elapsedTime * 0.008
    }
  })
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial size={0.022} color="#7c3aed" sizeAttenuation transparent opacity={0.4} depthWrite={false} />
    </Points>
  )
}

function Scene({ scrollRef }) {
  const groupRef = useRef()
  useFrame(({ mouse, camera }) => {
    const sp = scrollRef.current
    const arc = sp < 0.5 ? sp * 2 : (1 - sp) * 2
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 9 - arc * 2.5, 0.04)
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * -0.12, 0.04)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.12, 0.04)
    }
  })
  return (
    <group ref={groupRef}>
      <Shield scrollRef={scrollRef} />
      <TrackerRing radius={2.9} count={10} speed={0.32}  color="#ef4444" tilt={0.45}  scrollRef={scrollRef} />
      <TrackerRing radius={3.9} count={15} speed={-0.18} color="#f59e0b" tilt={-0.55} scrollRef={scrollRef} />
      <FloatingParticles />
    </group>
  )
}

export default function ThreeScene({ scrollRef }) {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 60 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.1} />
      <pointLight position={[6, 6, 6]}    intensity={3.5} color="#7c3aed" />
      <pointLight position={[-8, -4, -6]} intensity={1.8} color="#06B6D4" />
      <pointLight position={[0, -7, 4]}   intensity={0.9} color="#a78bfa" />
      <Stars radius={100} depth={70} count={3500} factor={3} saturation={0} fade speed={0.4} />
      <Suspense fallback={null}>
        <Scene scrollRef={scrollRef} />
      </Suspense>
    </Canvas>
  )
}
