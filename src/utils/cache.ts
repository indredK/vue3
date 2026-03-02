interface CacheItem<T> {
  value: T
  expireTime: number
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000

  set<T>(key: string, value: T, ttl?: number): void {
    const expireTime = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expireTime })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expireTime) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expireTime) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  getSize(): number {
    return this.cache.size
  }

  cleanup(): number {
    let removed = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireTime) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }
}

class LocalStorageCache {
  private prefix: string = 'cache_'
  private defaultTTL: number = 5 * 60 * 1000

  set<T>(key: string, value: T, ttl?: number): void {
    const expireTime = Date.now() + (ttl || this.defaultTTL)
    const item: CacheItem<T> = { value, expireTime }
    localStorage.setItem(this.prefix + key, JSON.stringify(item))
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(this.prefix + key)
    if (!raw) return null

    try {
      const item: CacheItem<T> = JSON.parse(raw)

      if (Date.now() > item.expireTime) {
        this.delete(key)
        return null
      }

      return item.value
    } catch {
      return null
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  clear(): void {
    const keysToDelete: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key))
  }

  cleanup(): number {
    let removed = 0
    const keysToDelete: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        const raw = localStorage.getItem(key)
        if (raw) {
          try {
            const item = JSON.parse(raw)
            if (Date.now() > item.expireTime) {
              keysToDelete.push(key)
            }
          } catch {
            keysToDelete.push(key)
          }
        }
      }
    }

    keysToDelete.forEach(key => {
      localStorage.removeItem(key)
      removed++
    })

    return removed
  }
}

class SessionCache {
  private prefix: string = 'session_'
  private defaultTTL: number = 30 * 60 * 1000

  set<T>(key: string, value: T, ttl?: number): void {
    const expireTime = Date.now() + (ttl || this.defaultTTL)
    const item: CacheItem<T> = { value, expireTime }
    sessionStorage.setItem(this.prefix + key, JSON.stringify(item))
  }

  get<T>(key: string): T | null {
    const raw = sessionStorage.getItem(this.prefix + key)
    if (!raw) return null

    try {
      const item: CacheItem<T> = JSON.parse(raw)

      if (Date.now() > item.expireTime) {
        this.delete(key)
        return null
      }

      return item.value
    } catch {
      return null
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    sessionStorage.removeItem(this.prefix + key)
  }

  clear(): void {
    const keysToDelete: string[] = []

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => sessionStorage.removeItem(key))
  }
}

export const memoryCache = new MemoryCache()
export const localCache = new LocalStorageCache()
export const sessionCache = new SessionCache()

export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKey: string | ((...args: Parameters<T>) => string),
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey

    const cached = memoryCache.get(key)
    if (cached !== null) {
      return Promise.resolve(cached)
    }

    return fn(...args).then(result => {
      memoryCache.set(key, result, ttl)
      return result
    })
  }) as T
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}
