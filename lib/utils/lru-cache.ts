export class LRUCache<K, V> {
  private capacity: number
  private cache: Map<K, V>

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined

    // Get the value and refresh it by deleting and setting again
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value!)
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // If key exists, refresh it
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // If at capacity, delete oldest item (first item in Map)
      this.cache.delete(this.cache.keys().next().value)
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }
} 