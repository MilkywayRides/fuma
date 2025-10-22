'use client';

import { useEffect, useState, useCallback } from 'react';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(true);

  return { socket: null, isConnected };
}
