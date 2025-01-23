interface CacheData<K extends string, V> {
  order: K[];
  items: Record<K, V>;
}

export class LRUCache<K extends string, V> {
  private capacity: number
  private storageKey: string
  
  constructor(capacity: number, namespace: string = 'lru') {
    this.capacity = capacity
    this.storageKey = `${namespace}_cache`
    
    // Initialize cache if it doesn't exist
    if (typeof window !== 'undefined' && !localStorage.getItem(this.storageKey)) {
      this.saveCache({
        order: [],
        items: {} as Record<K, V>
      })
    }
  }

  private getCache(): CacheData<K, V> {
    if (typeof window === 'undefined') {
      return { order: [], items: {} as Record<K, V> };
    }
    return JSON.parse(localStorage.getItem(this.storageKey) || '{"order":[],"items":{}}')
  }

  private saveCache(cache: CacheData<K, V>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(cache))
  }

  get(key: K): V | undefined {
    const cache = this.getCache()
    
    if (!(key in cache.items)) return undefined

    // Update access order
    cache.order = [
      key,
      ...cache.order.filter(k => k !== key)
    ]
    
    this.saveCache(cache)
    return cache.items[key]
  }

  set(key: K, value: V): void {
    const cache = this.getCache()

    // If key exists, just update it and refresh its position
    if (key in cache.items) {
      cache.items[key] = value
      cache.order = [
        key,
        ...cache.order.filter(k => k !== key)
      ]
      this.saveCache(cache)
      return
    }

    // If at capacity, remove oldest item
    if (cache.order.length >= this.capacity) {
      const oldest = cache.order.pop()
      if (oldest) {
        delete cache.items[oldest]
      }
    }

    // Add new item
    cache.items[key] = value
    cache.order = [key, ...cache.order]
    this.saveCache(cache)
  }

  clear(): void {
    this.saveCache({
      order: [],
      items: {} as Record<K, V>
    })
  }
} 