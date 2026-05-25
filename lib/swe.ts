// Singleton Swiss Ephemeris (WASM) instance, configured for Vedic (sidereal,
// Lahiri ayanamsa). Loaded once per server process.

type SwissEphInstance = any;

let instancePromise: Promise<SwissEphInstance> | null = null;

export async function getSwe(): Promise<SwissEphInstance> {
  if (!instancePromise) {
    instancePromise = (async () => {
      const mod = await import("swisseph-wasm");
      const SwissEph = (mod as any).default ?? mod;
      const swe = new SwissEph();
      await swe.initSwissEph();
      // Lahiri ayanamsa is the Indian government standard for Jyotish.
      swe.set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);
      return swe;
    })();
  }
  return instancePromise;
}

// Moshier ephemeris needs no data files (ARM64/serverless safe) and is
// accurate to well under an arc-second for modern dates. Sidereal + speed.
export function calcFlags(swe: SwissEphInstance): number {
  return swe.SEFLG_MOSEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;
}
