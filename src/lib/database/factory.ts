/**
 * Database Provider Factory
 * Allows switching between different database providers based on configuration
 * Includes automatic fallback when primary provider is unhealthy
 */

import { DatabaseProvider, DatabaseProviderType } from './interface';
import { SupabaseProvider } from './supabase-provider';
import { FirebaseProvider } from './firebase-provider';

// Provider instances (singleton pattern)
const providers: Record<DatabaseProviderType, DatabaseProvider> = {
  supabase: new SupabaseProvider(),
  firebase: new FirebaseProvider(),
  pocketbase: new SupabaseProvider(), // Placeholder - use Supabase for now
};

// Configuration
const PRIMARY_PROVIDER = (import.meta.env.VITE_DATABASE_PROVIDER as DatabaseProviderType) || 'supabase';
const FALLBACK_PROVIDERS: DatabaseProviderType[] = ['supabase', 'firebase'];
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

let currentProvider: DatabaseProvider = providers[PRIMARY_PROVIDER];
let lastHealthCheck: number = 0;
let isHealthy: boolean = true;

/**
 * Get the current active database provider
 */
export function getDatabaseProvider(): DatabaseProvider {
  return currentProvider;
}

/**
 * Get provider by name
 */
export function getProviderByName(name: DatabaseProviderType): DatabaseProvider {
  return providers[name];
}

/**
 * Check health of current provider and switch if needed
 */
export async function checkProviderHealth(): Promise<void> {
  const now = Date.now();

  // Only check every HEALTH_CHECK_INTERVAL
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return;
  }

  lastHealthCheck = now;

  try {
    console.log(`🏥 Health check for ${currentProvider.name}...`);
    const healthy = await currentProvider.isHealthy();

    if (!healthy && isHealthy) {
      // Provider just became unhealthy
      console.warn(`⚠️ ${currentProvider.name} is unhealthy, attempting fallback...`);
      isHealthy = false;
      await attemptFallback();
    } else if (healthy && !isHealthy) {
      // Provider recovered
      console.log(`✅ ${currentProvider.name} has recovered`);
      isHealthy = true;
    }
  } catch (error) {
    console.error('Health check failed:', error);
    if (isHealthy) {
      isHealthy = false;
      await attemptFallback();
    }
  }
}

/**
 * Attempt to switch to a fallback provider
 */
async function attemptFallback(): Promise<void> {
  for (const providerName of FALLBACK_PROVIDERS) {
    if (providerName === currentProvider.name) continue;

    const provider = providers[providerName];
    console.log(`🔄 Trying fallback provider: ${provider.name}`);

    try {
      const healthy = await provider.isHealthy();
      if (healthy) {
        console.log(`✅ Switching to ${provider.name}`);
        currentProvider = provider;
        isHealthy = true;

        // Show notification to user
        showProviderSwitchNotification(provider.name);
        return;
      }
    } catch (error) {
      console.error(`Failed to switch to ${provider.name}:`, error);
    }
  }

  console.error('❌ All providers are unhealthy!');
  showAllProvidersDownNotification();
}

/**
 * Manually switch to a specific provider
 */
export async function switchProvider(providerName: DatabaseProviderType): Promise<boolean> {
  const provider = providers[providerName];

  try {
    const healthy = await provider.isHealthy();
    if (!healthy) {
      console.warn(`Cannot switch to ${providerName}: provider is unhealthy`);
      return false;
    }

    currentProvider = provider;
    isHealthy = true;
    console.log(`✅ Manually switched to ${providerName}`);
    return true;
  } catch (error) {
    console.error(`Failed to switch to ${providerName}:`, error);
    return false;
  }
}

/**
 * Get current provider name
 */
export function getCurrentProviderName(): string {
  return currentProvider.name;
}

/**
 * Get provider health status
 */
export function getProviderHealth(): { name: string; healthy: boolean } {
  return {
    name: currentProvider.name,
    healthy: isHealthy
  };
}

// Notification helpers (can be enhanced with toast system)
function showProviderSwitchNotification(providerName: string) {
  console.log(`🔔 Sistema cambiado a ${providerName} automáticamente`);
  // TODO: Integrate with toast notification system
  // toast.info(`Sistema cambiado a ${providerName} automáticamente`);
}

function showAllProvidersDownNotification() {
  console.error('🔔 Todos los proveedores de base de datos están caídos');
  // TODO: Integrate with toast notification system
  // toast.error('Error de conexión. Por favor verifica tu internet.');
}

// Start periodic health checks
if (typeof window !== 'undefined') {
  setInterval(checkProviderHealth, HEALTH_CHECK_INTERVAL);
}
