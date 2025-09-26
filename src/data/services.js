// Unified services provider backed by Supabase.
// Exports the same API as the previous utils/servicesProvider:
// - getAllServices()
// - getServiceByAppointmentType(appointmentType)

import { supabase } from "../supabase"
import fallback from "./services.json"

const TABLE = "services"
const LS_CACHE_KEY = "servicesApiCacheV1" // { services: [], ts: number }
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let inMemoryCache = null // { services: [], ts }

function readLocalCache() {
    try {
        const raw = localStorage.getItem(LS_CACHE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch (_) {
        return null
    }
}

function writeLocalCache(services) {
    try {
        const payload = { services, ts: Date.now() }
        localStorage.setItem(LS_CACHE_KEY, JSON.stringify(payload))
    } catch (_) {}
}

async function fetchFromSupabase() {
    const { data, error } = await supabase
        .from(TABLE)
        .select("id, title, description, features, duration, price, icon, appointmentType")
        .order("title", { ascending: true })

    if (error) throw error

    const rows = Array.isArray(data) ? data : []
    // Map DB rows to app's expected shape
    return rows.map((row) => {
        // Handle price as single number from jsonb column
        const priceValue = Number(row?.price || 0)
        return {
            id: row.id,
            title: row.title,
            description: row.description || "",
            features: Array.isArray(row.features) ? row.features : [],
            duration: row.duration || "",
            icon: row.icon || "Heart",
            appointmentType: row.appointmentType || "",
            // Store single price value for admin UI
            price: priceValue,
            // price object maintains backwards compatibility with existing UI
            priceObject: {
                min: priceValue,
                max: priceValue,
                inr: { min: priceValue, max: priceValue },
            },
        }
    })
}

function refreshInBackground() {
    fetchFromSupabase()
        .then((services) => {
            inMemoryCache = { services, ts: Date.now() }
            writeLocalCache(services)
        })
        .catch(() => {})
}

export function getAllServices() {
    // 0) Admin override (if present, always prefer)
    try {
        const overrideRaw = localStorage.getItem(LS_OVERRIDE_KEY)
        if (overrideRaw) {
            const override = JSON.parse(overrideRaw)
            if (Array.isArray(override?.services)) {
                return override.services
            }
        }
    } catch (_) {}

    // 1) In-memory cache (fastest)
    if (inMemoryCache && Date.now() - inMemoryCache.ts < CACHE_TTL_MS) {
        return inMemoryCache.services
    }

    // 2) LocalStorage cache (fast)
    const local = readLocalCache()
    if (local && Date.now() - local.ts < CACHE_TTL_MS) {
        inMemoryCache = local
        // refresh in background
        refreshInBackground()
        return local.services
    }

    // 3) Fallback to bundled JSON and kick off background refresh
    const services = fallback?.services || []
    inMemoryCache = { services, ts: Date.now() }
    refreshInBackground()
    return services
}

export function getServiceByAppointmentType(appointmentType) {
    const services = getAllServices()
    return services.find((s) => s.appointmentType === appointmentType)
}

/**
 * A robust helper to extract the price from a service object.
 * It handles multiple possible data structures for the price property.
 * @param {object} service - The service object.
 * @returns {number} The price of the service, defaulting to 500 if not found.
 */
export function getServicePrice(service) {
  if (!service || service.price == null) {
    return 500; // Default price
  }

  // Case 1: price is a number (preferred format)
  if (typeof service.price === 'number') {
    return service.price;
  }

  // Case 2: price is an object (legacy format from old data structures)
  if (typeof service.price === 'object' && service.price !== null) {
    if (service.price.inr && service.price.inr.min != null) {
      return service.price.inr.min;
    }
    if (service.price.min != null) {
      return service.price.min;
    }
  }

  // Fallback to default price if the structure is unexpected
  return 500;
}

// Optional: keep temporary local draft helpers for Admin panel compatibility
const LS_OVERRIDE_KEY = "servicesOverride"

export function saveAllServices(services) {
    if (!Array.isArray(services)) return false
    try {
        localStorage.setItem(LS_OVERRIDE_KEY, JSON.stringify({ services }))
        return true
    } catch (_) {
        return false
    }
}

export function resetServicesToDefault() {
    try {
        localStorage.removeItem(LS_OVERRIDE_KEY)
        return true
    } catch (_) {
        return false
    }
}

// Publish array of services to Supabase (upsert by id)
export async function publishAllServices(services) {
    if (!Array.isArray(services)) throw new Error("Invalid services payload")
    const isValidUuid = (v) => typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v)
    
    // Separate services with valid UUIDs (for upsert) from new services (for insert)
    const servicesToUpsert = []
    const servicesToInsert = []
    
    services.forEach((s) => {
        const priceValue = Number(s?.price || 0)
        
        const row = {
            title: s.title,
            description: s.description || "",
            features: Array.isArray(s.features) ? s.features : [],
            duration: s.duration || "",
            price: priceValue, // Store as single number in jsonb
            icon: s.icon || "Heart",
            appointmentType: s.appointmentType || "",
        }
        
        if (isValidUuid(s.id)) {
            row.id = s.id
            servicesToUpsert.push(row)
        } else {
            servicesToInsert.push(row)
        }
    })
    
    // Upsert existing services
    if (servicesToUpsert.length > 0) {
        const { error: upsertError } = await supabase.from(TABLE).upsert(servicesToUpsert, { onConflict: "id" })
        if (upsertError) throw upsertError
    }
    
    // Insert new services (let Supabase generate UUIDs)
    if (servicesToInsert.length > 0) {
        const { error: insertError } = await supabase.from(TABLE).insert(servicesToInsert)
        if (insertError) throw insertError
    }

    try {
        // Invalidate caches so consumers pick up fresh data
        inMemoryCache = null
        localStorage.removeItem(LS_CACHE_KEY)
    } catch (_) {}

    return true
}

// Delete a service by ID from Supabase
export async function deleteServiceById(id) {
    if (!id) throw new Error("Service ID is required")
    const { error } = await supabase.from(TABLE).delete().eq("id", id)
    if (error) throw error
    
    // Invalidate caches
    inMemoryCache = null
    localStorage.removeItem(LS_CACHE_KEY)
    return true
}

// Update a single service in Supabase
export async function updateServiceById(id, serviceData) {
    if (!id) throw new Error("Service ID is required")
    if (!serviceData) throw new Error("Service data is required")
    
    const priceValue = Number(serviceData?.price || 0)
    
    const updateData = {
        title: serviceData.title,
        description: serviceData.description || "",
        features: Array.isArray(serviceData.features) ? serviceData.features : [],
        duration: serviceData.duration || "",
        price: priceValue, // Store as single number in jsonb
        icon: serviceData.icon || "Heart",
        appointmentType: serviceData.appointmentType || "",
    }
    
    const { error } = await supabase.from(TABLE).update(updateData).eq("id", id)
    if (error) throw error
    
    // Invalidate caches
    inMemoryCache = null
    localStorage.removeItem(LS_CACHE_KEY)
    return true
}

// Async API for consumers that want fresh data reliably (no background race)
export async function getAllServicesAsync() {
    // 0) Admin override wins, if present
    try {
        const overrideRaw = localStorage.getItem(LS_OVERRIDE_KEY)
        if (overrideRaw) {
            const override = JSON.parse(overrideRaw)
            if (Array.isArray(override?.services)) {
                return override.services
            }
        }
    } catch (_) {}

    // 1) Use in-memory cache if fresh
    if (inMemoryCache && Date.now() - inMemoryCache.ts < CACHE_TTL_MS) {
        return inMemoryCache.services
    }

    // 2) Try Supabase directly
    try {
        const services = await fetchFromSupabase()
        inMemoryCache = { services, ts: Date.now() }
        writeLocalCache(services)
        return services
    } catch (_) {}

    // 3) Fallback to localStorage cache if available
    const local = readLocalCache()
    if (local && Array.isArray(local.services)) {
        inMemoryCache = local
        return local.services
    }

    // 4) Final fallback to bundled JSON
    const services = fallback?.services || []
    inMemoryCache = { services, ts: Date.now() }
    return services
}


