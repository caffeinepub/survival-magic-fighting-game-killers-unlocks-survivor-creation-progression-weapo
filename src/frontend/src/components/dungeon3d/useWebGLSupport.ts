import { useState, useEffect } from 'react';

interface WebGLSupport {
  isSupported: boolean;
  error: string | null;
}

export function useWebGLSupport(): WebGLSupport {
  const [support, setSupport] = useState<WebGLSupport>({
    isSupported: true,
    error: null,
  });

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setSupport({
          isSupported: false,
          error: 'WebGL is not supported in your browser. Please use a modern browser to view the 3D dungeon.',
        });
      }
    } catch (error) {
      setSupport({
        isSupported: false,
        error: 'Unable to initialize 3D graphics. Please check your browser settings.',
      });
    }
  }, []);

  return support;
}
